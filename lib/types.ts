export interface PredictionResult {
  id: string
  filename: string
  model: string
  uploadDate: string
  status: "processing" | "completed" | "failed"
  result?: {
    detections: number
    confidence: number
    classes: string[]
    imageUrl?: string
  }
}

export interface UploadHistory {
  id: string
  filename: string
  model: string
  uploadDate: string
  status: "processing" | "completed" | "failed"
  resultSummary?: string
}

export const AVAILABLE_MODELS = [
  { label: "YOLO11n Object Detection", value: "yolo11n" },
  { label: "Segment Anything (SAM)", value: "sam" },
  { label: "Mask R-CNN", value: "mask-rcnn" },
]
