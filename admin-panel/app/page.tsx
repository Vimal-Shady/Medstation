import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentSales } from "@/components/recent-sales"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMedicineStats, getDoctorStats, getVendingMachineStats } from "@/lib/data"
import DashboardLayout from "@/components/dashboard-layout"
import { ErrorBoundary } from "@/components/error-boundary"

export const dynamic = "force-dynamic"

export default async function Dashboard() {
  let medicineStats = { totalMedicines: 0, lowStockCount: 0 }
  let doctorStats = { totalDoctors: 0, totalPrescriptions: 0 }
  let vendingMachineStats = { totalMachines: 0, lowStockMachines: 0 }

  try {
    medicineStats = await getMedicineStats()
    doctorStats = await getDoctorStats()
    vendingMachineStats = await getVendingMachineStats()
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    // Use default values defined above
  }

  const { totalMedicines, lowStockCount } = medicineStats
  const { totalDoctors, totalPrescriptions } = doctorStats
  const { totalMachines, lowStockMachines } = vendingMachineStats

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button>Check for Updates</Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalMedicines}</div>
                  <p className="text-xs text-muted-foreground">{lowStockCount} medicines low in stock</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vending Machines</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalMachines}</div>
                  <p className="text-xs text-muted-foreground">{lowStockMachines} machines need restocking</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Doctors</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalDoctors}</div>
                  <p className="text-xs text-muted-foreground">Active healthcare providers</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalPrescriptions}</div>
                  <p className="text-xs text-muted-foreground">Total prescriptions issued</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Medicine Stock Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ErrorBoundary fallback={<p>Error loading chart data</p>}>
                    <Overview />
                  </ErrorBoundary>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Prescriptions</CardTitle>
                  <CardDescription>Latest medicines prescribed by doctors</CardDescription>
                </CardHeader>
                <CardContent>
                  <ErrorBoundary fallback={<p>Error loading recent prescriptions</p>}>
                    <RecentSales />
                  </ErrorBoundary>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-muted/50 dark:bg-muted/20">
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>Medicine stock trends over time</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ErrorBoundary fallback={<p>Error loading analytics data</p>}>
                  <Overview />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
