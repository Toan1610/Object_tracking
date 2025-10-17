import argparse
import json
import os
import cv2
import time
import numpy as np
from pathlib import Path
from PIL import Image

from ultralytics import YOLO

# SAM import chỉ khi cần
def run_sam(image_path, model_path):
    from segment_anything import sam_model_registry, SamPredictor

    STATIC_DIR = Path(__file__).parent / "static" / "results"
    STATIC_DIR.mkdir(parents=True, exist_ok=True)

    sam = sam_model_registry["vit_b"](checkpoint=model_path)
    predictor = SamPredictor(sam)
    image = np.array(Image.open(image_path))
    predictor.set_image(image)

    input_point = np.array([[image.shape[1] // 2, image.shape[0] // 2]])
    input_label = np.array([1])
    masks, _, _ = predictor.predict(point_coords=input_point, point_labels=input_label)

    mask = masks[0]
    filename = Path(image_path).stem + "_sam_mask.png"
    output_path = STATIC_DIR / filename
    cv2.imwrite(str(output_path), mask.astype(np.uint8) * 255)

    return {
        "model": "SAM",
        "resultType": "mask",
        "imageUrl": f"/static/results/{filename}",
    }


def run_yolo(image_path, model_path):
    start_time = time.time()
    STATIC_DIR = Path(__file__).parent / "static" / "results"
    STATIC_DIR.mkdir(parents=True, exist_ok=True)

    model = YOLO(model_path)
    results = model(image_path)[0]

    detections = []
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not read image: {image_path}")
    
    for box in results.boxes:
        cls = int(box.cls[0])
        conf = float(box.conf[0])
        xyxy = box.xyxy[0].tolist()
        label = results.names[cls]
        detections.append({
            "class": label,
            "confidence": round(conf, 4),
            "bbox": [round(x, 2) for x in xyxy]
        })

        x1, y1, x2, y2 = map(int, xyxy)
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(image, f"{label} {conf:.2f}", (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

    filename = Path(image_path).stem + "_annotated.jpg"
    annotated_path = STATIC_DIR / filename
    cv2.imwrite(str(annotated_path), image)

    end_time = time.time()
    processing_time_ms = int((end_time - start_time) * 1000)

    return {
        "model": "YOLO11n",
        "resultType": "bbox",
        "detections": len(detections),
        "classes": list({d["class"] for d in detections}),
        "result": detections,
        "imageUrl": f"/static/results/{filename}",
        "processingTime": processing_time_ms
    }


def run_video_inference(video_path, model_path, model_type="yolo"):
    model = YOLO(model_path)
    cap = cv2.VideoCapture(video_path)

    STATIC_DIR = Path(__file__).parent / "static" / "results"
    STATIC_DIR.mkdir(parents=True, exist_ok=True)

    output_path = STATIC_DIR / (Path(video_path).stem + "_output.mp4")
    fourcc = cv2.VideoWriter_fourcc(*"mp4v") #type: ignore
    fps = cap.get(cv2.CAP_PROP_FPS)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out = cv2.VideoWriter(str(output_path), fourcc, fps, (w, h))

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break

        results = model(frame)[0]
        for box in results.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            xyxy = box.xyxy[0].tolist()
            label = results.names[cls]
            x1, y1, x2, y2 = map(int, xyxy)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, f"{label} {conf:.2f}", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

        out.write(frame)

    cap.release()
    out.release()

    return {"videoUrl": f"/static/results/{output_path.name}"}


def run_model(image_path, model_name):
    model_map = {
        "yolo11n": str(Path(__file__).parent / "models" / "yolo11n.pt"),
        "sam": str(Path(__file__).parent / "models" / "sam_vit_b_01ec64.pth")
    }

    if model_name not in model_map:
        return {"error": f"Unsupported model: {model_name}"}

    model_path = model_map[model_name]

    if not os.path.exists(model_path):
        return {"error": f"Model file not found: {model_path}"}

    try:
        if model_name == "yolo11n":
            return run_yolo(image_path, model_path)
        elif model_name == "sam":
            return run_sam(image_path, model_path)
    except Exception as e:
        return {"error": f"Model inference error: {str(e)}"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, help="Path to input image")
    parser.add_argument("--model", required=True, help="Model name: yolo11n / sam")
    args = parser.parse_args()

    result = run_model(args.source, args.model)
    print(json.dumps(result))
