"use client";

import { useState, useEffect, useMemo } from "react";
import { useRole } from "@/components/admin/role-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Mail,
  Plus,
  Search,
  Send,
  Trash,
  Users,
  Edit,
  Info,
  Lock,
  BarChart3,
  MoreHorizontal,
  UserX,
  Trash2,
  Loader2,
  ArrowUpDown,
  Filter,
  FileText,
  IndianRupee,
  Clock,
} from "lucide-react";
import { RoleBasedContent } from "@/components/admin/role-based-content";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Newsletter {
  id: string;
  subject: string;
  content: string;
  sent_at: string;
  status: "sent" | "draft" | "failed";
  metadata: {
    recipient_count: number;
    open_rate?: number;
    click_rate?: number;
  };
}

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: "active" | "inactive" | "unsubscribed" | "deleted";
  created_at: string;
  updated_at: string;
}

const statusBadgeVariants: Record<
  Subscriber["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  inactive: "secondary",
  unsubscribed: "destructive",
  deleted: "outline",
};

const statusBadgeClasses = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-gray-100 text-gray-700 border-gray-200",
  unsubscribed: "bg-red-100 text-red-700 border-red-200",
  deleted: "bg-gray-50 text-gray-500 border-gray-200",
};

export default function NewsletterPage() {
  const { role, hasPermission } = useRole();
  const supabase = createClient();

  // State management
  const [createNewsletterOpen, setCreateNewsletterOpen] = useState(false);
  const [addSubscriberOpen, setAddSubscriberOpen] = useState(false);
  const [editSubscriberOpen, setEditSubscriberOpen] = useState(false);
  const [newsletterDetailOpen, setNewsletterDetailOpen] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] =
    useState<Newsletter | null>(null);
  const [selectedSubscriber, setSelectedSubscriber] =
    useState<Subscriber | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<
    "newsletter" | "subscriber" | null
  >(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newNewsletter, setNewNewsletter] = useState({
    subject: "",
    content: "",
  });
  const [newSubscriber, setNewSubscriber] = useState({
    email: "",
    name: "",
  });
  const [statusFilter, setStatusFilter] = useState<
    "all" | Subscriber["status"]
  >("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "name-asc" | "name-desc"
  >("newest");
  const [sending, setSending] = useState(false);

  // Load data
  useEffect(() => {
    loadNewsletters();
  }, []);

  useEffect(() => {
    loadSubscribers();
  }, [statusFilter, debouncedSearchTerm]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from("newsletter_logs")
        .select("*")
        .order("sent_at", { ascending: false });

      if (error) throw error;
      setNewsletters(data || []);
    } catch (error) {
      console.error("Error loading newsletters:", error);
      toast.error("Failed to load newsletters");
    }
  };

  const loadSubscribers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/newsletter/subscribers?status=${statusFilter}&search=${debouncedSearchTerm}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch subscribers");
      }

      setSubscribers(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load subscribers";
      toast.error(errorMessage);
      console.error("Error loading subscribers:", error);
      setSubscribers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const canSendNewsletters = hasPermission("send_newsletters");
  const canManageSubscribers = hasPermission("manage_subscribers");

  // Calculate statistics
  const stats = useMemo(() => {
    if (!subscribers)
      return {
        totalSubscribers: 0,
        activeSubscribers: 0,
        unsubscribedCount: 0,
        inactiveCount: 0,
      };

    return {
      totalSubscribers: subscribers.length,
      activeSubscribers: subscribers.filter((s) => s.status === "active")
        .length,
      unsubscribedCount: subscribers.filter((s) => s.status === "unsubscribed")
        .length,
      inactiveCount: subscribers.filter((s) => s.status === "inactive").length,
    };
  }, [subscribers]);

  // Filter and sort subscribers
  const filteredSubscribers = useMemo(() => {
    if (!subscribers) return [];

    let filtered = [...subscribers];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (subscriber) => subscriber.status === statusFilter
      );
    }

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (subscriber) =>
          subscriber.email.toLowerCase().includes(searchLower) ||
          (subscriber.name?.toLowerCase() || "").includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "");
        default: // newest
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    return filtered;
  }, [subscribers, statusFilter, debouncedSearchTerm, sortBy]);

  // Newsletter actions
  const handleCreateNewsletter = async () => {
    try {
      setSending(true);
      const response = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: newNewsletter.subject,
          content: newNewsletter.content,
          includeUnsubscribeLink: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send newsletter");
      }

      toast.success("Newsletter sent successfully");
      setCreateNewsletterOpen(false);
      setNewNewsletter({ subject: "", content: "" });
      loadNewsletters();
    } catch (error) {
      console.error("Error sending newsletter:", error);
      toast.error("Failed to send newsletter");
    } finally {
      setSending(false);
    }
  };

  const handleAddSubscriber = async () => {
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert([
        {
          email: newSubscriber.email,
          name: newSubscriber.name || null,
          status: "active",
          metadata: {
            source: "admin_panel",
            added_at: new Date().toISOString(),
          },
        },
      ]);

      if (error) throw error;

      toast.success("Subscriber added successfully");
      setAddSubscriberOpen(false);
      setNewSubscriber({ email: "", name: "" });
      loadSubscribers();
    } catch (error) {
      console.error("Error adding subscriber:", error);
      toast.error("Failed to add subscriber");
    }
  };

  const handleUpdateSubscriber = async () => {
    if (!selectedSubscriber) return;

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({
          name: newSubscriber.name || null,
          metadata: {
            ...selectedSubscriber.metadata,
            updated_at: new Date().toISOString(),
          },
        })
        .eq("id", selectedSubscriber.id);

      if (error) throw error;

      toast.success("Subscriber updated successfully");
      setEditSubscriberOpen(false);
      loadSubscribers();
    } catch (error) {
      console.error("Error updating subscriber:", error);
      toast.error("Failed to update subscriber");
    }
  };

  const handleDeleteSubscriber = async () => {
    if (!deleteItem) return;

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ status: "deleted" })
        .eq("id", deleteItem.id);

      if (error) throw error;

      toast.success("Subscriber deleted successfully");
      setDeleteConfirmOpen(false);
      loadSubscribers();
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      toast.error("Failed to delete subscriber");
    }
  };

  const handleViewNewsletter = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    setNewsletterDetailOpen(true);
  };

  const handleDeleteNewsletter = (newsletter: Newsletter) => {
    setDeleteItem(newsletter);
    setDeleteType("newsletter");
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem || !deleteType) return;

    try {
      if (deleteType === "newsletter") {
        const { error } = await supabase
          .from("newsletter_logs")
          .delete()
          .eq("id", deleteItem.id);

        if (error) throw error;
        toast.success("Newsletter deleted successfully");
      } else if (deleteType === "subscriber") {
        await handleDeleteSubscriber();
      }

      setDeleteConfirmOpen(false);
      setDeleteItem(null);
      setDeleteType(null);
      loadNewsletters();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleSubscriberAction = async (
    id: string,
    action: string,
    name?: string
  ) => {
    try {
      let newStatus: Subscriber["status"] = "active";
      let successMessage = "";

      switch (action) {
        case "activate":
          newStatus = "active";
          successMessage = "Subscriber activated successfully";
          break;
        case "deactivate":
          newStatus = "inactive";
          successMessage = "Subscriber deactivated successfully";
          break;
        case "unsubscribe":
          newStatus = "unsubscribed";
          successMessage = "Subscriber unsubscribed successfully";
          break;
        default:
          return;
      }

      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast.success(successMessage);
      loadSubscribers();
    } catch (error) {
      console.error("Error updating subscriber status:", error);
      toast.error("Failed to update subscriber status");
    }
  };

  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative">
          <h1 className="text-2xl font-bold text-red-900">Newsletter</h1>
          <p className="text-muted-foreground">
            Manage newsletter subscribers and send updates
          </p>
          <div className="absolute -bottom-1 left-0 w-12 h-1 bg-red-600 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <RoleBasedContent permissions={["send_newsletters"]}>
            <Button
              onClick={() => setCreateNewsletterOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Newsletter
            </Button>
          </RoleBasedContent>
          <RoleBasedContent permissions={["manage_subscribers"]}>
            <Button
              onClick={() => setAddSubscriberOpen(true)}
              variant="outline"
              className="border-red-200 hover:bg-red-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subscriber
            </Button>
          </RoleBasedContent>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Subscribers
            </CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                stats.totalSubscribers
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscribers
            </CardTitle>
            <Mail className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                stats.activeSubscribers
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                stats.unsubscribedCount
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                stats.inactiveCount
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-red-100 focus:border-red-200 focus:ring-red-100"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value: any) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px] border-red-100">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-[180px] border-red-100">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subscribers Table */}
      <Card className="border-red-100">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-red-50/50">
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscribers.map((subscriber) => (
              <TableRow key={subscriber.id} className="hover:bg-red-50/50">
                <TableCell className="font-medium">
                  {subscriber.email}
                </TableCell>
                <TableCell>{subscriber.name || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant={statusBadgeVariants[subscriber.status]}
                    className={cn(
                      "mr-2",
                      statusBadgeClasses[subscriber.status]
                    )}
                  >
                    {subscriber.status.charAt(0).toUpperCase() +
                      subscriber.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(subscriber.created_at), "PPp")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-red-50"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedSubscriber(subscriber);
                          setNewSubscriber({
                            email: subscriber.email,
                            name: subscriber.name || "",
                          });
                          setEditSubscriberOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleSubscriberAction(subscriber.id, "delete")
                        }
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                      {subscriber.status === "active" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleSubscriberAction(subscriber.id, "deactivate")
                          }
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Pause Subscriptions
                        </DropdownMenuItem>
                      )}
                      {subscriber.status === "inactive" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleSubscriberAction(subscriber.id, "activate")
                          }
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Resume Subscriptions
                        </DropdownMenuItem>
                      )}
                      {subscriber.status !== "unsubscribed" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleSubscriberAction(subscriber.id, "unsubscribe")
                          }
                          className="text-red-600"
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Unsubscribe Permanently
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredSubscribers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No subscribers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Subscriber Dialog */}
      <Dialog open={addSubscriberOpen} onOpenChange={setAddSubscriberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subscriber</DialogTitle>
            <DialogDescription>
              Add a new subscriber to your newsletter list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={newSubscriber.email}
                onChange={(e) =>
                  setNewSubscriber({ ...newSubscriber, email: e.target.value })
                }
                placeholder="Enter email address"
                className="border-red-100 focus:border-red-200 focus:ring-red-100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                value={newSubscriber.name}
                onChange={(e) =>
                  setNewSubscriber({ ...newSubscriber, name: e.target.value })
                }
                placeholder="Enter name"
                className="border-red-100 focus:border-red-200 focus:ring-red-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddSubscriberOpen(false)}
              className="border-red-100 hover:bg-red-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSubscriber}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Add Subscriber
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subscriber Dialog */}
      <Dialog open={editSubscriberOpen} onOpenChange={setEditSubscriberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscriber</DialogTitle>
            <DialogDescription>
              Update subscriber information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                value={selectedSubscriber?.email}
                disabled
                className="border-red-100 bg-gray-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={newSubscriber.name}
                onChange={(e) =>
                  setNewSubscriber({ ...newSubscriber, name: e.target.value })
                }
                placeholder="Enter name"
                className="border-red-100 focus:border-red-200 focus:ring-red-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditSubscriberOpen(false)}
              className="border-red-100 hover:bg-red-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSubscriber}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Update Subscriber
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Newsletter Dialog */}
      <Dialog
        open={createNewsletterOpen}
        onOpenChange={setCreateNewsletterOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Newsletter</DialogTitle>
            <DialogDescription>
              Create and send a new newsletter to your subscribers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={newNewsletter.subject}
                onChange={(e) =>
                  setNewNewsletter({
                    ...newNewsletter,
                    subject: e.target.value,
                  })
                }
                placeholder="Enter newsletter subject"
                className="border-red-100 focus:border-red-200 focus:ring-red-100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newNewsletter.content}
                onChange={(e) =>
                  setNewNewsletter({
                    ...newNewsletter,
                    content: e.target.value,
                  })
                }
                placeholder="Enter newsletter content"
                className="min-h-[200px] border-red-100 focus:border-red-200 focus:ring-red-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateNewsletterOpen(false)}
              className="border-red-100 hover:bg-red-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNewsletter}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Newsletter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteType}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="border-red-100 hover:bg-red-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Newsletter Detail Dialog */}
      <Dialog
        open={newsletterDetailOpen}
        onOpenChange={setNewsletterDetailOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedNewsletter?.subject}</DialogTitle>
            <DialogDescription>
              Sent on{" "}
              {selectedNewsletter?.sent_at &&
                format(new Date(selectedNewsletter.sent_at), "PPp")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="rounded-lg border p-4">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: selectedNewsletter?.content || "",
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Recipients</div>
                <div className="text-2xl font-bold">
                  {selectedNewsletter?.metadata.recipient_count}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Open Rate</div>
                <div className="text-2xl font-bold">
                  {selectedNewsletter?.metadata.open_rate
                    ? `${(selectedNewsletter.metadata.open_rate * 100).toFixed(1)}%`
                    : "N/A"}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Click Rate</div>
                <div className="text-2xl font-bold">
                  {selectedNewsletter?.metadata.click_rate
                    ? `${(selectedNewsletter.metadata.click_rate * 100).toFixed(1)}%`
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewsletterDetailOpen(false)}
              className="border-red-100 hover:bg-red-50"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
