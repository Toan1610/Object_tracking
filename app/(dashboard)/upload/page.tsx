import { UploadForm } from "@/components/upload/upload-form"

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Upload & Analyze</h1>
        <p className="text-muted-foreground">Upload your images or videos for AI-powered computer vision analysis</p>
      </div>
      <UploadForm />
    </div>
  )
}
