"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  Settings,
  User,
  Home,
  Search,
  PlusCircle,
  MessageSquare,
  BarChart3,
  LayoutDashboard,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/components/admin/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export default function AdminHeader() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Get the current page title based on the pathname
  const getPageTitle = () => {
    const path = pathname.split("/").filter(Boolean);
    if (path.length === 1) return "Dashboard";

    // Handle nested routes
    if (path.length > 2 && path[1] === "settings") {
      if (path[2] === "users") return "User Management";
      return path[2].charAt(0).toUpperCase() + path[2].slice(1);
    }

    return path[1].charAt(0).toUpperCase() + path[1].slice(1);
  };

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const path = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    if (path.length > 1) {
      breadcrumbs.push({ name: "Admin", href: "/admin/dashboard" });

      if (path[1] === "settings" && path.length > 2) {
        breadcrumbs.push({ name: "Settings", href: "/admin/settings" });
        breadcrumbs.push({
          name: path[2] === "users" ? "User Management" : path[2],
          href: pathname,
        });
      } else if (path[1] !== "dashboard") {
        breadcrumbs.push({
          name: path[1].charAt(0).toUpperCase() + path[1].slice(1),
          href: pathname,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Quick actions for the header
  const quickActions = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      shortcut: "D",
    },
    {
      name: "New Album",
      href: "/admin/albums",
      icon: PlusCircle,
      shortcut: "A",
    },
    {
      name: "Messages",
      href: "/admin/submissions",
      icon: MessageSquare,
      shortcut: "M",
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      shortcut: "G",
    },
  ];

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!profile?.full_name) return "GA";
    return profile.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Format role name for display
  const formatRoleName = (roleName: string) => {
    if (!roleName) return "";
    // Convert snake_case to Title Case and handle special cases
    return roleName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <header
      className={`sticky top-0 z-30 w-full border-b transition-all duration-200 ${
        scrolled ? "bg-white/95 backdrop-blur-xs shadow-xs" : "bg-white"
      }`}
    >
      <div className="w-full h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          {/* Mobile Sidebar Trigger */}
          <SidebarTrigger className="md:hidden" />

          {/* Logo & Breadcrumbs */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Desktop Logo */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 font-semibold text-base lg:text-lg text-slate-900 hover:text-red-600 transition-colors"
              >
                <div className="h-7 w-7 lg:h-8 lg:w-8 rounded-md bg-red-600 flex items-center justify-center text-white font-bold text-sm lg:text-base">
                  G
                </div>
                <span className="hidden lg:inline">G Album</span>
              </Link>
            </div>

            {/* Breadcrumbs - Hidden on mobile */}
            <nav className="hidden md:flex items-center space-x-1 text-sm text-slate-500 min-w-0">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center min-w-0">
                  {index > 0 && <span className="mx-1 text-slate-300">/</span>}
                  <Link
                    href={crumb.href}
                    className={`hover:text-red-600 transition-colors truncate ${
                      index === breadcrumbs.length - 1
                        ? "text-slate-700 font-medium"
                        : ""
                    }`}
                  >
                    {crumb.name}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Mobile Title */}
            <div className="md:hidden min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-slate-800 truncate">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Command Search - Desktop Only */}
          <div className="hidden lg:flex flex-1 items-center justify-center px-4 max-w-md">
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-sm text-slate-500 font-normal h-9 px-3"
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span>Search...</span>
                  </div>
                  <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[520px] p-0" align="center">
                <div className="p-2 border-b">
                  <div className="flex items-center px-3 py-2">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                      placeholder="Search commands, pages, and more..."
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                    />
                  </div>
                </div>
                <div className="p-2">
                  <div className="grid gap-2">
                    {quickActions.map((action) => (
                      <Link
                        key={action.name}
                        href={action.href}
                        className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                      >
                        <action.icon className="h-4 w-4" />
                        <span className="flex-1">{action.name}</span>
                        <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium opacity-100 flex">
                          ⌘{action.shortcut}
                        </kbd>
                      </Link>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Visit Website Button */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden md:flex items-center gap-1.5 text-slate-600 hover:text-red-600"
          >
            <Link href="/" target="_blank">
              <ExternalLink className="h-4 w-4" />
              <span>Visit Website</span>
            </Link>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={profile?.avatar_url || ""}
                    alt={profile?.full_name || "User"}
                  />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.full_name}
                  </p>
                  <p className="text-xs leading-none text-slate-500">
                    {formatRoleName(profile?.role?.name || "")}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
