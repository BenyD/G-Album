"use client"

import { useState, useMemo } from "react"
import {
  Plus,
  Search,
  Download,
  Eye,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { useRole } from "@/components/admin/role-context"

// Mock data for orders
const mockOrders = [
  {
    id: "ORD-2024-001",
    customerId: "CUST-001",
    customerName: "Rajesh Kumar",
    customerEmail: "rajesh@example.com",
    customerPhone: "+91 98765 43210",
    totalAmount: 25000,
    advancePaid: 10000,
    remainingAmount: 15000,
    status: "In Progress" as const,
    paymentStatus: "Partially Paid" as const,
    orderDate: "2024-01-15",
    expectedDelivery: "2024-02-15",
    description: "Wedding album with 100 photos, premium binding",
    logs: [
      {
        id: 1,
        action: "Order created",
        timestamp: "2024-01-15 10:30 AM",
        user: "Admin",
        details: "Initial order creation with ₹10,000 advance",
      },
      {
        id: 2,
        action: "Email sent",
        timestamp: "2024-01-15 10:31 AM",
        user: "System",
        details: "Order confirmation email sent to rajesh@example.com",
      },
    ],
    emailHistory: [
      {
        id: 1,
        type: "order_created",
        subject: "Order Confirmation - ORD-2024-001",
        sentAt: "2024-01-15 10:31 AM",
        status: "sent",
      },
    ],
  },
  {
    id: "ORD-2024-002",
    customerId: "CUST-002",
    customerName: "Priya Sharma",
    customerEmail: "priya@example.com",
    customerPhone: "+91 87654 32109",
    totalAmount: 15000,
    advancePaid: 15000,
    remainingAmount: 0,
    status: "Delivered" as const,
    paymentStatus: "Fully Paid" as const,
    orderDate: "2024-01-10",
    expectedDelivery: "2024-02-10",
    deliveredDate: "2024-02-08",
    description: "Birthday photo album with custom design",
    logs: [
      {
        id: 1,
        action: "Order created",
        timestamp: "2024-01-10 02:15 PM",
        user: "Admin",
        details: "Order created with full payment",
      },
      {
        id: 2,
        action: "Email sent",
        timestamp: "2024-01-10 02:16 PM",
        user: "System",
        details: "Order confirmation email sent to priya@example.com",
      },
      {
        id: 3,
        action: "Status updated",
        timestamp: "2024-01-25 11:00 AM",
        user: "Admin",
        details: "Status changed to Finished",
      },
      {
        id: 4,
        action: "Email sent",
        timestamp: "2024-01-25 11:01 AM",
        user: "System",
        details: "Order finished notification sent to priya@example.com",
      },
      {
        id: 5,
        action: "Order delivered",
        timestamp: "2024-02-08 04:30 PM",
        user: "Admin",
        details: "Order delivered to customer",
      },
      {
        id: 6,
        action: "Email sent",
        timestamp: "2024-02-08 04:31 PM",
        user: "System",
        details: "Order delivered notification sent to priya@example.com",
      },
    ],
    emailHistory: [
      {
        id: 1,
        type: "order_created",
        subject: "Order Confirmation - ORD-2024-002",
        sentAt: "2024-01-10 02:16 PM",
        status: "sent",
      },
      {
        id: 2,
        type: "status_finished",
        subject: "Your Order is Ready - ORD-2024-002",
        sentAt: "2024-01-25 11:01 AM",
        status: "sent",
      },
      {
        id: 3,
        type: "status_delivered",
        subject: "Order Delivered - ORD-2024-002",
        sentAt: "2024-02-08 04:31 PM",
        status: "sent",
      },
    ],
  },
  {
    id: "ORD-2024-003",
    customerId: "CUST-003",
    customerName: "Amit Patel",
    customerEmail: "amit@example.com",
    customerPhone: "+91 76543 21098",
    totalAmount: 35000,
    advancePaid: 5000,
    remainingAmount: 30000,
    status: "In Progress" as const,
    paymentStatus: "Partially Paid" as const,
    orderDate: "2024-01-20",
    expectedDelivery: "2024-03-20",
    description: "Corporate event photo album with 200+ photos",
    logs: [
      {
        id: 1,
        action: "Order created",
        timestamp: "2024-01-20 09:45 AM",
        user: "Admin",
        details: "Large corporate order with ₹5,000 advance",
      },
      {
        id: 2,
        action: "Email sent",
        timestamp: "2024-01-20 09:46 AM",
        user: "System",
        details: "Order confirmation email sent to amit@example.com",
      },
    ],
    emailHistory: [
      {
        id: 1,
        type: "order_created",
        subject: "Order Confirmation - ORD-2024-003",
        sentAt: "2024-01-20 09:46 AM",
        status: "sent",
      },
    ],
  },
]

// Mock customers data
const mockCustomers = [
  { id: "CUST-001", name: "Rajesh Kumar", email: "rajesh@example.com", phone: "+91 98765 43210" },
  { id: "CUST-002", name: "Priya Sharma", email: "priya@example.com", phone: "+91 87654 32109" },
  { id: "CUST-003", name: "Amit Patel", email: "amit@example.com", phone: "+91 76543 21098" },
  { id: "CUST-004", name: "Sneha Reddy", email: "sneha@example.com", phone: "+91 65432 10987" },
  { id: "CUST-005", name: "Vikram Singh", email: "vikram@example.com", phone: "+91 54321 09876" },
]

type OrderStatus = "In Progress" | "Finished" | "Delivered"
type PaymentStatus = "Unpaid" | "Partially Paid" | "Fully Paid"
type EmailType = "order_created" | "status_in_progress" | "status_finished" | "status_delivered" | "payment_received"

// Email templates
const emailTemplates = {
  order_created: {
    subject: "Order Confirmation - {orderId}",
    content: `Dear {customerName},

Thank you for your order! We have received your order and are excited to work with you.

Order Details:
- Order ID: {orderId}
- Total Amount: ₹{totalAmount}
- Advance Paid: ₹{advancePaid}
- Remaining: ₹{remainingAmount}
- Expected Delivery: {expectedDelivery}

Description: {description}

We will keep you updated on the progress of your order. If you have any questions, please don't hesitate to contact us.

Best regards,
Photo Album Team`,
  },
  status_in_progress: {
    subject: "Order Update - Work Started on {orderId}",
    content: `Dear {customerName},

Great news! We have started working on your order {orderId}.

Our team is now processing your photos and creating your beautiful album. We will notify you once it's ready for delivery.

Expected completion: {expectedDelivery}

Thank you for your patience!

Best regards,
Photo Album Team`,
  },
  status_finished: {
    subject: "Your Order is Ready - {orderId}",
    content: `Dear {customerName},

Excellent news! Your order {orderId} is now ready for pickup/delivery.

Your beautiful photo album has been completed and is ready to be delivered. Please let us know your preferred delivery time.

Order Details:
- Order ID: {orderId}
- Status: Ready for Delivery
- Remaining Payment: ₹{remainingAmount}

We're excited for you to see the final result!

Best regards,
Photo Album Team`,
  },
  status_delivered: {
    subject: "Order Delivered - {orderId}",
    content: `Dear {customerName},

Your order {orderId} has been successfully delivered!

We hope you love your beautiful photo album. Thank you for choosing us for your precious memories.

If you have any feedback or need any assistance, please don't hesitate to reach out.

We look forward to serving you again in the future!

Best regards,
Photo Album Team`,
  },
  payment_received: {
    subject: "Payment Received - {orderId}",
    content: `Dear {customerName},

We have received your payment for order {orderId}.

Payment Details:
- Amount Received: ₹{paymentAmount}
- Total Paid: ₹{totalPaid}
- Remaining Balance: ₹{remainingAmount}

Thank you for your payment!

Best regards,
Photo Album Team`,
  },
}

export default function OrdersPage() {
  const { hasPermission } = useRole()
  const { toast } = useToast()
  const [orders, setOrders] = useState(mockOrders)
  const [customers] = useState(mockCustomers)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")
  const [selectedOrder, setSelectedOrder] = useState<(typeof mockOrders)[0] | null>(null)
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false)
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("active")
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [selectedEmailType, setSelectedEmailType] = useState<EmailType>("order_created")
  const [customEmailContent, setCustomEmailContent] = useState("")
  const [customEmailSubject, setCustomEmailSubject] = useState("")

  // New order form state
  const [newOrder, setNewOrder] = useState({
    customerId: "",
    customerName: "",
    totalAmount: "",
    advancePaid: "",
    orderId: "",
    description: "",
    expectedDelivery: "",
  })

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    notes: "",
  })

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      const matchesPayment = paymentFilter === "all" || order.paymentStatus === paymentFilter

      // Active orders: not delivered or not fully paid
      const isActive = order.status !== "Delivered" || order.paymentStatus !== "Fully Paid"
      const matchesTab = activeTab === "active" ? isActive : !isActive

      return matchesSearch && matchesStatus && matchesPayment && matchesTab
    })

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        case "date-asc":
          return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
        case "amount-desc":
          return b.totalAmount - a.totalAmount
        case "amount-asc":
          return a.totalAmount - b.totalAmount
        case "customer":
          return a.customerName.localeCompare(b.customerName)
        default:
          return 0
      }
    })

    return filtered
  }, [orders, searchTerm, statusFilter, paymentFilter, sortBy, activeTab])

  // Calculate statistics
  const stats = useMemo(() => {
    const activeOrders = orders.filter((order) => order.status !== "Delivered" || order.paymentStatus !== "Fully Paid")
    const completedOrders = orders.filter(
      (order) => order.status === "Delivered" && order.paymentStatus === "Fully Paid",
    )
    const totalRevenue = orders.reduce((sum, order) => sum + order.advancePaid, 0)
    const pendingPayments = orders.reduce((sum, order) => sum + order.remainingAmount, 0)

    return {
      totalOrders: orders.length,
      activeOrders: activeOrders.length,
      completedOrders: completedOrders.length,
      totalRevenue,
      pendingPayments,
    }
  }, [orders])

  // Email sending function (mock)
  const sendEmail = async (order: any, emailType: EmailType, customContent?: string, customSubject?: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const template = emailTemplates[emailType]
    const subject =
      customSubject || template.subject.replace("{orderId}", order.id).replace("{customerName}", order.customerName)

    const content =
      customContent ||
      template.content
        .replace(/\{orderId\}/g, order.id)
        .replace(/\{customerName\}/g, order.customerName)
        .replace(/\{totalAmount\}/g, order.totalAmount.toLocaleString())
        .replace(/\{advancePaid\}/g, order.advancePaid.toLocaleString())
        .replace(/\{remainingAmount\}/g, order.remainingAmount.toLocaleString())
        .replace(/\{expectedDelivery\}/g, new Date(order.expectedDelivery).toLocaleDateString())
        .replace(/\{description\}/g, order.description)

    // Add email to history
    const emailRecord = {
      id: (order.emailHistory?.length || 0) + 1,
      type: emailType,
      subject,
      sentAt: new Date().toLocaleString(),
      status: "sent" as const,
    }

    // Add log entry
    const logEntry = {
      id: order.logs.length + 1,
      action: "Email sent",
      timestamp: new Date().toLocaleString(),
      user: "Admin",
      details: `${emailType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} email sent to ${order.customerEmail}`,
    }

    return { emailRecord, logEntry, subject, content }
  }

  const getStatusBadge = (status: OrderStatus) => {
    const variants = {
      "In Progress": "bg-blue-100 text-blue-800",
      Finished: "bg-green-100 text-green-800",
      Delivered: "bg-gray-100 text-gray-800",
    }
    return <Badge className={variants[status]}>{status}</Badge>
  }

  const getPaymentBadge = (status: PaymentStatus) => {
    const variants = {
      Unpaid: "bg-red-100 text-red-800",
      "Partially Paid": "bg-yellow-100 text-yellow-800",
      "Fully Paid": "bg-green-100 text-green-800",
    }
    return <Badge className={variants[status]}>{status}</Badge>
  }

  const handleCreateOrder = async () => {
    const orderId = newOrder.orderId || `ORD-2024-${String(orders.length + 1).padStart(3, "0")}`
    const customer = customers.find((c) => c.id === newOrder.customerId)

    if (!customer) return

    const order = {
      id: orderId,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      totalAmount: Number.parseInt(newOrder.totalAmount),
      advancePaid: Number.parseInt(newOrder.advancePaid),
      remainingAmount: Number.parseInt(newOrder.totalAmount) - Number.parseInt(newOrder.advancePaid),
      status: "In Progress" as const,
      paymentStatus: (Number.parseInt(newOrder.advancePaid) === 0
        ? "Unpaid"
        : Number.parseInt(newOrder.advancePaid) === Number.parseInt(newOrder.totalAmount)
          ? "Fully Paid"
          : "Partially Paid") as PaymentStatus,
      orderDate: new Date().toISOString().split("T")[0],
      expectedDelivery: newOrder.expectedDelivery,
      description: newOrder.description,
      logs: [
        {
          id: 1,
          action: "Order created",
          timestamp: new Date().toLocaleString(),
          user: "Admin",
          details: `Order created with ₹${newOrder.advancePaid} advance payment`,
        },
      ],
      emailHistory: [],
    }

    try {
      // Send order creation email automatically
      const emailResult = await sendEmail(order, "order_created")

      // Add email record and log to order
      order.emailHistory = [emailResult.emailRecord]
      order.logs.push(emailResult.logEntry)

      setOrders([...orders, order])
      setNewOrder({
        customerId: "",
        customerName: "",
        totalAmount: "",
        advancePaid: "",
        orderId: "",
        description: "",
        expectedDelivery: "",
      })
      setIsCreateOrderOpen(false)

      toast({
        title: "Order Created Successfully",
        description: `Order ${orderId} has been created and confirmation email sent to ${customer.email}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order or send email",
        variant: "destructive",
      })
    }
  }

  const handleAddPayment = async () => {
    if (!selectedOrder || !paymentForm.amount) return

    const amount = Number.parseInt(paymentForm.amount)
    const updatedOrder = {
      ...selectedOrder,
      advancePaid: selectedOrder.advancePaid + amount,
      remainingAmount: selectedOrder.remainingAmount - amount,
      logs: [
        ...selectedOrder.logs,
        {
          id: selectedOrder.logs.length + 1,
          action: "Payment received",
          timestamp: new Date().toLocaleString(),
          user: "Admin",
          details: `Payment of ₹${amount} received. ${paymentForm.notes ? `Notes: ${paymentForm.notes}` : ""}`,
        },
      ],
    }

    // Update payment status
    if (updatedOrder.remainingAmount <= 0) {
      updatedOrder.paymentStatus = "Fully Paid"
      updatedOrder.remainingAmount = 0
    } else if (updatedOrder.advancePaid > 0) {
      updatedOrder.paymentStatus = "Partially Paid"
    }

    try {
      // Send payment received email automatically
      const emailResult = await sendEmail(updatedOrder, "payment_received")

      // Add email record and log
      updatedOrder.emailHistory = [...(updatedOrder.emailHistory || []), emailResult.emailRecord]
      updatedOrder.logs.push(emailResult.logEntry)

      setOrders(orders.map((order) => (order.id === selectedOrder.id ? updatedOrder : order)))
      setSelectedOrder(updatedOrder)
      setPaymentForm({ amount: "", notes: "" })

      toast({
        title: "Payment Added Successfully",
        description: `Payment of ₹${amount} added and notification email sent to ${updatedOrder.customerEmail}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment or send email",
        variant: "destructive",
      })
    }
  }

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return

    const updatedOrder = {
      ...selectedOrder,
      status: newStatus,
      ...(newStatus === "Delivered" && { deliveredDate: new Date().toISOString().split("T")[0] }),
      logs: [
        ...selectedOrder.logs,
        {
          id: selectedOrder.logs.length + 1,
          action: "Status updated",
          timestamp: new Date().toLocaleString(),
          user: "Admin",
          details: `Order status changed to ${newStatus}`,
        },
      ],
    }

    try {
      // Send status update email automatically
      let emailType: EmailType = "status_in_progress"
      if (newStatus === "Finished") emailType = "status_finished"
      if (newStatus === "Delivered") emailType = "status_delivered"

      const emailResult = await sendEmail(updatedOrder, emailType)

      // Add email record and log
      updatedOrder.emailHistory = [...(updatedOrder.emailHistory || []), emailResult.emailRecord]
      updatedOrder.logs.push(emailResult.logEntry)

      setOrders(orders.map((order) => (order.id === selectedOrder.id ? updatedOrder : order)))
      setSelectedOrder(updatedOrder)

      toast({
        title: "Status Updated Successfully",
        description: `Order status changed to ${newStatus} and notification email sent to ${updatedOrder.customerEmail}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status or send email",
        variant: "destructive",
      })
    }
  }

  const handleResendEmail = async (emailType: EmailType, customContent?: string, customSubject?: string) => {
    if (!selectedOrder) return

    try {
      const emailResult = await sendEmail(selectedOrder, emailType, customContent, customSubject)

      // Add email record and log
      const updatedOrder = {
        ...selectedOrder,
        emailHistory: [...(selectedOrder.emailHistory || []), emailResult.emailRecord],
        logs: [
          ...selectedOrder.logs,
          {
            id: selectedOrder.logs.length + 1,
            action: "Email resent",
            timestamp: new Date().toLocaleString(),
            user: "Admin",
            details: `${emailType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} email resent to ${selectedOrder.customerEmail}`,
          },
        ],
      }

      setOrders(orders.map((order) => (order.id === selectedOrder.id ? updatedOrder : order)))
      setSelectedOrder(updatedOrder)
      setIsEmailDialogOpen(false)
      setCustomEmailContent("")
      setCustomEmailSubject("")

      toast({
        title: "Email Sent Successfully",
        description: `Email sent to ${selectedOrder.customerEmail}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      })
    }
  }

  const openEmailDialog = (emailType: EmailType) => {
    setSelectedEmailType(emailType)
    if (selectedOrder) {
      const template = emailTemplates[emailType]
      setCustomEmailSubject(
        template.subject.replace("{orderId}", selectedOrder.id).replace("{customerName}", selectedOrder.customerName),
      )
      setCustomEmailContent(
        template.content
          .replace(/\{orderId\}/g, selectedOrder.id)
          .replace(/\{customerName\}/g, selectedOrder.customerName)
          .replace(/\{totalAmount\}/g, selectedOrder.totalAmount.toLocaleString())
          .replace(/\{advancePaid\}/g, selectedOrder.advancePaid.toLocaleString())
          .replace(/\{remainingAmount\}/g, selectedOrder.remainingAmount.toLocaleString())
          .replace(/\{expectedDelivery\}/g, new Date(selectedOrder.expectedDelivery).toLocaleDateString())
          .replace(/\{description\}/g, selectedOrder.description),
      )
    }
    setIsEmailDialogOpen(true)
  }

  if (!hasPermission("manage_orders")) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to manage orders.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600">Manage customer orders and track payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>
                  Add a new order for a customer. A confirmation email will be sent automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Select
                      value={newOrder.customerId}
                      onValueChange={(value) => {
                        const customer = customers.find((c) => c.id === value)
                        setNewOrder({
                          ...newOrder,
                          customerId: value,
                          customerName: customer?.name || "",
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderId">Order ID (Optional)</Label>
                    <Input
                      id="orderId"
                      placeholder="Auto-generated if empty"
                      value={newOrder.orderId}
                      onChange={(e) => setNewOrder({ ...newOrder, orderId: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalAmount">Total Amount (₹)</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      placeholder="25000"
                      value={newOrder.totalAmount}
                      onChange={(e) => setNewOrder({ ...newOrder, totalAmount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="advancePaid">Advance Paid (₹)</Label>
                    <Input
                      id="advancePaid"
                      type="number"
                      placeholder="10000"
                      value={newOrder.advancePaid}
                      onChange={(e) => setNewOrder({ ...newOrder, advancePaid: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedDelivery">Expected Delivery</Label>
                  <Input
                    id="expectedDelivery"
                    type="date"
                    value={newOrder.expectedDelivery}
                    onChange={(e) => setNewOrder({ ...newOrder, expectedDelivery: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Wedding album with 100 photos, premium binding..."
                    value={newOrder.description}
                    onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOrderOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateOrder} disabled={!newOrder.customerId || !newOrder.totalAmount}>
                  Create Order & Send Email
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.pendingPayments.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders by ID or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Finished">Finished</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                  <SelectItem value="Fully Paid">Fully Paid</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                  <SelectItem value="customer">Customer Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active Orders ({stats.activeOrders})</TabsTrigger>
          <TabsTrigger value="past">Past Orders ({stats.completedOrders})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No active orders found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== "all" || paymentFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create your first order to get started"}
                </p>
                {!searchTerm && statusFilter === "all" && paymentFilter === "all" && (
                  <Button onClick={() => setIsCreateOrderOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Order
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{order.id}</h3>
                          {getStatusBadge(order.status)}
                          {getPaymentBadge(order.paymentStatus)}
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            <Mail className="h-3 w-3 mr-1" />
                            {order.emailHistory?.length || 0} emails
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Customer</p>
                            <p className="font-medium">{order.customerName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total Amount</p>
                            <p className="font-medium">₹{order.totalAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Paid / Remaining</p>
                            <p className="font-medium">
                              ₹{order.advancePaid.toLocaleString()} / ₹{order.remainingAmount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Order Date</p>
                            <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Sheet
                          open={isOrderDetailsOpen && selectedOrder?.id === order.id}
                          onOpenChange={(open) => {
                            setIsOrderDetailsOpen(open)
                            if (!open) setSelectedOrder(null)
                          }}
                        >
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-[700px] sm:max-w-[700px]">
                            <SheetHeader>
                              <SheetTitle>Order Details - {selectedOrder?.id}</SheetTitle>
                              <SheetDescription>
                                Manage order information, payments, and email communications
                              </SheetDescription>
                            </SheetHeader>
                            {selectedOrder && (
                              <ScrollArea className="h-[calc(100vh-120px)]">
                                <div className="space-y-6 py-4 pr-4">
                                  {/* Customer Information */}
                                  <div>
                                    <h4 className="font-semibold mb-3">Customer Information</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-gray-600">Name</p>
                                        <p className="font-medium">{selectedOrder.customerName}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Email</p>
                                        <p className="font-medium">{selectedOrder.customerEmail}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Phone</p>
                                        <p className="font-medium">{selectedOrder.customerPhone}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Customer ID</p>
                                        <p className="font-medium">{selectedOrder.customerId}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Order Information */}
                                  <div>
                                    <h4 className="font-semibold mb-3">Order Information</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-gray-600">Order Date</p>
                                        <p className="font-medium">
                                          {new Date(selectedOrder.orderDate).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Expected Delivery</p>
                                        <p className="font-medium">
                                          {new Date(selectedOrder.expectedDelivery).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Status</p>
                                        <div className="flex items-center gap-2">
                                          {getStatusBadge(selectedOrder.status)}
                                          <Select value={selectedOrder.status} onValueChange={handleStatusUpdate}>
                                            <SelectTrigger className="w-[120px] h-8">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="In Progress">In Progress</SelectItem>
                                              <SelectItem value="Finished">Finished</SelectItem>
                                              <SelectItem value="Delivered">Delivered</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Payment Status</p>
                                        <p>{getPaymentBadge(selectedOrder.paymentStatus)}</p>
                                      </div>
                                    </div>
                                    <div className="mt-4">
                                      <p className="text-gray-600 text-sm">Description</p>
                                      <p className="font-medium">{selectedOrder.description}</p>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Email Actions */}
                                  <div>
                                    <h4 className="font-semibold mb-3">Email Communications</h4>
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEmailDialog("order_created")}
                                        className="justify-start"
                                      >
                                        <Mail className="h-4 w-4 mr-2" />
                                        Resend Order Confirmation
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEmailDialog("status_in_progress")}
                                        className="justify-start"
                                      >
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Progress Update
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEmailDialog("status_finished")}
                                        className="justify-start"
                                      >
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Ready Notification
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEmailDialog("status_delivered")}
                                        className="justify-start"
                                      >
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Delivery Confirmation
                                      </Button>
                                    </div>

                                    {/* Email History */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <h5 className="font-medium mb-2">Email History</h5>
                                      <ScrollArea className="h-[120px]">
                                        <div className="space-y-2">
                                          {selectedOrder.emailHistory?.map((email) => (
                                            <div key={email.id} className="flex justify-between items-center text-sm">
                                              <div>
                                                <p className="font-medium">{email.subject}</p>
                                                <p className="text-gray-600 text-xs">{email.sentAt}</p>
                                              </div>
                                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                                {email.status}
                                              </Badge>
                                            </div>
                                          ))}
                                          {(!selectedOrder.emailHistory || selectedOrder.emailHistory.length === 0) && (
                                            <p className="text-gray-500 text-sm">No emails sent yet</p>
                                          )}
                                        </div>
                                      </ScrollArea>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Payment Information */}
                                  <div>
                                    <h4 className="font-semibold mb-3">Payment Information</h4>
                                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                                      <div>
                                        <p className="text-gray-600">Total Amount</p>
                                        <p className="font-medium text-lg">
                                          ₹{selectedOrder.totalAmount.toLocaleString()}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Amount Paid</p>
                                        <p className="font-medium text-lg text-green-600">
                                          ₹{selectedOrder.advancePaid.toLocaleString()}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Remaining</p>
                                        <p className="font-medium text-lg text-red-600">
                                          ₹{selectedOrder.remainingAmount.toLocaleString()}
                                        </p>
                                      </div>
                                    </div>

                                    {selectedOrder.remainingAmount > 0 && (
                                      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                                        <h5 className="font-medium">Add Payment</h5>
                                        <div className="grid grid-cols-2 gap-3">
                                          <div>
                                            <Label htmlFor="paymentAmount">Amount (₹)</Label>
                                            <Input
                                              id="paymentAmount"
                                              type="number"
                                              placeholder="5000"
                                              value={paymentForm.amount}
                                              onChange={(e) =>
                                                setPaymentForm({ ...paymentForm, amount: e.target.value })
                                              }
                                              max={selectedOrder.remainingAmount}
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor="paymentNotes">Notes (Optional)</Label>
                                            <Input
                                              id="paymentNotes"
                                              placeholder="Payment method, reference..."
                                              value={paymentForm.notes}
                                              onChange={(e) =>
                                                setPaymentForm({ ...paymentForm, notes: e.target.value })
                                              }
                                            />
                                          </div>
                                        </div>
                                        <Button
                                          onClick={handleAddPayment}
                                          disabled={
                                            !paymentForm.amount ||
                                            Number.parseInt(paymentForm.amount) > selectedOrder.remainingAmount
                                          }
                                          className="w-full"
                                        >
                                          Add Payment & Send Email
                                        </Button>
                                      </div>
                                    )}
                                  </div>

                                  <Separator />

                                  {/* Order Logs */}
                                  <div>
                                    <h4 className="font-semibold mb-3">Order History</h4>
                                    <ScrollArea className="h-[200px]">
                                      <div className="space-y-3">
                                        {selectedOrder.logs.map((log) => (
                                          <div key={log.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-sm">{log.action}</p>
                                                <Badge variant="outline" className="text-xs">
                                                  {log.user}
                                                </Badge>
                                              </div>
                                              <p className="text-sm text-gray-600">{log.details}</p>
                                              <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                </div>
                              </ScrollArea>
                            )}
                          </SheetContent>
                        </Sheet>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed orders found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all" || paymentFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Completed orders will appear here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{order.id}</h3>
                          {getStatusBadge(order.status)}
                          {getPaymentBadge(order.paymentStatus)}
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            <Mail className="h-3 w-3 mr-1" />
                            {order.emailHistory?.length || 0} emails
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Customer</p>
                            <p className="font-medium">{order.customerName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total Amount</p>
                            <p className="font-medium">₹{order.totalAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Order Date</p>
                            <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Delivered Date</p>
                            <p className="font-medium">
                              {order.deliveredDate ? new Date(order.deliveredDate).toLocaleDateString() : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Revenue</p>
                            <p className="font-medium text-green-600">₹{order.advancePaid.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Sheet
                          open={isOrderDetailsOpen && selectedOrder?.id === order.id}
                          onOpenChange={(open) => {
                            setIsOrderDetailsOpen(open)
                            if (!open) setSelectedOrder(null)
                          }}
                        >
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-[700px] sm:max-w-[700px]">
                            <SheetHeader>
                              <SheetTitle>Order Details - {selectedOrder?.id}</SheetTitle>
                              <SheetDescription>View completed order information and email history</SheetDescription>
                            </SheetHeader>
                            {selectedOrder && (
                              <ScrollArea className="h-[calc(100vh-120px)]">
                                <div className="space-y-6 py-4 pr-4">
                                  {/* Customer Information */}
                                  <div>
                                    <h4 className="font-semibold mb-3">Customer Information</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-gray-600">Name</p>
                                        <p className="font-medium">{selectedOrder.customerName}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Email</p>
                                        <p className="font-medium">{selectedOrder.customerEmail}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Phone</p>
                                        <p className="font-medium">{selectedOrder.customerPhone}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Customer ID</p>
                                        <p className="font-medium">{selectedOrder.customerId}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Order Information */}
                                  <div>
                                    <h4 className="font-semibold mb-3">Order Information</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-gray-600">Order Date</p>
                                        <p className="font-medium">
                                          {new Date(selectedOrder.orderDate).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Delivered Date</p>
                                        <p className="font-medium">
                                          {selectedOrder.deliveredDate
                                            ? new Date(selectedOrder.deliveredDate).toLocaleDateString()
                                            : "-"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Status</p>
                                        <p>{getStatusBadge(selectedOrder.status)}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Payment Status</p>
                                        <p>{getPaymentBadge(selectedOrder.paymentStatus)}</p>
                                      </div>
                                    </div>
                                    <div className="mt-4">
                                      <p className="text-gray-600 text-sm">Description</p>
                                      <p className="font-medium">{selectedOrder.description}</p>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Email History */}
                                  <div>
                                    <h4 className="font-semibold mb-3">Email Communications</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                      <ScrollArea className="h-[150px]">
                                        <div className="space-y-3">
                                          {selectedOrder.emailHistory?.map((email) => (
                                            <div key={email.id} className="flex justify-between items-center">
                                              <div>
                                                <p className="font-medium text-sm">{email.subject}</p>
                                                <p className="text-gray-600 text-xs">{email.sentAt}</p>
                                              </div>
                                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                                {email.status}
                                              </Badge>
                                            </div>
                                          ))}
                                          {(!selectedOrder.emailHistory || selectedOrder.emailHistory.length === 0) && (
                                            <p className="text-gray-500 text-sm">No emails sent</p>
                                          )}
                                        </div>
                                      </ScrollArea>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Payment Summary */}
                                  <div>
                                    <h4 className="font-semibold mb-3">Payment Summary</h4>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                      <div>
                                        <p className="text-gray-600">Total Amount</p>
                                        <p className="font-medium text-lg">
                                          ₹{selectedOrder.totalAmount.toLocaleString()}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Amount Paid</p>
                                        <p className="font-medium text-lg text-green-600">
                                          ₹{selectedOrder.advancePaid.toLocaleString()}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Remaining</p>
                                        <p className="font-medium text-lg">
                                          ₹{selectedOrder.remainingAmount.toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Order Logs */}
                                  <div>
                                    <h4 className="font-semibold mb-3">Order History</h4>
                                    <ScrollArea className="h-[200px]">
                                      <div className="space-y-3">
                                        {selectedOrder.logs.map((log) => (
                                          <div key={log.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-sm">{log.action}</p>
                                                <Badge variant="outline" className="text-xs">
                                                  {log.user}
                                                </Badge>
                                              </div>
                                              <p className="text-sm text-gray-600">{log.details}</p>
                                              <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                </div>
                              </ScrollArea>
                            )}
                          </SheetContent>
                        </Sheet>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>Customize and send email to {selectedOrder?.customerEmail}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="emailSubject">Subject</Label>
              <Input
                id="emailSubject"
                value={customEmailSubject}
                onChange={(e) => setCustomEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailContent">Email Content</Label>
              <Textarea
                id="emailContent"
                rows={12}
                value={customEmailContent}
                onChange={(e) => setCustomEmailContent(e.target.value)}
                placeholder="Enter your email content here..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleResendEmail(selectedEmailType, customEmailContent, customEmailSubject)}>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
