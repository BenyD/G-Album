"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  ShoppingBag,
  Building2,
  IndianRupee,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import type {
  Customer,
  CustomerFlag,
  CreateCustomerInput,
  UpdateCustomerInput,
  CreateCustomerFlagInput,
} from "@/lib/types/customer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const supabase = createClient();

// Add debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function CustomersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isFlagCustomerOpen, setIsFlagCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<CreateCustomerInput>({
    studio_name: "",
    email: "",
    phone: "",
    address: "",
    reference_phone: "",
    reference_name: "",
  });
  const [flagReason, setFlagReason] = useState("");

  // Set up debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Fetch customers
  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Customer[];
    },
  });

  // Fetch active flags
  const { data: activeFlags } = useQuery({
    queryKey: ["active-flags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("active_customer_flags")
        .select("*");

      if (error) throw error;
      return data as CustomerFlag[];
    },
  });

  // Add customer mutation
  const addCustomerMutation = useMutation({
    mutationFn: async (newCustomer: CreateCustomerInput) => {
      const { data, error } = await supabase
        .from("customers")
        .insert([newCustomer])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsAddCustomerOpen(false);
      setNewCustomer({
        studio_name: "",
        email: "",
        phone: "",
        address: "",
        reference_phone: "",
        reference_name: "",
      });
      toast.success("Customer added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add customer: " + error.message);
    },
  });

  // Update customer status mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCustomerInput;
    }) => {
      const { error } = await supabase
        .from("customers")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update customer: " + error.message);
    },
  });

  // Flag customer mutation
  const flagCustomerMutation = useMutation({
    mutationFn: async (input: CreateCustomerFlagInput) => {
      const { error } = await supabase.from("customer_flags").insert([input]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-flags"] });
      setIsFlagCustomerOpen(false);
      setFlagReason("");
      setSelectedCustomer(null);
      toast.success("Customer flagged successfully");
    },
    onError: (error) => {
      toast.error("Failed to flag customer: " + error.message);
    },
  });

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomerMutation.mutate(newCustomer);
  };

  const handleStatusChange = (customer: Customer) => {
    updateCustomerMutation.mutate({
      id: customer.id,
      data: { is_active: !customer.is_active },
    });
  };

  const handleFlagCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    flagCustomerMutation.mutate({
      customer_id: selectedCustomer.id,
      reason: flagReason,
    });
  };

  const isCustomerFlagged = (customerId: string) => {
    return activeFlags?.some((flag) => flag.customer_id === customerId);
  };

  const handleRowClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    if (!customersData) return [];

    let filtered = [...customersData];

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.studio_name.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower) ||
          customer.phone.toLowerCase().includes(searchLower) ||
          customer.address.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((customer) =>
        statusFilter === "Active" ? customer.is_active : !customer.is_active
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
          return a.studio_name.localeCompare(b.studio_name);
        case "name-desc":
          return b.studio_name.localeCompare(a.studio_name);
        case "most-orders":
          return b.total_orders - a.total_orders;
        default: // newest
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    return filtered;
  }, [customersData, debouncedSearchTerm, statusFilter, sortBy]);

  if (isLoadingCustomers) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-2xl font-bold text-red-900">Customers</h1>
        <p className="text-muted-foreground">
          Manage customer profiles and information
        </p>
        <div className="absolute -bottom-1 left-0 w-12 h-1 bg-red-600 rounded-full" />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold text-red-900">
                  {customersData?.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Customers
                </p>
                <p className="text-2xl font-bold text-red-900">
                  {customersData?.filter((c) => c.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-red-900">
                  {customersData?.reduce((sum, c) => sum + c.total_orders, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Orders</p>
                <p className="text-2xl font-bold text-red-900">
                  {customersData?.length > 0
                    ? (
                        customersData.reduce(
                          (sum, c) => sum + c.total_orders,
                          0
                        ) / customersData.length
                      ).toFixed(1)
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-red-100">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-10 border-red-100 focus:border-red-200 focus:ring-red-100"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-100 hover:bg-red-600 hover:text-white transition-colors group"
                  >
                    <Filter className="mr-2 h-4 w-4 text-red-600 group-hover:text-white transition-colors" />
                    {statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter("All")}>
                    All Customers
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Active")}>
                    Active Customers
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Inactive")}>
                    Inactive Customers
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-100 hover:bg-red-600 hover:text-white transition-colors group"
                  >
                    <ArrowUpDown className="mr-2 h-4 w-4 text-red-600 group-hover:text-white transition-colors" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem onClick={() => setSortBy("newest")}>
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
                    Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name-desc")}>
                    Name (Z-A)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("most-orders")}>
                    Most Orders
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Customer Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setIsAddCustomerOpen(true)}
          className="relative group overflow-hidden bg-red-600 hover:bg-red-700 text-white transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-500 to-red-600 group-hover:scale-105 transition-transform duration-300" />
          <span className="relative flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </span>
        </Button>
      </div>

      {/* Add Customer Modal */}
      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-900">
              Add New Customer
            </DialogTitle>
            <DialogDescription>
              Create a new customer profile. Fill in all the required details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCustomer}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="studio_name" className="text-red-900">
                  Name / Studio Name *
                </Label>
                <Input
                  id="studio_name"
                  value={newCustomer.studio_name}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      studio_name: e.target.value,
                    })
                  }
                  placeholder="John Doe / ABC Photography"
                  className="border-red-100 focus:border-red-200 focus:ring-red-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-red-900">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        email: e.target.value,
                      })
                    }
                    placeholder="customer@example.com"
                    className="border-red-100 focus:border-red-200 focus:ring-red-100"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-red-900">
                    Contact Number *
                  </Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        phone: e.target.value,
                      })
                    }
                    placeholder="+91 98765 43210"
                    className="border-red-100 focus:border-red-200 focus:ring-red-100"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address" className="text-red-900">
                  Address *
                </Label>
                <Textarea
                  id="address"
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      address: e.target.value,
                    })
                  }
                  placeholder="123 Main St, City, State"
                  className="border-red-100 focus:border-red-200 focus:ring-red-100 min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="reference_phone" className="text-red-900">
                    Reference Phone (Optional)
                  </Label>
                  <Input
                    id="reference_phone"
                    value={newCustomer.reference_phone}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        reference_phone: e.target.value,
                      })
                    }
                    placeholder="+91 98765 43210"
                    className="border-red-100 focus:border-red-200 focus:ring-red-100"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="reference_name" className="text-red-900">
                    Reference Name (Optional)
                  </Label>
                  <Input
                    id="reference_name"
                    value={newCustomer.reference_name}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        reference_name: e.target.value,
                      })
                    }
                    placeholder="Jane Doe"
                    className="border-red-100 focus:border-red-200 focus:ring-red-100"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddCustomerOpen(false)}
                className="border-red-100 hover:bg-red-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !newCustomer.studio_name ||
                  !newCustomer.email ||
                  !newCustomer.phone ||
                  !newCustomer.address
                }
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Create Customer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Customers Table */}
      {filteredCustomers.length === 0 ? (
        <Card className="border-red-100">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              No Customers Found
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {searchTerm || statusFilter !== "All"
                ? "No customers match your current filters. Try adjusting your search criteria or clearing filters."
                : "There are no customers yet. Add your first customer to get started."}
            </p>
            {(searchTerm || statusFilter !== "All") && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-red-100 hover:bg-red-50"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("All");
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-red-100">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-red-50/50">
                <TableHead>Name / Studio</TableHead>
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
                <TableRow
                  key={customer.id}
                  className="cursor-pointer hover:bg-red-50/50"
                  onClick={() => handleRowClick(customer)}
                >
                  <TableCell className="font-medium">
                    {customer.studio_name}
                    {isCustomerFlagged(customer.id) && (
                      <Badge variant="destructive" className="ml-2">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Flagged
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant={customer.is_active ? "default" : "secondary"}
                      className="cursor-pointer bg-red-600 hover:bg-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(customer);
                      }}
                    >
                      {customer.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.total_orders}</TableCell>
                  <TableCell>
                    ₹{customer.total_spent.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-red-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/admin/orders?customer=${customer.id}`
                            );
                          }}
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          View Orders
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                            setIsFlagCustomerOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Flag Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={isFlagCustomerOpen} onOpenChange={setIsFlagCustomerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Customer</DialogTitle>
            <DialogDescription>
              Add a reason for flagging this customer. This will be visible when
              creating orders.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFlagCustomer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                required
                placeholder="Enter the reason for flagging this customer..."
              />
            </div>
            <Button type="submit" variant="destructive" className="w-full">
              Flag Customer
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Customer Details Side Panel */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {selectedCustomer && (
            <>
              <SheetHeader className="space-y-4 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <SheetTitle className="text-2xl font-bold">
                      {selectedCustomer.studio_name}
                    </SheetTitle>
                    <div className="flex items-center mt-1">
                      <Badge
                        variant={
                          selectedCustomer.is_active ? "default" : "secondary"
                        }
                        className="mr-2"
                      >
                        {selectedCustomer.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {isCustomerFlagged(selectedCustomer.id) && (
                        <Badge
                          variant="destructive"
                          className="flex items-center"
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Flagged
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    <a
                      href={`mailto:${selectedCustomer.email}`}
                      className="hover:underline"
                    >
                      {selectedCustomer.email}
                    </a>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="hover:underline"
                    >
                      {selectedCustomer.phone}
                    </a>
                  </div>
                  <div className="flex items-start text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                    <span className="whitespace-pre-wrap">
                      {selectedCustomer.address}
                    </span>
                  </div>
                </div>
              </SheetHeader>

              <Separator className="my-4" />

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium flex items-center mb-3">
                    <Building2 className="w-4 h-4 mr-2" />
                    Business Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                      <div className="text-sm text-muted-foreground mb-1">
                        Total Orders
                      </div>
                      <div className="text-2xl font-bold flex items-center">
                        <ShoppingBag className="w-4 h-4 mr-2 text-muted-foreground" />
                        {selectedCustomer.total_orders}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-sm text-muted-foreground mb-1">
                        Total Spent
                      </div>
                      <div className="text-2xl font-bold flex items-center">
                        <IndianRupee className="w-4 h-4 mr-2 text-muted-foreground" />
                        {selectedCustomer.total_spent.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {(selectedCustomer.reference_name ||
                  selectedCustomer.reference_phone) && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium flex items-center mb-3">
                        <UserCheck className="w-4 h-4 mr-2" />
                        Reference Information
                      </h3>
                      <div className="space-y-2">
                        {selectedCustomer.reference_name && (
                          <div className="flex items-center text-sm">
                            <User className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>{selectedCustomer.reference_name}</span>
                          </div>
                        )}
                        {selectedCustomer.reference_phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                            <a
                              href={`tel:${selectedCustomer.reference_phone}`}
                              className="hover:underline"
                            >
                              {selectedCustomer.reference_phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <h3 className="text-sm font-medium flex items-center mb-3">
                    <Clock className="w-4 h-4 mr-2" />
                    System Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>
                        Created:{" "}
                        {format(new Date(selectedCustomer.created_at), "PPpp")}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>
                        Last Updated:{" "}
                        {format(new Date(selectedCustomer.updated_at), "PPpp")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <SheetFooter className="flex-row gap-2 sm:flex-row">
                <Button
                  className="flex-1"
                  onClick={() =>
                    router.push(`/admin/orders?customer=${selectedCustomer.id}`)
                  }
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  View Orders
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setIsFlagCustomerOpen(true);
                    setIsDetailsOpen(false);
                  }}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Flag Customer
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
