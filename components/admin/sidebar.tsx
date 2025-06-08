"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  BarChart,
  FileText,
  ImageIcon,
  LayoutDashboard,
  Mail,
  MessageSquare,
  User,
  Users,
  LogOut,
  Settings,
  Home,
  Search,
  UserCheck,
  ShoppingCart,
} from "lucide-react";
import { useRole } from "@/components/admin/role-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/admin/auth-context";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { role, hasPermission, isLoading } = useRole();
  const { profile, signOut } = useAuth();

  // Format role name for display (e.g., "super_admin" -> "Super Admin")
  const formatRoleName = (roleName: string | undefined) => {
    if (!roleName) return "";
    return roleName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Define navigation items with required permissions
  const navItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      permission: "view_dashboard",
      shortcut: "⌘D",
    },
    {
      title: "Albums",
      href: "/admin/albums",
      icon: FileText,
      permission: "manage_albums",
      shortcut: "⌘A",
    },
    {
      title: "Gallery",
      href: "/admin/gallery",
      icon: ImageIcon,
      permission: "manage_gallery",
      shortcut: "⌘G",
    },
    {
      title: "Form Submissions",
      href: "/admin/submissions",
      icon: MessageSquare,
      permission: "manage_submissions",
      shortcut: "⌘M",
      badge: 3,
    },
    {
      title: "Newsletter",
      href: "/admin/newsletter",
      icon: Mail,
      permission: "manage_newsletter",
      shortcut: "⌘N",
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart,
      permission: "view_analytics",
      shortcut: "⌘V",
    },
  ];

  // Business management items (for Accounts role and above)
  const businessItems = [
    {
      title: "Customers",
      href: "/admin/customers",
      icon: UserCheck,
      permission: "manage_users",
      shortcut: "⌘C",
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
      permission: "manage_orders",
      shortcut: "⌘O",
    },
  ];

  // Settings submenu items
  const settingsItems = [
    {
      title: "User Management",
      href: "/admin/settings/users",
      icon: Users,
      permission: "manage_users",
    },
    {
      title: "General Settings",
      href: "/admin/settings",
      icon: Settings,
      permission: "view_dashboard",
    },
    {
      title: "Profile",
      href: "/admin/profile",
      icon: User,
      permission: "view_dashboard",
    },
  ];

  // If loading, show a simplified sidebar
  if (isLoading) {
    return (
      <Sidebar className="border-r border-slate-200 w-64">
        <SidebarHeader className="border-b border-slate-200 pb-2">
          <div className="flex items-center px-2 py-3">
            <Link
              href="/admin/dashboard"
              className="flex items-center group w-full"
            >
              <Image
                src="/G Album Logo (RED).svg"
                alt="G Album Logo"
                width={32}
                height={32}
                className="mr-2 transition-transform group-hover:scale-105"
              />
              <span className="text-lg font-semibold group-hover:text-red-600 transition-colors">
                G Album
              </span>
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex-1 overflow-y-auto">
          <div className="p-4 text-center text-slate-500">Loading...</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  // If guest or no role, show minimal sidebar
  if (role === "guest") {
    return (
      <Sidebar className="border-r border-slate-200 w-64">
        <SidebarHeader className="border-b border-slate-200 pb-2">
          <div className="flex items-center px-2 py-3">
            <Link
              href="/admin/login"
              className="flex items-center group w-full"
            >
              <Image
                src="/G Album Logo (RED).svg"
                alt="G Album Logo"
                width={32}
                height={32}
                className="mr-2 transition-transform group-hover:scale-105"
              />
              <span className="text-lg font-semibold group-hover:text-red-600 transition-colors">
                G Album
              </span>
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex-1 overflow-y-auto">
          <div className="p-4 text-center text-slate-500">
            Please sign in to access the admin panel.
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="border-r border-slate-200 w-64">
      <SidebarHeader className="border-b border-slate-200 pb-2">
        <div className="flex items-center px-2 py-3">
          <Link
            href="/admin/dashboard"
            className="flex items-center group w-full"
          >
            <Image
              src="/G Album Logo (RED).svg"
              alt="G Album Logo"
              width={32}
              height={32}
              className="mr-2 transition-transform group-hover:scale-105"
            />
            <span className="text-lg font-semibold group-hover:text-red-600 transition-colors">
              G Album
            </span>
          </Link>
        </div>
        <div className="px-3 mt-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 h-9 bg-slate-50 border-slate-200 focus-visible:ring-red-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        {/* Quick Actions */}
        <div className="px-3 py-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Back to Website">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-slate-600 hover:text-red-600"
                >
                  <Home className="h-5 w-5" />
                  <span>Back to Website</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        <SidebarSeparator className="my-2" />

        {/* Main Navigation */}
        <div className="px-3 py-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
            Main
          </h4>
          <SidebarMenu>
            {navItems.map((item) => {
              // Only show items the user has permission to see
              if (!hasPermission(item.permission)) return null;

              const isActive = pathname === item.href;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="flex-1 truncate">{item.title}</span>
                      {item.badge && (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      {item.shortcut && (
                        <kbd className="hidden xl:inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium opacity-70">
                          {item.shortcut}
                        </kbd>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>

        <SidebarSeparator className="my-2" />

        {/* Business Management (Accounts role and above) */}
        {businessItems.some((item) => hasPermission(item.permission)) && (
          <>
            <div className="px-3 py-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
                Business
              </h4>
              <SidebarMenu>
                {businessItems.map((item) => {
                  // Only show items the user has permission to see
                  if (!hasPermission(item.permission)) return null;

                  const isActive = pathname === item.href;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="flex-1 truncate">{item.title}</span>
                          {item.shortcut && (
                            <kbd className="hidden xl:inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium opacity-70">
                              {item.shortcut}
                            </kbd>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>

            <SidebarSeparator className="my-2" />
          </>
        )}

        {/* Settings Navigation */}
        <div className="px-3 py-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
            Settings
          </h4>
          <SidebarMenu>
            {settingsItems.map((item) => {
              // Only show items the user has permission to see
              if (!hasPermission(item.permission)) return null;

              const isActive = pathname === item.href;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="flex-1 truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 pt-2">
        <div className="px-3 py-2">
          <div className="text-xs text-slate-500 mb-2">Logged in as:</div>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">
                {profile?.full_name || "Admin User"}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {profile?.role?.name && formatRoleName(profile.role.name)}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
