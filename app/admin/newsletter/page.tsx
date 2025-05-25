"use client"

import { useState } from "react"
import { useRole } from "@/components/admin/role-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Download, Mail, Plus, Search, Send, Trash, Users, Edit, Info, Lock, BarChart3 } from "lucide-react"
import { RoleBasedContent } from "@/components/admin/role-based-content"

interface Newsletter {
  id: number
  subject: string
  content: string
  sentDate: string
  recipients: number
  openRate: string
  clickRate: string
  status: "sent" | "draft"
}

interface Subscriber {
  id: number
  email: string
  name: string
  joinedDate: string
  status: "Active" | "Inactive"
  tags: string[]
}

export default function NewsletterPage() {
  const { role, hasPermission } = useRole()

  // State management
  const [createNewsletterOpen, setCreateNewsletterOpen] = useState(false)
  const [addSubscriberOpen, setAddSubscriberOpen] = useState(false)
  const [editSubscriberOpen, setEditSubscriberOpen] = useState(false)
  const [newsletterDetailOpen, setNewsletterDetailOpen] = useState(false)
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null)
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<"newsletter" | "subscriber" | null>(null)
  const [deleteItem, setDeleteItem] = useState<any>(null)

  // Sample newsletters with more detailed data
  const newsletters: Newsletter[] = [
    {
      id: 1,
      subject: "Summer Collection Launch",
      content:
        "Discover our stunning new summer collection featuring vibrant colors and elegant designs perfect for your special moments...",
      sentDate: "May 15, 2023",
      recipients: 342,
      openRate: "24%",
      clickRate: "8%",
      status: "sent",
    },
    {
      id: 2,
      subject: "Special Discount for Wedding Albums",
      content:
        "Celebrate love with our exclusive wedding album collection. Get 20% off on all premium wedding albums this month...",
      sentDate: "April 2, 2023",
      recipients: 328,
      openRate: "32%",
      clickRate: "12%",
      status: "sent",
    },
    {
      id: 3,
      subject: "New Baby Album Designs",
      content:
        "Welcome your little bundle of joy with our adorable new baby album designs. Capture every precious moment...",
      sentDate: "March 10, 2023",
      recipients: 315,
      openRate: "28%",
      clickRate: "10%",
      status: "sent",
    },
    {
      id: 4,
      subject: "Holiday Season Offers",
      content: "Make this holiday season memorable with our special offers on family photo albums and gift packages...",
      sentDate: "December 5, 2022",
      recipients: 298,
      openRate: "35%",
      clickRate: "15%",
      status: "sent",
    },
  ]

  // Sample subscribers with more data
  const subscribers: Subscriber[] = [
    {
      id: 1,
      email: "john.doe@example.com",
      name: "John Doe",
      joinedDate: "May 20, 2023",
      status: "Active",
      tags: ["Wedding", "Premium"],
    },
    {
      id: 2,
      email: "jane.smith@example.com",
      name: "Jane Smith",
      joinedDate: "May 18, 2023",
      status: "Active",
      tags: ["Baby", "Family"],
    },
    {
      id: 3,
      email: "robert.johnson@example.com",
      name: "Robert Johnson",
      joinedDate: "May 15, 2023",
      status: "Active",
      tags: ["Corporate"],
    },
    {
      id: 4,
      email: "emily.wilson@example.com",
      name: "Emily Wilson",
      joinedDate: "May 12, 2023",
      status: "Active",
      tags: ["Wedding"],
    },
    {
      id: 5,
      email: "michael.brown@example.com",
      name: "Michael Brown",
      joinedDate: "May 10, 2023",
      status: "Active",
      tags: ["Family"],
    },
    {
      id: 6,
      email: "sarah.davis@example.com",
      name: "Sarah Davis",
      joinedDate: "May 5, 2023",
      status: "Inactive",
      tags: ["Baby"],
    },
    {
      id: 7,
      email: "david.miller@example.com",
      name: "David Miller",
      joinedDate: "May 1, 2023",
      status: "Active",
      tags: ["Premium"],
    },
    {
      id: 8,
      email: "jennifer.taylor@example.com",
      name: "Jennifer Taylor",
      joinedDate: "April 28, 2023",
      status: "Active",
      tags: ["Wedding", "Family"],
    },
  ]

  const canSendNewsletters = hasPermission("send_newsletters")

  // Filter subscribers based on search
  const filteredSubscribers = subscribers.filter(
    (subscriber) =>
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Newsletter actions
  const handleViewNewsletter = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter)
    setNewsletterDetailOpen(true)
  }

  const handleDownloadNewsletter = (newsletter: Newsletter) => {
    // Simulate download
    console.log("Downloading newsletter:", newsletter.subject)
    // In real app, this would trigger a download
  }

  const handleDeleteNewsletter = (newsletter: Newsletter) => {
    setDeleteType("newsletter")
    setDeleteItem(newsletter)
    setDeleteConfirmOpen(true)
  }

  // Subscriber actions
  const handleEmailSubscriber = (subscriber: Subscriber) => {
    window.location.href = `mailto:${subscriber.email}`
  }

  const handleEditSubscriber = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber)
    setEditSubscriberOpen(true)
  }

  const handleDeleteSubscriber = (subscriber: Subscriber) => {
    setDeleteType("subscriber")
    setDeleteItem(subscriber)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (deleteType === "newsletter") {
      console.log("Deleting newsletter:", deleteItem.subject)
    } else if (deleteType === "subscriber") {
      console.log("Deleting subscriber:", deleteItem.email)
    }
    setDeleteConfirmOpen(false)
    setDeleteType(null)
    setDeleteItem(null)
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Newsletter Management</AlertTitle>
        <AlertDescription className="text-blue-700">
          You are viewing as <strong>{role}</strong>.
          {canSendNewsletters
            ? " You can create and send newsletters to subscribers."
            : " You don't have permission to manage newsletters."}
        </AlertDescription>
      </Alert>

      {!canSendNewsletters && (
        <Alert variant="default" className="mb-4 bg-red-50 border-red-200 text-red-800">
          <Lock className="h-4 w-4 text-red-600" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            You don't have permission to manage newsletters. This feature is only available to Superadmin users.
          </AlertDescription>
        </Alert>
      )}

      <RoleBasedContent
        permissions={["send_newsletters"]}
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Management</CardTitle>
              <CardDescription>
                This feature is restricted to users with newsletter management permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40">
                <div className="text-center">
                  <Lock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Contact an administrator to request access to this feature.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        }
      >
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Newsletter Management</h2>
          <Button onClick={() => setCreateNewsletterOpen(true)}>
            <Send className="mr-2 h-4 w-4" />
            Create Newsletter
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">+12 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Newsletters Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Last sent 3 days ago</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Open Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28%</div>
              <p className="text-xs text-muted-foreground">Industry avg: 21%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unsubscribe Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0.8%</div>
              <p className="text-xs text-muted-foreground">Industry avg: 1.2%</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="newsletters" className="space-y-4">
          <TabsList>
            <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          </TabsList>

          <TabsContent value="newsletters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sent Newsletters</CardTitle>
                <CardDescription>View and manage your sent newsletters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Subject</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Sent Date
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Recipients
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Open Rate
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {newsletters.map((newsletter) => (
                        <tr
                          key={newsletter.id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                          onClick={() => handleViewNewsletter(newsletter)}
                        >
                          <td className="p-4 align-middle font-medium">{newsletter.subject}</td>
                          <td className="p-4 align-middle">{newsletter.sentDate}</td>
                          <td className="p-4 align-middle">{newsletter.recipients}</td>
                          <td className="p-4 align-middle">{newsletter.openRate}</td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewNewsletter(newsletter)
                                }}
                              >
                                <Mail className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownloadNewsletter(newsletter)
                                }}
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteNewsletter(newsletter)
                                }}
                              >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Subscribers</CardTitle>
                  <CardDescription>Manage your newsletter subscribers</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button size="sm" onClick={() => setAddSubscriberOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subscriber
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search subscribers..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Joined Date
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tags</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {filteredSubscribers.map((subscriber) => (
                        <tr
                          key={subscriber.id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle font-medium">{subscriber.name}</td>
                          <td className="p-4 align-middle">{subscriber.email}</td>
                          <td className="p-4 align-middle">{subscriber.joinedDate}</td>
                          <td className="p-4 align-middle">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                subscriber.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {subscriber.status}
                            </span>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex gap-1 flex-wrap">
                              {subscriber.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEmailSubscriber(subscriber)}>
                                <Mail className="h-4 w-4" />
                                <span className="sr-only">Email</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEditSubscriber(subscriber)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteSubscriber(subscriber)}>
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </RoleBasedContent>

      {/* Create Newsletter Modal */}
      <Dialog open={createNewsletterOpen} onOpenChange={setCreateNewsletterOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Newsletter</DialogTitle>
            <DialogDescription>Create and send a newsletter to your subscribers</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Enter newsletter subject" />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" placeholder="Write your newsletter content here..." className="min-h-[200px]" />
            </div>
            <div>
              <Label htmlFor="recipients">Recipients</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscribers (342)</SelectItem>
                  <SelectItem value="active">Active Subscribers (298)</SelectItem>
                  <SelectItem value="wedding">Wedding Tag (156)</SelectItem>
                  <SelectItem value="family">Family Tag (89)</SelectItem>
                  <SelectItem value="premium">Premium Tag (67)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="schedule" />
              <Label htmlFor="schedule">Schedule for later</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateNewsletterOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setCreateNewsletterOpen(false)}>
              <Send className="mr-2 h-4 w-4" />
              Send Newsletter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Newsletter Detail Modal */}
      <Dialog open={newsletterDetailOpen} onOpenChange={setNewsletterDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {selectedNewsletter?.subject}
            </DialogTitle>
            <DialogDescription>Newsletter details and analytics</DialogDescription>
          </DialogHeader>
          {selectedNewsletter && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold">{selectedNewsletter.recipients}</div>
                  <div className="text-sm text-muted-foreground">Recipients</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold">{selectedNewsletter.openRate}</div>
                  <div className="text-sm text-muted-foreground">Open Rate</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold">{selectedNewsletter.clickRate}</div>
                  <div className="text-sm text-muted-foreground">Click Rate</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold">{selectedNewsletter.sentDate}</div>
                  <div className="text-sm text-muted-foreground">Sent Date</div>
                </div>
              </div>

              {/* Content */}
              <div>
                <Label className="text-base font-semibold">Newsletter Content</Label>
                <div className="mt-2 p-4 bg-slate-50 rounded-lg border">
                  <p className="text-sm leading-relaxed">{selectedNewsletter.content}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewsletterDetailOpen(false)}>
              Close
            </Button>
            <Button onClick={() => selectedNewsletter && handleDownloadNewsletter(selectedNewsletter)}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subscriber Modal */}
      <Dialog open={addSubscriberOpen} onOpenChange={setAddSubscriberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subscriber</DialogTitle>
            <DialogDescription>Add a new subscriber to your newsletter list</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter subscriber name" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter email address" />
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" placeholder="Enter tags (comma separated)" />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSubscriberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setAddSubscriberOpen(false)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Subscriber
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subscriber Modal */}
      <Dialog open={editSubscriberOpen} onOpenChange={setEditSubscriberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscriber</DialogTitle>
            <DialogDescription>Update subscriber information</DialogDescription>
          </DialogHeader>
          {selectedSubscriber && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" defaultValue={selectedSubscriber.name} />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" defaultValue={selectedSubscriber.email} />
              </div>
              <div>
                <Label htmlFor="edit-tags">Tags</Label>
                <Input id="edit-tags" defaultValue={selectedSubscriber.tags.join(", ")} />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select defaultValue={selectedSubscriber.status.toLowerCase()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSubscriberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setEditSubscriberOpen(false)}>
              <Edit className="mr-2 h-4 w-4" />
              Update Subscriber
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteType}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteItem && (
            <div className="py-4">
              <p className="text-sm">
                <strong>
                  {deleteType === "newsletter" ? deleteItem.subject : `${deleteItem.name} (${deleteItem.email})`}
                </strong>
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
