"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  User,
  FileText,
  Edit,
  Trash,
  ShoppingCart,
  UserCheck,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock customers data
const initialCustomers = [
  {
    id: "c001",
    name: "Rahul Photography Studio",
    email: "rahul@photography.com",
    phone: "+91 98765 43210",
    address: "123 Main St, Mumbai, Maharashtra",
    referencePhone: "+91 87654 32109",
    referenceName: "Amit Kumar",
    status: "Active",
    totalOrders: 5,
    totalSpent: 125000,
    createdAt: "2023-01-15T10:30:00",
  },
  {
    id: "c002",
    name: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    phone: "+91 87654 32109",
    address: "456 Park Avenue, Delhi",
    referencePhone: "",
    referenceName: "",
    status: "Active",
    totalOrders: 2,
    totalSpent: 45000,
    createdAt: "2023-02-20T14:45:00",
  },
  {
    id: "c003",
    name: "Amar Singh Photography",
    email: "amar@singhphotography.com",
    phone: "+91 76543 21098",
    address: "789 Lake View, Bangalore, Karnataka",
    referencePhone: "+91 65432 10987",
    referenceName: "Rajesh Singh",
    status: "Active",
    totalOrders: 8,
    totalSpent: 230000,
    createdAt: "2022-11-05T09:15:00",
  },
  {
    id: "c004",
    name: "Lakshmi Weddings",
    email: "info@lakshmiweddings.com",
    phone: "+91 65432 10987",
    address: "101 Wedding Lane, Chennai, Tamil Nadu",
    referencePhone: "",
    referenceName: "",
    status: "Active",
    totalOrders: 12,
    totalSpent: 350000,
    createdAt: "2022-08-12T11:20:00",
  },
  {
    id: "c005",
    name: "Vikram Mehta",
    email: "vikram.mehta@outlook.com",
    phone: "+91 54321 09876",
    address: "202 Hill Road, Pune, Maharashtra",
    referencePhone: "+91 43210 98765",
    referenceName: "Neha Mehta",
    status: "Inactive",
    totalOrders: 1,
    totalSpent: 28000,
    createdAt: "2023-03-25T16:10:00",
  },
]

export default function CustomersPage() {
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortBy, setSortBy] = useState("newest")
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    referencePhone: "",
    referenceName: "",
  })

  // Filter and sort customers
  const filteredCustomers = customers
    .filter((customer) => {
      // Filter by search term
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)

      // Filter by status
      const matchesStatus = statusFilter === "All" || customer.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      // Sort by selected option
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt)
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt)
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "most-orders":
          return b.totalOrders - a.totalOrders
        default:
          return 0
      }
    })

  // Handle creating a new customer
  const handleCreateCustomer = () => {
    const customer = {
      id: `c${String(customers.length + 1).padStart(3, "0")}`,
      ...newCustomer,
      status: "Active",
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    }

    setCustomers([customer, ...customers])

    // Reset form and close dialog
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      address: "",
      referencePhone: "",
      referenceName: "",
    })
    setIsNewCustomerOpen(false)
  }

  // Handle editing a customer
  const handleEditCustomer = () => {
    if (!selectedCustomer) return

    setCustomers(customers.map((c) => (c.id === selectedCustomer.id ? selectedCustomer : c)))

    setIsEditCustomerOpen(false)
  }

  // Handle deleting a customer
  const handleDeleteCustomer = (id) => {
    setCustomers(customers.filter((c) => c.id !== id))
  }

  // Handle toggling customer status
  const handleToggleStatus = (id) => {
    setCustomers(
      customers.map((c) => (c.id === id ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" } : c)),
    )
  }

  // Calculate statistics
  const totalCustomers = customers.length
  const activeCustomers = customers.filter((c) => c.status === "Active").length
  const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0)
  const averageOrdersPerCustomer = totalCustomers > 0 ? (totalOrders / totalCustomers).toFixed(1) : 0

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">Manage customer profiles and information</p>
        </div>
        <Button onClick={() => setIsNewCustomerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {activeCustomers} active, {totalCustomers - activeCustomers} inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((activeCustomers / totalCustomers) * 100)}% of total customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">From {activeCustomers} active customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Orders per Customer</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageOrdersPerCustomer}</div>
            <p className="text-xs text-muted-foreground">Orders per active customer</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter("All")}>All Customers</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Active")}>Active Customers</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Inactive")}>Inactive Customers</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name-asc")}>Name (A-Z)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name-desc")}>Name (Z-A)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("most-orders")}>Most Orders</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Customers Table */}
      {filteredCustomers.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        customer.status === "Active"
                          ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-500"
                      }
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell>₹{customer.totalSpent.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setIsEditCustomerOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(customer.id)}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          {customer.status === "Active" ? "Mark as Inactive" : "Mark as Active"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          View Orders
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteCustomer(customer.id)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <User className="h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-medium">No customers found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || statusFilter !== "All"
                ? "Try adjusting your search or filters"
                : "Add a new customer to get started"}
            </p>
          </div>
        </div>
      )}

      {/* New Customer Dialog */}
      <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Create a new customer profile. Fill in all the required details.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customerName">Name / Studio Name *</Label>
              <Input
                id="customerName"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                placeholder="John Doe / ABC Photography"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customerEmail">Email Address *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="customer@example.com"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="customerPhone">Contact Number *</Label>
                <Input
                  id="customerPhone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customerAddress">Address *</Label>
              <Textarea
                id="customerAddress"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                placeholder="123 Main St, City, State"
                required
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="referencePhone">Reference Phone (Optional)</Label>
                <Input
                  id="referencePhone"
                  value={newCustomer.referencePhone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, referencePhone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="referenceName">Reference Name (Optional)</Label>
                <Input
                  id="referenceName"
                  value={newCustomer.referenceName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, referenceName: e.target.value })}
                  placeholder="Jane Doe"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewCustomerOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCustomer}
              disabled={!newCustomer.name || !newCustomer.email || !newCustomer.phone || !newCustomer.address}
            >
              Create Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer information.</DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editCustomerName">Name / Studio Name *</Label>
                <Input
                  id="editCustomerName"
                  value={selectedCustomer.name}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })}
                  placeholder="John Doe / ABC Photography"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editCustomerEmail">Email Address *</Label>
                  <Input
                    id="editCustomerEmail"
                    type="email"
                    value={selectedCustomer.email}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, email: e.target.value })}
                    placeholder="customer@example.com"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="editCustomerPhone">Contact Number *</Label>
                  <Input
                    id="editCustomerPhone"
                    value={selectedCustomer.phone}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editCustomerAddress">Address *</Label>
                <Textarea
                  id="editCustomerAddress"
                  value={selectedCustomer.address}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, address: e.target.value })}
                  placeholder="123 Main St, City, State"
                  required
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editReferencePhone">Reference Phone (Optional)</Label>
                  <Input
                    id="editReferencePhone"
                    value={selectedCustomer.referencePhone}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, referencePhone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="editReferenceName">Reference Name (Optional)</Label>
                  <Input
                    id="editReferenceName"
                    value={selectedCustomer.referenceName}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, referenceName: e.target.value })}
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCustomerOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditCustomer}
              disabled={
                !selectedCustomer ||
                !selectedCustomer.name ||
                !selectedCustomer.email ||
                !selectedCustomer.phone ||
                !selectedCustomer.address
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
