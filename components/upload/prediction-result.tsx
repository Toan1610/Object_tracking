"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Download, Eye, Target, Zap } from "lucide-react"
import Image from "next/image"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface PredictionResultProps {
  result: {
    detections: number
    confidence?: number
    classes?: string[]
    imageUrl?: string
    processingTime?: number | string
    result?: { class: string; confidence: number; bbox: number[] }[]
  }
  filename: string
  model: string
}

export function PredictionResult({ result, filename, model }: PredictionResultProps) {
  console.log("Result received:", result)
  const resultList = result.result

  // Tính thời gian xử lý (ms → s), chấp nhận cả number và string
  const processingTimeInSec =
    typeof result.processingTime === "number"
      ? result.processingTime / 1000
      : typeof result.processingTime === "string" && !isNaN(Number(result.processingTime))
      ? Number(result.processingTime) / 1000
      : null

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    })
    element.href = URL.createObjectURL(file)
    element.download = `${filename}_results.json`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleExportCSV = () => {
    if (!Array.isArray(resultList)) return
    const csv = resultList
      .map((d) => `${d.class},${d.confidence},${d.bbox.join(",")}`)
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_results.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Analysis Results</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Analysis completed for {filename} using {model}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{result.detections}</p>
                    <p className="text-xs text-muted-foreground">Detections</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {Array.isArray(resultList) && resultList.length > 0
                        ? `${(
                            (resultList.reduce((sum, d) => sum + d.confidence, 0) /
                              resultList.length) *
                            100
                          ).toFixed(1)}%`
                        : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Avg Confidence
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {processingTimeInSec !== null ? `${processingTimeInSec.toFixed(2)}s` : "?"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Processing Time
                  </p>
                </div>
              </div>
            </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Detected Classes */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Detected Objects</h3>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(result.classes) && result.classes.length > 0 ? (
                result.classes.map((className, index) => (
                  <Badge key={index} variant="secondary">
                    {className}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No classes detected
                </p>
              )}
            </div>
          </div>

          {/* Annotated Image */}
          {result.imageUrl ? (
            <div>
              <h3 className="text-lg font-semibold mb-3">Annotated Result</h3>
              <div className="relative w-full max-w-2xl mx-auto">
                <Image
                  src={result.imageUrl}
                  alt="Analysis result"
                  width={800}
                  height={600}
                  className="rounded-lg border"
                />
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-3">Annotated Result</h3>
              <p className="text-sm text-muted-foreground">
                No annotated image available from server.
              </p>
            </div>
          )}

          {/* Class Distribution Chart */}
          {Array.isArray(result.result) && result.result.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Statistics</h3>
              <Card>
                <CardContent className="pt-6">
                  {(() => {
                    const classDistribution = result.result?.reduce(
                      (acc, cur) => {
                        acc[cur.class] = (acc[cur.class] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>
                    )

                    const chartData = Object.entries(
                      classDistribution
                    ).map(([cls, count]) => ({
                      name: cls,
                      count,
                    }))

                    return (
                      <>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={chartData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>

                        <ul className="text-sm mt-4">
                          {Object.entries(classDistribution).map(
                            ([cls, count]) => (
                              <li key={cls}>
                                <strong>{cls}</strong>: {count}
                              </li>
                            )
                          )}
                        </ul>
                      </>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Raw JSON */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Raw Results</h3>
            <Card>
              <CardContent className="pt-6">
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
