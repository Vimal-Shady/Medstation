import { getNotifications } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCircle } from "lucide-react"
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/actions"
import DashboardLayout from "@/components/dashboard-layout"

export default async function NotificationsPage() {
  const notifications = await getNotifications()

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <form action={markAllNotificationsAsRead}>
            <Button variant="outline" type="submit">
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>
          </form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Stock Alerts</CardTitle>
            <CardDescription>Notifications about low stock in vending machines</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No notifications at this time
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <TableRow key={notification.id} className={notification.read ? "" : "bg-muted/50"}>
                      <TableCell>
                        <Bell className={`h-5 w-5 ${notification.read ? "text-muted-foreground" : "text-primary"}`} />
                      </TableCell>
                      <TableCell className="font-medium">{notification.message}</TableCell>
                      <TableCell>{notification.machine_code}</TableCell>
                      <TableCell>{notification.medicine_name}</TableCell>
                      <TableCell>
                        {notification.read ? (
                          <Badge variant="outline">Read</Badge>
                        ) : (
                          <Badge variant="default">New</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(notification.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <form action={markNotificationAsRead}>
                          <input type="hidden" name="notificationId" value={notification.id} />
                          <Button type="submit" variant="ghost" size="sm" disabled={notification.read}>
                            Mark as Read
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
