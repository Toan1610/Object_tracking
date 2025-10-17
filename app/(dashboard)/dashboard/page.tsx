"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, History, Target, Zap, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { UploadHistory } from "@/lib/types"
import { supabase } from "@/lib/client"

export default function DashboardPage() {
  const { user } = useAuth()
  const [recentUploads, setRecentUploads] = useState<UploadHistory[]>([])
  const [stats, setStats] = useState({
    totalUploads: 0,
    successfulAnalyses: 0,
    avgProcessingTime: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .order("created_at", { ascending: false })
  
      if (error) {
        console.error("Failed to fetch Supabase predictions:", error)
        return
      }
  
      // Gán dữ liệu cho recent uploads (chỉ lấy 5 cái gần nhất)
      setRecentUploads(data.slice(0, 5).map((d) => ({
        id: d.id,
        filename: d.filename,
        model: d.model,
        status: "completed", // hoặc kiểm tra logic tùy bạn
        uploadDate: d.created_at,
      })))
  
      // Thống kê
      const total = data.length
      const successful = data.length // nếu bạn luôn lưu sau khi phân tích thành công
      const avgTime = successful > 0
        ? Math.round(
            data.reduce((sum, d) => sum + (d.raw_result?.processingTime || 0), 0) / successful / 1000
          )
        : 0
  
      setStats({
        totalUploads: total,
        successfulAnalyses: successful,
        avgProcessingTime: avgTime,
      })
    }
  
    fetchData()
  }, [])
  

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()}, {user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">Welcome back to your AI Vision Dashboard. Ready to analyze some images?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/upload">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-blue-500" />
                <span>Upload & Analyze</span>
              </CardTitle>
              <CardDescription>Upload images or videos for AI-powered analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Start Analysis
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/history">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5 text-green-500" />
                <span>View History</span>
              </CardTitle>
              <CardDescription>Browse your previous analyses and results</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                <History className="mr-2 h-4 w-4" />
                View Results
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalUploads}</p>
                <p className="text-xs text-muted-foreground">Total Uploads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.successfulAnalyses}</p>
                <p className="text-xs text-muted-foreground">Successful Analyses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.avgProcessingTime}s</p>
                <p className="text-xs text-muted-foreground">Avg Processing Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <Link href="/history">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <CardDescription>Your latest AI analysis results</CardDescription>
        </CardHeader>
        <CardContent>
          {recentUploads.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No uploads yet</p>
              <Link href="/upload">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Your First File
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentUploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{upload.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {upload.model} • {new Date(upload.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={upload.status === "completed" ? "default" : "secondary"}>{upload.status}</Badge>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
