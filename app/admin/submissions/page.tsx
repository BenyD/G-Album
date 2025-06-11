"use client";

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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RoleBasedContent } from "@/components/admin/role-based-content";
import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface Submission {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  message: string;
  status: "New" | "Replied";
  created_at: string;
  updated_at: string;
}

export default function SubmissionsPage() {
  const { role } = useRole();
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "name" | "status">(
    "created_at"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load submissions",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Handle status change
  const handleStatusChange = async (id: string, newStatus: "Replied") => {
    try {
      const supabase = createClient();
      const now = new Date().toISOString();

      const { error } = await supabase
        .from("contact_submissions")
        .update({
          status: newStatus,
          updated_at: now,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update local state
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === id ? { ...sub, status: newStatus, updated_at: now } : sub
        )
      );

      // Update selected submission if it's the one being modified
      if (selectedSubmission?.id === id) {
        setSelectedSubmission((prev) =>
          prev ? { ...prev, status: newStatus, updated_at: now } : null
        );
      }

      toast.success("Submission marked as replied");
    } catch (error) {
      console.error("Error updating submission status:", error);
      toast.error("Failed to update submission status");
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("contact_submissions")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update local state
      setSubmissions((prev) => prev.filter((sub) => sub.id !== id));

      // Close the dialog if the deleted submission was selected
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null);
      }

      toast.success("Submission deleted successfully");
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast.error("Failed to delete submission");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Filter and sort submissions
  const filteredAndSortedSubmissions = useMemo(() => {
    const filtered = submissions.filter((submission) => {
      const matchesSearch =
        submission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (submission.email?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        submission.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        submission.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    // Sort submissions
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "created_at":
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [submissions, searchQuery, sortBy, sortOrder, statusFilter]);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Replied":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Get submissions by status
  const getSubmissionsByStatus = (status: string) => {
    if (status === "all") return filteredAndSortedSubmissions;
    return filteredAndSortedSubmissions.filter(
      (sub) => sub.status.toLowerCase() === status.toLowerCase()
    );
  };

  // Check if filters are active
  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    sortBy !== "created_at" ||
    sortOrder !== "desc";

  // Update the mobile card view actions
  const renderMobileCardActions = (submission: Submission) => (
    <div className="flex gap-1">
      {submission.status !== "Replied" && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={(e) => {
            e.stopPropagation();
            handleStatusChange(submission.id, "Replied");
          }}
        >
          <Check className="h-3 w-3" />
        </Button>
      )}
      <RoleBasedContent permissions={["manage_roles", "manage_albums"]}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            if (
              window.confirm("Are you sure you want to delete this submission?")
            ) {
              handleDelete(submission.id);
            }
          }}
        >
          <Trash className="h-3 w-3" />
        </Button>
      </RoleBasedContent>
    </div>
  );

  // Update the desktop table actions
  const renderTableActions = (submission: Submission) => (
    <td className="p-4 align-middle">
      <div className="flex items-center gap-2">
        {submission.status !== "Replied" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(submission.id, "Replied");
            }}
          >
            <Check className="h-4 w-4 mr-1" />
            Mark as Replied
          </Button>
        )}
        <RoleBasedContent permissions={["manage_roles", "manage_albums"]}>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              if (
                window.confirm(
                  "Are you sure you want to delete this submission?"
                )
              ) {
                handleDelete(submission.id);
              }
            }}
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </RoleBasedContent>
      </div>
    </td>
  );

  // Update the dialog actions
  const renderDialogActions = (submission: Submission) => (
    <div className="flex flex-col sm:flex-row gap-2">
      {submission.status !== "Replied" && (
        <Button
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => handleStatusChange(submission.id, "Replied")}
        >
          <Check className="h-4 w-4 mr-1" />
          Mark as Replied
        </Button>
      )}
      <RoleBasedContent permissions={["manage_roles", "manage_albums"]}>
        <Button
          variant="destructive"
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => {
            if (
              window.confirm("Are you sure you want to delete this submission?")
            ) {
              handleDelete(submission.id);
            }
          }}
        >
          <Trash className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </RoleBasedContent>
    </div>
  );

  return (
    <div className="space-y-4 p-4 md:p-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Form Submissions</AlertTitle>
        <AlertDescription className="text-blue-700">
          You are viewing as <strong>{role}</strong>. Click on any submission to
          view full details.
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Form Submissions
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading
              ? "Loading submissions..."
              : `Showing ${filteredAndSortedSubmissions.length} of ${submissions.length} submissions`}
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
            <Button
              variant="outline"
              onClick={() => {
                if (sortBy === "created_at") {
                  setSortBy("name");
                } else if (sortBy === "name") {
                  setSortBy("status");
                } else {
                  setSortBy("created_at");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }
              }}
              className="w-full sm:w-auto"
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort by {sortBy} ({sortOrder})
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setSortBy("created_at");
                  setSortOrder("desc");
                }}
                className="w-full sm:w-auto"
              >
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
              <CardDescription>
                View and manage contact form submissions from your website
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {filteredAndSortedSubmissions.map((submission) => (
                  <Card
                    key={submission.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">
                            {submission.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {submission.email}
                          </p>
                        </div>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {submission.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(submission.created_at)}
                        </span>
                        {renderMobileCardActions(submission)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <table className="w-full caption-bottom text-sm hidden md:table">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Message
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredAndSortedSubmissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <td className="p-4 align-middle font-medium">
                        {submission.name}
                      </td>
                      <td className="p-4 align-middle">{submission.email}</td>
                      <td className="p-4 align-middle">
                        <div className="max-w-[300px] truncate">
                          {submission.message}
                        </div>
                      </td>
                      <td className="p-4 align-middle whitespace-nowrap">
                        {formatDate(submission.created_at)}
                      </td>
                      <td className="p-4 align-middle">
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </td>
                      {renderTableActions(submission)}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAndSortedSubmissions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No submissions found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">New Submissions</CardTitle>
              <CardDescription>
                View and manage new contact form submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {getSubmissionsByStatus("new").map((submission) => (
                  <Card
                    key={submission.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">
                            {submission.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {submission.email}
                          </p>
                        </div>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {submission.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(submission.created_at)}
                        </span>
                        {renderMobileCardActions(submission)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <table className="w-full caption-bottom text-sm hidden md:table">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Message
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {getSubmissionsByStatus("new").map((submission) => (
                    <tr
                      key={submission.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <td className="p-4 align-middle font-medium">
                        {submission.name}
                      </td>
                      <td className="p-4 align-middle">{submission.email}</td>
                      <td className="p-4 align-middle">
                        <div className="max-w-[300px] truncate">
                          {submission.message}
                        </div>
                      </td>
                      <td className="p-4 align-middle whitespace-nowrap">
                        {formatDate(submission.created_at)}
                      </td>
                      <td className="p-4 align-middle">
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </td>
                      {renderTableActions(submission)}
                    </tr>
                  ))}
                </tbody>
              </table>
              {getSubmissionsByStatus("new").length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No new submissions found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="replied" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Replied Submissions</CardTitle>
              <CardDescription>
                View submissions you&apos;ve already replied to
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {getSubmissionsByStatus("replied").map((submission) => (
                  <Card
                    key={submission.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">
                            {submission.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {submission.email}
                          </p>
                        </div>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {submission.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(submission.created_at)}
                        </span>
                        {renderMobileCardActions(submission)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <table className="w-full caption-bottom text-sm hidden md:table">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Message
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {getSubmissionsByStatus("replied").map((submission) => (
                    <tr
                      key={submission.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <td className="p-4 align-middle font-medium">
                        {submission.name}
                      </td>
                      <td className="p-4 align-middle">{submission.email}</td>
                      <td className="p-4 align-middle">
                        <div className="max-w-[300px] truncate">
                          {submission.message}
                        </div>
                      </td>
                      <td className="p-4 align-middle whitespace-nowrap">
                        {formatDate(submission.created_at)}
                      </td>
                      <td className="p-4 align-middle">
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </td>
                      {renderTableActions(submission)}
                    </tr>
                  ))}
                </tbody>
              </table>
              {getSubmissionsByStatus("replied").length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No replied submissions found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submission Detail Dialog */}
      <Dialog
        open={!!selectedSubmission}
        onOpenChange={() => setSelectedSubmission(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Submission Details
            </DialogTitle>
            <DialogDescription>
              Full details of the form submission
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Status and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Badge className={getStatusColor(selectedSubmission.status)}>
                  {selectedSubmission.status}
                </Badge>
                {renderDialogActions(selectedSubmission)}
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    Name
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {selectedSubmission.name}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Date
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {formatDate(selectedSubmission.created_at)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="text-sm text-muted-foreground pl-6 break-all">
                    {selectedSubmission.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4" />
                    Phone
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {selectedSubmission.phone}
                  </p>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedSubmission.message}
                  </p>
                </div>
              </div>

              {/* Submission ID */}
              <div className="text-xs text-muted-foreground border-t pt-4">
                Submission ID: #{selectedSubmission.id}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
