"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  MoreVertical,
  UserX,
  Trash2,
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
    tags: [] as string[],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  // Load data
  useEffect(() => {
    loadNewsletters();
  }, []);

  useEffect(() => {
    loadSubscribers();
  }, [statusFilter, searchQuery]);

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
        `/api/admin/newsletter/subscribers?status=${statusFilter}&search=${searchQuery}`
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

  // Filter subscribers based on search
  const filteredSubscribers = subscribers.filter(
    (subscriber) =>
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subscriber.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // Newsletter actions
  const handleCreateNewsletter = async () => {
    try {
      const response = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNewsletter),
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
    }
  };

  const handleAddSubscriber = async () => {
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert([
        {
          email: newSubscriber.email,
          name: newSubscriber.name || null,
          status: "active",
          tags: newSubscriber.tags,
          metadata: {
            source: "admin_panel",
            added_at: new Date().toISOString(),
          },
        },
      ]);

      if (error) throw error;

      toast.success("Subscriber added successfully");
      setAddSubscriberOpen(false);
      setNewSubscriber({ email: "", name: "", tags: [] });
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
          tags: newSubscriber.tags,
          metadata: {
            ...selectedSubscriber.metadata,
            updated_at: new Date().toISOString(),
          },
        })
        .eq("id", selectedSubscriber.id);

      if (error) throw error;

      toast.success("Subscriber updated successfully");
      setEditSubscriberOpen(false);
      setSelectedSubscriber(null);
      setNewSubscriber({ email: "", name: "", tags: [] });
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
        .update({ status: "unsubscribed" })
        .eq("id", deleteItem.id);

      if (error) throw error;

      toast.success("Subscriber unsubscribed successfully");
      setDeleteConfirmOpen(false);
      setDeleteItem(null);
      loadSubscribers();
    } catch (error) {
      console.error("Error unsubscribing subscriber:", error);
      toast.error("Failed to unsubscribe subscriber");
    }
  };

  const handleViewNewsletter = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    setNewsletterDetailOpen(true);
  };

  const handleDeleteNewsletter = (newsletter: Newsletter) => {
    setDeleteType("newsletter");
    setDeleteItem(newsletter);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    if (deleteType === "newsletter") {
      try {
        const { error } = await supabase
          .from("newsletter_logs")
          .delete()
          .eq("id", deleteItem.id);

        if (error) throw error;

        toast.success("Newsletter deleted successfully");
        setDeleteConfirmOpen(false);
        setDeleteItem(null);
        loadNewsletters();
      } catch (error) {
        console.error("Error deleting newsletter:", error);
        toast.error("Failed to delete newsletter");
      }
    } else if (deleteType === "subscriber") {
      await handleDeleteSubscriber();
    }
  };

  const handleSubscriberAction = async (
    id: string,
    action: string,
    name?: string
  ) => {
    try {
      const response = await fetch("/api/admin/newsletter/subscribers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, action, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to perform action");
      }

      toast.success(data.message);
      loadSubscribers();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to perform action"
      );
    }
  };

  const handleUpdateName = async (id: string) => {
    const name = prompt("Enter new name:");
    if (name) {
      await handleSubscriberAction(id, "update_name", name);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Newsletter Management</h1>
        <div className="flex gap-2">
          {canSendNewsletters && (
            <Button onClick={() => setCreateNewsletterOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Newsletter
            </Button>
          )}
          {canManageSubscribers && (
            <Button
              variant="outline"
              onClick={() => setAddSubscriberOpen(true)}
            >
              <Users className="w-4 h-4 mr-2" />
              Add Subscriber
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="subscribers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscribers</CardTitle>
              <CardDescription>
                Manage your newsletter subscribers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search subscribers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 font-medium text-sm text-gray-500">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Status</div>
                  <div>Tags</div>
                  <div>Joined</div>
                  <div className="text-right">Actions</div>
                </div>
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    Loading...
                  </div>
                ) : filteredSubscribers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No subscribers found
                  </div>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <div
                      key={subscriber.id}
                      className="grid grid-cols-6 gap-4 p-4 border-t items-center"
                    >
                      <div>{subscriber.name || "N/A"}</div>
                      <div>{subscriber.email}</div>
                      <div>
                        <Badge
                          variant={
                            subscriber.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {subscriber.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {subscriber.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div>
                        {new Date(subscriber.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex justify-end gap-2">
                        {canManageSubscribers && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedSubscriber(subscriber);
                                setNewSubscriber({
                                  email: subscriber.email,
                                  name: subscriber.name || "",
                                  tags: subscriber.tags,
                                });
                                setEditSubscriberOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeleteType("subscriber");
                                setDeleteItem(subscriber);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="newsletters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Newsletters</CardTitle>
              <CardDescription>
                View and manage your sent newsletters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 font-medium text-sm text-gray-500">
                  <div>Subject</div>
                  <div>Status</div>
                  <div>Recipients</div>
                  <div>Sent Date</div>
                  <div className="text-right">Actions</div>
                </div>
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    Loading...
                  </div>
                ) : newsletters.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No newsletters found
                  </div>
                ) : (
                  newsletters.map((newsletter) => (
                    <div
                      key={newsletter.id}
                      className="grid grid-cols-5 gap-4 p-4 border-t items-center"
                    >
                      <div>{newsletter.subject}</div>
                      <div>
                        <Badge
                          variant={
                            newsletter.status === "sent"
                              ? "default"
                              : newsletter.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {newsletter.status}
                        </Badge>
                      </div>
                      <div>{newsletter.metadata.recipient_count}</div>
                      <div>
                        {new Date(newsletter.sent_at).toLocaleDateString()}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewNewsletter(newsletter)}
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNewsletter(newsletter)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Newsletter Dialog */}
      <Dialog
        open={createNewsletterOpen}
        onOpenChange={setCreateNewsletterOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Newsletter</DialogTitle>
            <DialogDescription>
              Create and send a new newsletter to all subscribers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
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
              />
            </div>
            <div>
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
                rows={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateNewsletterOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateNewsletter}>Send Newsletter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subscriber Dialog */}
      <Dialog open={addSubscriberOpen} onOpenChange={setAddSubscriberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subscriber</DialogTitle>
            <DialogDescription>
              Add a new subscriber to your newsletter
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newSubscriber.email}
                onChange={(e) =>
                  setNewSubscriber({ ...newSubscriber, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                value={newSubscriber.name}
                onChange={(e) =>
                  setNewSubscriber({ ...newSubscriber, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Wedding", "Family", "Baby", "Premium", "Corporate"].map(
                  (tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag}
                        checked={newSubscriber.tags.includes(tag)}
                        onCheckedChange={(checked) => {
                          setNewSubscriber({
                            ...newSubscriber,
                            tags: checked
                              ? [...newSubscriber.tags, tag]
                              : newSubscriber.tags.filter((t) => t !== tag),
                          });
                        }}
                      />
                      <Label htmlFor={tag}>{tag}</Label>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddSubscriberOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddSubscriber}>Add Subscriber</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subscriber Dialog */}
      <Dialog open={editSubscriberOpen} onOpenChange={setEditSubscriberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscriber</DialogTitle>
            <DialogDescription>Edit subscriber information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={newSubscriber.name}
                onChange={(e) =>
                  setNewSubscriber({ ...newSubscriber, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Wedding", "Family", "Baby", "Premium", "Corporate"].map(
                  (tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${tag}`}
                        checked={newSubscriber.tags.includes(tag)}
                        onCheckedChange={(checked) => {
                          setNewSubscriber({
                            ...newSubscriber,
                            tags: checked
                              ? [...newSubscriber.tags, tag]
                              : newSubscriber.tags.filter((t) => t !== tag),
                          });
                        }}
                      />
                      <Label htmlFor={`edit-${tag}`}>{tag}</Label>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditSubscriberOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateSubscriber}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Newsletter Detail Dialog */}
      <Dialog
        open={newsletterDetailOpen}
        onOpenChange={setNewsletterDetailOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedNewsletter?.subject}</DialogTitle>
            <DialogDescription>
              Sent on{" "}
              {selectedNewsletter?.sent_at
                ? new Date(selectedNewsletter.sent_at).toLocaleString()
                : "N/A"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Recipients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedNewsletter?.metadata.recipient_count || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Open Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedNewsletter?.metadata.open_rate
                      ? `${selectedNewsletter.metadata.open_rate}%`
                      : "N/A"}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Click Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedNewsletter?.metadata.click_rate
                      ? `${selectedNewsletter.metadata.click_rate}%`
                      : "N/A"}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Label>Content</Label>
              <div className="mt-2 p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                {selectedNewsletter?.content}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {deleteType === "subscriber"
                ? "unsubscribe this subscriber"
                : "delete this newsletter"}
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
