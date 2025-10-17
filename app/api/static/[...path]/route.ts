import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join("/")
    const FASTAPI_URL = process.env.FASTAPI_URL || "http://backend:8000"
    
    console.log(`[DEBUG] Proxying static file: ${FASTAPI_URL}/static/${path}`)
    
    const response = await fetch(`${FASTAPI_URL}/static/${path}`)
    
    console.log(`[DEBUG] Backend response status: ${response.status}`)
    
    if (!response.ok) {
      console.log(`[DEBUG] Backend returned error: ${response.status} ${response.statusText}`)
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }
    
    const buffer = await response.arrayBuffer()
    const headers = new Headers()
    
    // Set appropriate content type based on file extension
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      headers.set('Content-Type', 'image/jpeg')
    } else if (path.endsWith('.png')) {
      headers.set('Content-Type', 'image/png')
    } else if (path.endsWith('.gif')) {
      headers.set('Content-Type', 'image/gif')
    } else if (path.endsWith('.webp')) {
      headers.set('Content-Type', 'image/webp')
    }
    
    return new NextResponse(buffer, { headers })
  } catch (error) {
    console.error("Static file proxy error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 