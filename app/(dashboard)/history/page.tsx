import { UploadHistoryComponent } from "@/components/history/upload-history"

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Upload History</h1>
        <p className="text-muted-foreground">View and manage your previous AI analysis results</p>
      </div>
      <UploadHistoryComponent />
    </div>
  )
}
