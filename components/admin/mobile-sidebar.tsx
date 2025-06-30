"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  ImageIcon,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Settings,
  User,
  Users,
  UserCheck,
  ShoppingCart,
} from "lucide-react";
import { useRole } from "@/components/admin/role-context";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    permission: "view_dashboard",
  },
  {
    title: "Albums",
    href: "/admin/albums",
    icon: ImageIcon,
    permission: "manage_albums",
  },
  {
    title: "Gallery",
    href: "/admin/gallery",
    icon: ImageIcon,
    permission: "manage_gallery",
  },
  {
    title: "Newsletter",
    href: "/admin/newsletter",
    icon: Mail,
    permission: "manage_newsletter",
  },
  {
    title: "Form Submissions",
    href: "/admin/submissions",
    icon: MessageSquare,
    permission: "manage_submissions",
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: UserCheck,
    permission: "view_customers",
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    permission: "view_orders",
  },
  {
    title: "User Management",
    href: "/admin/settings/users",
    icon: Users,
    permission: "view_users",
    superAdminOnly: true,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart,
    permission: "view_analytics",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    permission: "manage_general_settings",
    superAdminOnly: true,
  },
  {
    title: "Profile",
    href: "/admin/profile",
    icon: User,
    permission: "view_dashboard",
  },
];

export default function AdminMobileSidebar() {
  const pathname = usePathname();
  const { hasPermission, role } = useRole();
  const isSuperAdmin = role === "super_admin";

  // Filter items based on permissions and super admin status
  const filteredItems = sidebarItems.filter(
    (item) =>
      hasPermission(item.permission) && (!item.superAdminOnly || isSuperAdmin)
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-4 border-b border-slate-800">
        <Link href="/admin/dashboard" className="flex items-center">
          <span className="text-xl font-bold">G Album Admin</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start ${isActive ? "bg-slate-800" : "hover:bg-slate-800"}`}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
