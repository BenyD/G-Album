"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
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
  UserCheck,
  ShoppingCart,
  ExternalLink,
  History,
} from "lucide-react";
import { useRole } from "@/components/admin/role-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/admin/auth-context";
import { createClient } from "@/utils/supabase/client";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string;
  shortcut?: string;
  badge?: number | null;
  showForVisitor?: boolean;
  hideForVisitor?: boolean;
  superAdminOnly?: boolean;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission, isLoading } = useRole();
  const { role, profile, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMac, setIsMac] = useState(true);
  const supabase = createClient();

  // Detect OS for shortcut display
  useEffect(() => {
    if (typeof window !== "undefined") {
      const platform = window.navigator.platform.toLowerCase();
      setIsMac(platform.includes("mac"));
    }
  }, []);

  // Keyboard shortcut navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is on input/textarea/select
      const tag = (e.target as HTMLElement)?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

      const metaOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      if (!metaOrCtrl) return;

      // Map shortcut keys to hrefs
      const shortcutMap: Record<string, string> = {
        d: "/admin/dashboard",
        a: "/admin/albums",
        g: "/admin/gallery",
        m: "/admin/submissions",
        n: "/admin/newsletter",
        v: "/admin/analytics",
        c: "/admin/customers",
        o: "/admin/orders",
      };
      const key = e.key.toLowerCase();
      if (shortcutMap[key]) {
        e.preventDefault();
        router.push(shortcutMap[key]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMac, router]);

  // Fetch unread submissions count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from("contact_submissions")
          .select("*", { count: "exact", head: true })
          .eq("status", "New");

        if (error) {
          console.error("Error fetching unread count:", error.message);
          return;
        }

        setUnreadCount(count || 0);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();

    // Subscribe to changes
    const channel = supabase
      .channel("submissions_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contact_submissions",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  // Format role name for display (e.g., "super_admin" -> "Super Admin")
  const formatRoleName = (roleName: string | undefined | null) => {
    if (!roleName) return "";
    return roleName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Check if user is super admin
  const isSuperAdmin = role?.name === "super_admin";

  // Define navigation items with required permissions
  const navItems: SidebarItem[] = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      permission: "view_dashboard",
      shortcut: "⌘D",
      showForVisitor: true,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart,
      permission: "view_analytics",
      shortcut: "⌘V",
      showForVisitor: true,
    },
    {
      title: "Albums",
      href: "/admin/albums",
      icon: FileText,
      permission: "manage_albums",
      shortcut: "⌘A",
      hideForVisitor: true,
    },
    {
      title: "Gallery",
      href: "/admin/gallery",
      icon: ImageIcon,
      permission: "manage_gallery",
      shortcut: "⌘G",
      hideForVisitor: true,
    },
    {
      title: "Form Submissions",
      href: "/admin/submissions",
      icon: MessageSquare,
      permission: "manage_submissions",
      shortcut: "⌘M",
      badge: unreadCount > 0 ? unreadCount : null,
      hideForVisitor: true,
    },
    {
      title: "Newsletter",
      href: "/admin/newsletter",
      icon: Mail,
      permission: "manage_newsletter",
      shortcut: "⌘N",
      hideForVisitor: true,
    },
  ];

  // Business management items (for Editor role and above)
  const businessItems: SidebarItem[] = [
    {
      title: "Customers",
      href: "/admin/customers",
      icon: UserCheck,
      permission: "view_customers",
      shortcut: "⌘C",
      hideForVisitor: true,
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
      permission: "view_orders",
      shortcut: "⌘O",
      hideForVisitor: true,
    },
  ];

  // Admin management items (for Super Admin only)
  const adminItems: SidebarItem[] = [
    {
      title: "User Management",
      href: "/admin/settings/users",
      icon: Users,
      permission: "view_users",
    },
    {
      title: "Activity Logs",
      href: "/admin/activity",
      icon: History,
      permission: "view_activity_logs",
    },
  ];

  // Settings submenu items
  const settingsItems: SidebarItem[] = [
    ...(isSuperAdmin
      ? [
          {
            title: "General Settings",
            href: "/admin/settings",
            icon: Settings,
            permission: "manage_general_settings",
            superAdminOnly: true,
            hideForVisitor: true,
          },
        ]
      : []),
    {
      title: "Profile",
      href: "/admin/profile",
      icon: User,
      permission: "view_profile",
    },
  ];

  // Filter items based on permissions and role
  const filteredNavItems = navItems.filter((item) => {
    console.log(`Filtering nav item "${item.title}" with permission "${item.permission}":`, {
      roleName: role?.name,
      isVisitor: role?.name === "visitor",
      showForVisitor: item.showForVisitor,
      hideForVisitor: item.hideForVisitor,
      hasPermission: hasPermission(item.permission)
    });
    
    if (role?.name === "visitor" && !item.showForVisitor) return false;
    if (item.hideForVisitor && role?.name === "visitor") return false;
    return hasPermission(item.permission);
  });

  const filteredBusinessItems = businessItems.filter((item) => {
    if (role?.name === "visitor") return false;
    return hasPermission(item.permission);
  });

  const filteredAdminItems = adminItems.filter(
    (item) => isSuperAdmin || hasPermission(item.permission)
  );

  const filteredSettingsItems = settingsItems.filter((item) => {
    if (role?.name === "visitor") return false;
    if (item.superAdminOnly && !isSuperAdmin) return false;
    return hasPermission(item.permission);
  });

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
                src="/G Album Logo (RED).png"
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

  // If no role, show minimal sidebar
  if (!role) {
    return (
      <Sidebar className="border-r border-slate-200 w-64">
        <SidebarHeader className="border-b border-slate-200 pb-2">
          <div className="flex items-center px-2 py-3">
            <Link
              href="/admin/login"
              className="flex items-center group w-full"
            >
              <Image
                src="/G Album Logo (RED).png"
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
              src="/G Album Logo (RED).png"
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
        {/* Main Navigation */}
        <div className="px-3 py-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
            Main
          </h4>
          <SidebarMenu>
            {filteredNavItems.map((item) => {
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
                        <Badge className="ml-auto bg-red-100 hover:bg-red-200 text-red-700 text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </Badge>
                      )}
                      {item.shortcut && !item.badge && (
                        <kbd className="hidden xl:inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium opacity-70">
                          {isMac
                            ? item.shortcut
                            : item.shortcut.replace("⌘", "Ctrl+")}
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

        {/* Business Management */}
        {(isSuperAdmin || filteredBusinessItems.length > 0) && (
          <>
            <div className="px-3 py-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
                Business
              </h4>
              <SidebarMenu>
                {filteredBusinessItems.map((item) => {
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
                              {isMac
                                ? item.shortcut
                                : item.shortcut.replace("⌘", "Ctrl+")}
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

        {/* Admin Management */}
        {isSuperAdmin && (
          <>
            <div className="px-3 py-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
                Admin
              </h4>
              <SidebarMenu>
                {filteredAdminItems.map((item) => {
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

            <SidebarSeparator className="my-2" />
          </>
        )}

        {/* Settings Navigation */}
        <div className="px-3 py-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
            Settings
          </h4>
          <SidebarMenu>
            {filteredSettingsItems.map((item) => {
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
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="w-full mb-2 flex items-center gap-2 justify-center"
          >
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Visit Website
            </a>
          </Button>
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
