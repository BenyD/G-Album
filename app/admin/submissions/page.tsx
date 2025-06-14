"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown,
  Check,
  Search,
  Trash,
  Calendar,
  Mail,
  Phone,
  User,
  MessageSquare,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import { createClient, logActivity } from "@/utils/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "name" | "status">(
    "created_at"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] =
    useState<Submission | null>(null);

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
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
      toast.error("Failed to load submissions");
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

      // Fetch submission details for logging
      const { data: submissionDetails, error: fetchDetailsError } =
        await supabase
          .from("contact_submissions")
          .select("*")
          .eq("id", id)
          .single();
      if (fetchDetailsError) throw fetchDetailsError;

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Could not get current user");

      // Log the activity
      await logActivity("submission_marked_as_replied", {
        submission_id: id,
        name: submissionDetails.name,
        email: submissionDetails.email,
        marked_by: user.id,
      });

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

  const handleDeleteClick = (submission: Submission) => {
    setSubmissionToDelete(submission);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (submissionToDelete) {
      await handleDelete(submissionToDelete.id);
      setDeleteDialogOpen(false);
      setSubmissionToDelete(null);
      if (selectedSubmission?.id === submissionToDelete.id) {
        setSelectedSubmission(null);
      }
    }
  };

  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-2xl font-bold text-red-900">Form Submissions</h1>
        <p className="text-muted-foreground">
          Manage and respond to contact form submissions
        </p>
        <div className="absolute -bottom-1 left-0 w-12 h-1 bg-red-600 rounded-full" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Submissions
                </p>
                <p className="text-2xl font-bold text-red-900">
                  {submissions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Submissions</p>
                <p className="text-2xl font-bold text-red-900">
                  {submissions.filter((s) => s.status === "New").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Replied</p>
                <p className="text-2xl font-bold text-red-900">
                  {submissions.filter((s) => s.status === "Replied").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-red-100">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search submissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-red-100 focus:border-red-200 focus:ring-red-100"
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px] border-red-100">
                  <Filter className="w-4 h-4 mr-2 text-red-600" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(value) =>
                  setSortBy(value as "created_at" | "name" | "status")
                }
              >
                <SelectTrigger className="w-full sm:w-[140px] border-red-100">
                  <ArrowUpDown className="w-4 h-4 mr-2 text-red-600" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      {filteredAndSortedSubmissions.length === 0 ? (
        <Card className="border-red-100">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              No Submissions Found
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {searchQuery || statusFilter !== "all"
                ? "No submissions match your current filters. Try adjusting your search criteria or clearing filters."
                : "When you receive form submissions from your website, they will appear here."}
            </p>
            {(searchQuery || statusFilter !== "all") && (
              <Button
                variant="outline"
                className="border-red-100 hover:bg-red-50"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setSortBy("created_at");
                  setSortOrder("desc");
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-red-100 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-red-50/50 bg-red-50/30">
                <TableHead className="w-[250px]">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-red-600" />
                    Name & Email
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-red-600" />
                    Message
                  </div>
                </TableHead>
                <TableHead className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    Date
                  </div>
                </TableHead>
                <TableHead className="w-[120px]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600" />
                    Status
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">
                  <div className="flex items-center gap-2">Actions</div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedSubmissions.map((submission) => (
                <TableRow
                  key={submission.id}
                  className="group cursor-pointer hover:bg-red-50/50"
                >
                  <TableCell onClick={() => setSelectedSubmission(submission)}>
                    <div>
                      <p className="font-medium text-red-900">
                        {submission.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {submission.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => setSelectedSubmission(submission)}>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {submission.message}
                    </p>
                  </TableCell>
                  <TableCell onClick={() => setSelectedSubmission(submission)}>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(submission.created_at), "MMM d, h:mm a")}
                    </p>
                  </TableCell>
                  <TableCell onClick={() => setSelectedSubmission(submission)}>
                    <Badge
                      className={
                        submission.status === "New"
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }
                    >
                      {submission.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {submission.status !== "Replied" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 hover:bg-green-50 hover:text-green-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(submission.id, "Replied");
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 hover:bg-red-50 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(submission);
                        }}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Side Panel */}
      <Sheet
        open={!!selectedSubmission}
        onOpenChange={() => setSelectedSubmission(null)}
      >
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader className="space-y-4 pb-6 border-b">
            <SheetTitle className="text-xl font-semibold text-red-900">
              Submission Details
            </SheetTitle>
            <SheetDescription>
              View the complete submission information
            </SheetDescription>
            {selectedSubmission && (
              <Badge
                className={
                  selectedSubmission.status === "New"
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }
              >
                {selectedSubmission.status}
              </Badge>
            )}
          </SheetHeader>

          {selectedSubmission && (
            <div className="mt-6 space-y-6 pb-24">
              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <User className="w-4 h-4 text-red-600" />
                    Name
                  </div>
                  <p className="text-sm pl-6">{selectedSubmission.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="w-4 h-4 text-red-600" />
                    Date
                  </div>
                  <p className="text-sm pl-6">
                    {format(new Date(selectedSubmission.created_at), "PPP p")}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Mail className="w-4 h-4 text-red-600" />
                    Email
                  </div>
                  <p className="text-sm pl-6 break-all">
                    {selectedSubmission.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Phone className="w-4 h-4 text-red-600" />
                    Phone
                  </div>
                  <p className="text-sm pl-6">{selectedSubmission.phone}</p>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MessageSquare className="w-4 h-4 text-red-600" />
                  Message
                </div>
                <div className="bg-red-50/50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedSubmission.message}
                  </p>
                </div>
              </div>

              {/* Submission ID */}
              <div className="text-xs text-muted-foreground">
                Submission ID: #{selectedSubmission.id}
              </div>
            </div>
          )}

          <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                variant="outline"
                className="w-full sm:flex-1 border-red-100 hover:bg-red-50"
                onClick={() => setSelectedSubmission(null)}
              >
                Close
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this submission? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 bg-red-50/50 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">
                  {submissionToDelete?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-600" />
                <span className="text-sm">{submissionToDelete?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                <span className="text-sm">
                  {submissionToDelete?.created_at &&
                    format(new Date(submissionToDelete.created_at), "PPP")}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1 border-red-100"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDeleteConfirm}
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete Submission
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
