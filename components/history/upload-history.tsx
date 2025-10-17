"use client"

import React, { useState, useMemo, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Search, Download, Trash2, Eye } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts"

import { useAuth } from "@/hooks/use-auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type UploadHistory = {
  id: string
  filename: string
  model: string
  detections: number
  created_at: string
  classes: string[]
  raw_result: any
}

export function UploadHistoryComponent() {
  const { user } = useAuth()
  const [history, setHistory] = useState<UploadHistory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedResult, setSelectedResult] = useState<UploadHistory | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const [page, setPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return

      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching:", error.message)
        return
      }

      const safeData = data.map((item) => ({
        ...item,
        classes: Array.isArray(item.classes) ? item.classes : []
      }))
      setHistory(safeData)
    }

    fetchHistory()
  }, [user])

  useEffect(() => {
    setPage(1)
  }, [searchTerm])

  // Filtered history
  const filteredHistory = useMemo(() => {
    return history.filter(
      (item) =>
        item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [history, searchTerm])

  // Reset to page 1 when search term changes
  useEffect(() => {
    setPage(1)
  }, [searchTerm])

  // Pagination logic
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const paginatedHistory = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return filteredHistory.slice(start, start + itemsPerPage)
  }, [filteredHistory, page])

  const handleDelete = async (id: string) => {
    await supabase.from("predictions").delete().eq("id", id)
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }

  const handleDownload = (raw_result: any, filename: string) => {
    const element = document.createElement("a")
    const file = new Blob([JSON.stringify(raw_result, null, 2)], {
      type: "application/json"
    })
    element.href = URL.createObjectURL(file)
    element.download = `${filename}_result.json`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })

  const getClassDistribution = () => {
    const classCount: Record<string, number> = {}
    history.forEach((item) => {
      if (Array.isArray(item.classes)) {
        item.classes.forEach((cls) => {
          classCount[cls] = (classCount[cls] || 0) + 1
        })
      }
    })
    return Object.entries(classCount).map(([key, value]) => ({
      name: key,
      count: value
    }))
  }

  const PaginationControls = () => (
    <div className="flex justify-end space-x-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage((p) => Math.max(p - 1, 1))}
        disabled={page === 1}
      >
        Previous
      </Button>
      <span className="text-sm text-muted-foreground self-center">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        disabled={page === totalPages}
      >
        Next
      </Button>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Upload History</CardTitle>
            <CardDescription>All predictions logged in Supabase database</CardDescription>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search filename/model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No prediction history found.
            </p>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Detections</TableHead>
                      <TableHead>Classes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.filename}</TableCell>
                        <TableCell>{item.model}</TableCell>
                        <TableCell>{formatDate(item.created_at)}</TableCell>
                        <TableCell>{item.detections}</TableCell>
                        <TableCell className="flex flex-wrap gap-1">
                          {item.classes.length > 0 ? (
                            item.classes.map((cls, idx) => (
                              <Badge key={idx} variant="secondary">
                                {cls}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedResult(item)
                                setShowDetail(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(item.raw_result, item.filename)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredHistory.length > itemsPerPage && <PaginationControls />}
            </>
          )}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Class Distribution</CardTitle>
            <CardDescription>Overview of detected object categories</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getClassDistribution()}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {showDetail && selectedResult && (
        <Card>
          <CardHeader>
            <CardTitle>Details for {selectedResult.filename}</CardTitle>
            <CardDescription>Full result preview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <strong>Model:</strong> {selectedResult.model} <br />
              <strong>Detections:</strong> {selectedResult.detections} <br />
              <strong>Date:</strong> {formatDate(selectedResult.created_at)}
            </div>

            <div>
              <strong>Classes:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedResult.classes.map((cls, idx) => (
                  <Badge key={idx} variant="secondary">
                    {cls}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <strong>Raw Result:</strong>
              <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                {JSON.stringify(selectedResult.raw_result, null, 2)}
              </pre>
            </div>

            <Button variant="outline" onClick={() => setShowDetail(false)}>
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
