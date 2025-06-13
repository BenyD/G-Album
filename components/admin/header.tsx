"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Settings, User } from "lucide-react";
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

export default function AdminHeader() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!profile?.full_name) return "GA";
    return profile.full_name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  // Utility to format role names
  const formatRoleName = (roleName: string) => {
    if (!roleName) return "";
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
      <div className="w-full h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 md:px-6 max-w-[1920px] mx-auto">
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
                <Image
                  src="/G Album Logo (RED).png"
                  alt="G Album Logo"
                  width={32}
                  height={32}
                  className="transition-transform hover:scale-105"
                  priority
                />
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
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Command Bar Shortcut Hint */}
          <div className="hidden md:flex items-center mr-2 text-xs text-slate-500 bg-slate-100 rounded px-2 py-1 select-none">
            <span className="font-mono">
              {typeof window !== "undefined" &&
              window.navigator.platform.toLowerCase().includes("mac")
                ? "⌘"
                : "Ctrl+"}
              K
            </span>
            <span className="ml-1">to open command bar</span>
          </div>

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
