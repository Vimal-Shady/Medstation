"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

type Medicine = {
  name: string
  stock_quantity: number
}

export function Overview() {
  const [medicineData, setMedicineData] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/medicines/chart")
        if (!response.ok) throw new Error("Failed to fetch medicine data")
        const data = await response.json()
        setMedicineData(
          Array.isArray(data)
            ? data.map((item: any) => ({
                name: item.name,
                stock_quantity: item.value,
              }))
            : [],
        )
      } catch (error) {
        console.error("Error fetching medicine data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const renderMedicineChart = (medicines: Medicine[]) => {
    const chartData = medicines
      .sort((a, b) => b.stock_quantity - a.stock_quantity)
      .slice(0, 7)
      .map((medicine) => ({
        name: medicine.name,
        total: medicine.stock_quantity,
      }))

    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip />
          <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Medicines by Stock</CardTitle>
            <CardDescription>Most stocked medicines in inventory</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {loading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : medicineData.length > 0 ? (
              renderMedicineChart(medicineData)
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                No medicine data available
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Analytics Tab */}
      <TabsContent value="analytics" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Medicine Stock Trends</CardTitle>
            <CardDescription>Simulated monthly stock trends</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {loading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : medicineData.length > 0 ? (
              <LineChart
                data={{
                  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                  datasets: [
                    {
                      label: "Total Stock",
                      data: Array(12)
                        .fill(0)
                        .map(() =>
                          Math.round(
                            (medicineData.reduce((sum, item) => sum + item.stock_quantity, 0) *
                              (0.8 + Math.random() * 0.4)) /
                              12,
                          ),
                        ),
                      borderColor: "#ffffff", // Changed to white for better visibility
                      backgroundColor: "rgba(255, 255, 255, 0.2)", // Semi-transparent white
                      fill: true,
                      tension: 0.4, // Add some curve to the line
                    },
                  ],
                }}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)", // Light grid lines
                      },
                      ticks: {
                        color: "#ffffff", // White text for y-axis
                      },
                    },
                    x: {
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)", // Light grid lines
                      },
                      ticks: {
                        color: "#ffffff", // White text for x-axis
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: "#ffffff", // White text for legend
                      },
                    },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.7)", // Dark tooltip background
                      titleColor: "#ffffff", // White title text
                      bodyColor: "#ffffff", // White body text
                    },
                  },
                }}
                className="aspect-auto"
              />
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                No medicine data available
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
