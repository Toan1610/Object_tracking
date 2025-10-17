"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileImage, FileVideo, Loader2 } from "lucide-react"
import { AVAILABLE_MODELS } from "@/lib/types"
import { PredictionResult } from "./prediction-result"
import { useAuth } from "@/hooks/use-auth"


export function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [model, setModel] = useState("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const { user } = useAuth()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validTypes = ["image/jpeg", "image/png", "video/mp4"]
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile)
        setError("")
      } else {
        setError("Please select a valid file type (.jpg, .png, .mp4)")
        setFile(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !model) {
      setError("Please select a file and model")
      return
    }

    setUploading(true)
    setProgress(0)
    setError("")

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("model", model)
      formData.append("user_id", user.id)

      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        throw new Error("Prediction failed")
      }

      const data = await response.json()
      setResult(data)

      // Save to history
      const historyItem = {
        id: Date.now().toString(),
        filename: file.name,
        model: AVAILABLE_MODELS.find((m) => m.value === model)?.label || model,
        uploadDate: new Date().toISOString(),
        status: "completed" as const,
        resultSummary: `${data.detections} detections found`,
      }

      const history = JSON.parse(localStorage.getItem("upload_history") || "[]")
      history.unshift(historyItem)
      localStorage.setItem("upload_history", JSON.stringify(history.slice(0, 50))) // Keep last 50
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const resetForm = () => {
    setFile(null)
    setModel("")
    setResult(null)
    setError("")
    setProgress(0)
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Prediction Results</h2>
          <Button onClick={resetForm} variant="outline">
            Upload Another File
          </Button>
        </div>
        <PredictionResult result={result} filename={file?.name || ""} model={model} />
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload File for Analysis</span>
        </CardTitle>
        <CardDescription>Select an image or video file and choose a model for AI analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="file">File Upload</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      {file.type.startsWith("image/") ? (
                        <FileImage className="w-8 h-8 mb-2 text-muted-foreground" />
                      ) : (
                        <FileVideo className="w-8 h-8 mb-2 text-muted-foreground" />
                      )}
                      <p className="text-sm text-muted-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG, MP4 (MAX. 100MB)</p>
                    </>
                  )}
                </div>
                <Input
                  id="file"
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.mp4"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">AI Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model for analysis" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((modelOption) => (
                  <SelectItem key={modelOption.value} value={modelOption.value}>
                    {modelOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!file || !model || uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Analyze File
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
