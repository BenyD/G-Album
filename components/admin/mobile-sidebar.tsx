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
    showForVisitor: true,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart,
    permission: "view_analytics",
    showForVisitor: true,
  },
  {
    title: "Albums",
    href: "/admin/albums",
    icon: ImageIcon,
    permission: "manage_albums",
    hideForVisitor: true,
  },
  {
    title: "Gallery",
    href: "/admin/gallery",
    icon: ImageIcon,
    permission: "manage_gallery",
    hideForVisitor: true,
  },
  {
    title: "Newsletter",
    href: "/admin/newsletter",
    icon: Mail,
    permission: "manage_newsletter",
    hideForVisitor: true,
  },
  {
    title: "Submissions",
    href: "/admin/submissions",
    icon: MessageSquare,
    permission: "manage_submissions",
    hideForVisitor: true,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: UserCheck,
    permission: "view_customers",
    hideForVisitor: true,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    permission: "view_orders",
    hideForVisitor: true,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    permission: "manage_general_settings",
    superAdminOnly: true,
    hideForVisitor: true,
  },
  {
    title: "Profile",
    href: "/admin/profile",
    icon: User,
    permission: "view_profile",
  },
];

export default function MobileSidebar() {
  const pathname = usePathname();
  const { hasPermission, role } = useRole();

  // Filter items based on permissions and role
  const filteredItems = sidebarItems.filter((item) => {
    if (item.superAdminOnly && role?.name !== "super_admin") return false;
    if (role?.name === "visitor" && !item.showForVisitor) return false;
    if (item.hideForVisitor && role?.name === "visitor") return false;
    return hasPermission(item.permission);
  });

  return (
    <div className="flex flex-col gap-2">
      {filteredItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              pathname === item.href
                ? "bg-red-100 text-red-900 hover:bg-red-200"
                : ""
            }`}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Button>
        </Link>
      ))}
    </div>
  );
}
