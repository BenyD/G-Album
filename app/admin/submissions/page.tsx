"use client"

import { useRole } from "@/components/admin/role-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  ArrowUpDown,
  Check,
  Info,
  MoreHorizontal,
  Search,
  Trash,
  Calendar,
  Mail,
  Phone,
  User,
  MessageSquare,
  Filter,
  X,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RoleBasedContent } from "@/components/admin/role-based-content"
import { useState, useMemo } from "react"

interface Submission {
  id: number
  name: string
  email: string
  phone: string
  message: string
  date: string
  status: "New" | "Replied"
}

export default function SubmissionsPage() {
  const { role } = useRole()
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "name" | "status">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Sample form submissions (removed archived status)
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+91 9876543210",
      message:
        "I'm interested in a wedding album package. Can you provide more details about your pricing? I'm planning my wedding for next year and would like to know about your different album options, pricing tiers, and what's included in each package. Also, do you offer any customization options for the album covers?",
      date: "2023-05-20T10:30:00",
      status: "New",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+91 8765432109",
      message:
        "I need a family portrait album. Do you offer any discounts for larger orders? We're a family of 8 and would like to create multiple albums for different family members. What would be the best approach for this?",
      date: "2023-05-19T14:45:00",
      status: "Replied",
    },
    {
      id: 3,
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      phone: "+91 7654321098",
      message:
        "Looking for a custom album design for my daughter's birthday. What options do you have? She's turning 16 and I want something really special. Can you work with specific themes or colors?",
      date: "2023-05-18T09:15:00",
      status: "New",
    },
    {
      id: 4,
      name: "Emily Wilson",
      email: "emily.wilson@example.com",
      phone: "+91 6543210987",
      message:
        "I need information about your delivery timeframes for wedding albums. My wedding is in 3 months and I want to make sure we can get the album ready in time for our first anniversary gift exchange.",
      date: "2023-05-17T16:20:00",
      status: "Replied",
    },
    {
      id: 5,
      name: "Michael Brown",
      email: "michael.brown@example.com",
      phone: "+91 5432109876",
      message:
        "Do you offer any special packages for anniversary albums? We're celebrating our 25th wedding anniversary and want to create a special album with photos from throughout our marriage.",
      date: "2023-05-16T11:10:00",
      status: "Replied",
    },
    {
      id: 6,
      name: "Sarah Davis",
      email: "sarah.davis@example.com",
      phone: "+91 4321098765",
      message:
        "Interested in your luxury album collection. What materials do you use and what's the difference between your standard and premium options?",
      date: "2023-05-15T13:25:00",
      status: "New",
    },
  ])

  // Filter and sort submissions
  const filteredAndSortedSubmissions = useMemo(() => {
    const filtered = submissions.filter((submission) => {
      const matchesSearch =
        submission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.message.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || submission.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })

    // Sort submissions
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [submissions, searchQuery, sortBy, sortOrder, statusFilter])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800"
      case "Replied":
        return "bg-green-100 text-green-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  // Handle status change
  const handleStatusChange = (id: number, newStatus: "Replied") => {
    setSubmissions((prev) => prev.map((sub) => (sub.id === id ? { ...sub, status: newStatus } : sub)))
  }

  // Handle delete
  const handleDelete = (id: number) => {
    setSubmissions((prev) => prev.filter((sub) => sub.id !== id))
  }

  // Handle sort change
  const handleSort = () => {
    if (sortBy === "date") {
      setSortBy("name")
    } else if (sortBy === "name") {
      setSortBy("status")
    } else {
      setSortBy("date")
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    }
  }

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setSortBy("date")
    setSortOrder("desc")
  }

  // Get submissions by status
  const getSubmissionsByStatus = (status: string) => {
    if (status === "all") return filteredAndSortedSubmissions
    return filteredAndSortedSubmissions.filter((sub) => sub.status.toLowerCase() === status.toLowerCase())
  }

  // Check if filters are active
  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || sortBy !== "date" || sortOrder !== "desc"

  // Render submissions table
  const renderSubmissionsTable = (submissionsList: Submission[]) => (
    <div className="relative w-full overflow-auto">
      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {submissionsList.map((submission) => (
          <Card
            key={submission.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedSubmission(submission)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-sm">{submission.name}</h4>
                  <p className="text-xs text-muted-foreground">{submission.email}</p>
                </div>
                <Badge className={getStatusColor(submission.status)}>{submission.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{submission.message}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{formatDate(submission.date)}</span>
                <div className="flex gap-1">
                  {submission.status !== "Replied" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusChange(submission.id, "Replied")
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                  <RoleBasedContent permissions={["manage_roles", "edit_albums"]}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(submission.id)
                      }}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </RoleBasedContent>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <table className="w-full caption-bottom text-sm hidden md:table">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Message</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {submissionsList.map((submission) => (
            <tr
              key={submission.id}
              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
              onClick={() => setSelectedSubmission(submission)}
            >
              <td className="p-4 align-middle font-medium">{submission.name}</td>
              <td className="p-4 align-middle">{submission.email}</td>
              <td className="p-4 align-middle">
                <div className="max-w-[300px] truncate">{submission.message}</div>
              </td>
              <td className="p-4 align-middle whitespace-nowrap">{formatDate(submission.date)}</td>
              <td className="p-4 align-middle">
                <Badge className={getStatusColor(submission.status)}>{submission.status}</Badge>
              </td>
              <td className="p-4 align-middle">
                <div className="flex items-center gap-2">
                  {submission.status !== "Replied" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusChange(submission.id, "Replied")
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      <span className="hidden lg:inline">Mark Replied</span>
                    </Button>
                  )}
                  <RoleBasedContent permissions={["manage_roles", "edit_albums"]}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(submission.id)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </RoleBasedContent>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {submissionsList.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No submissions found matching your criteria.</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4 p-4 md:p-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Form Submissions</AlertTitle>
        <AlertDescription className="text-blue-700">
          You are viewing as <strong>{role}</strong>. Click on any submission to view full details.
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Form Submissions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {filteredAndSortedSubmissions.length} of {submissions.length} submissions
          </p>
        </div>
      </div>

      {/* Controls Card */}
      <Card>
        <CardContent className="p-4">
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, email, or message..."
                className="pl-8 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-6 w-6 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sort and Clear Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Button variant="outline" onClick={handleSort} className="w-full sm:w-auto">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort by {sortBy} ({sortOrder})
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="w-full sm:w-auto">
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All ({filteredAndSortedSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="new" className="text-xs sm:text-sm">
            New ({getSubmissionsByStatus("new").length})
          </TabsTrigger>
          <TabsTrigger value="replied" className="text-xs sm:text-sm">
            Replied ({getSubmissionsByStatus("replied").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">All Form Submissions</CardTitle>
              <CardDescription>View and manage contact form submissions from your website</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">{renderSubmissionsTable(filteredAndSortedSubmissions)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">New Submissions</CardTitle>
              <CardDescription>View and manage new contact form submissions</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">{renderSubmissionsTable(getSubmissionsByStatus("new"))}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="replied" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Replied Submissions</CardTitle>
              <CardDescription>View submissions you've already replied to</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">{renderSubmissionsTable(getSubmissionsByStatus("replied"))}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submission Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Submission Details
            </DialogTitle>
            <DialogDescription>Full details of the form submission</DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Status and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Badge className={getStatusColor(selectedSubmission.status)}>{selectedSubmission.status}</Badge>
                <div className="flex flex-col sm:flex-row gap-2">
                  {selectedSubmission.status !== "Replied" && (
                    <Button
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        handleStatusChange(selectedSubmission.id, "Replied")
                        setSelectedSubmission({ ...selectedSubmission, status: "Replied" })
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark as Replied
                    </Button>
                  )}
                  <RoleBasedContent permissions={["manage_roles", "edit_albums"]}>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        handleDelete(selectedSubmission.id)
                        setSelectedSubmission(null)
                      }}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </RoleBasedContent>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    Name
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{selectedSubmission.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Date
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{formatDate(selectedSubmission.date)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="text-sm text-muted-foreground pl-6 break-all">{selectedSubmission.email}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4" />
                    Phone
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{selectedSubmission.phone}</p>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
              </div>

              {/* Submission ID */}
              <div className="text-xs text-muted-foreground border-t pt-4">Submission ID: #{selectedSubmission.id}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
