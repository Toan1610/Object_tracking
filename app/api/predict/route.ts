import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const model = formData.get("model") as string
    const user_id = formData.get("user_id") as string

    if (!file || !model) {
      return NextResponse.json({ error: "File and model are required" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const blob = new Blob([buffer], { type: file.type })

    const forwardForm = new FormData()
    forwardForm.append("file", blob, file.name)
    forwardForm.append("model", model)
    forwardForm.append("user_id", user_id || "")

    // Gọi đến FastAPI server
    const FASTAPI_URL = process.env.FASTAPI_URL || "http://backend:8000"

    const response = await fetch(`${FASTAPI_URL}/predict`, {
      method: "POST",
      body: forwardForm,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const result = await response.json()

    // ✅ Gắn prefix nếu là đường dẫn tương đối
    if (result.imageUrl && result.imageUrl.startsWith("/static/")) {
      result.imageUrl = `/api${result.imageUrl}`
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
