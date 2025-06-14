import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "./role-context";
import { useAuth } from "./auth-context";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  User,
  History,
  LayoutDashboard,
  Image as ImageIcon,
  Mail,
  Newspaper,
  BarChart3,
  Users,
  ShoppingCart,
  Home,
  Settings,
  LogOut,
  PlusCircle,
  UserPlus,
  FilePlus,
} from "lucide-react";

const commandMenuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    shortcut: "⌘D",
    permission: "view_dashboard",
    group: "Navigation",
  },
  {
    title: "Albums",
    href: "/admin/albums",
    icon: ImageIcon,
    shortcut: "⌘A",
    permission: "view_albums",
    group: "Navigation",
  },
  {
    title: "Gallery",
    href: "/admin/gallery",
    icon: ImageIcon,
    shortcut: "⌘G",
    permission: "view_gallery",
    group: "Navigation",
  },
  {
    title: "Form Submissions",
    href: "/admin/submissions",
    icon: Mail,
    shortcut: "⌘M",
    permission: "view_submissions",
    group: "Navigation",
  },
  {
    title: "Newsletter",
    href: "/admin/newsletter",
    icon: Newspaper,
    shortcut: "⌘N",
    permission: "view_newsletter",
    group: "Navigation",
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    shortcut: "⌘V",
    permission: "view_analytics",
    group: "Navigation",
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
    shortcut: "⌘C",
    permission: "view_customers",
    group: "Navigation",
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    shortcut: "⌘O",
    permission: "view_orders",
    group: "Navigation",
  },
  {
    title: "User Management",
    href: "/admin/settings/users",
    icon: Users,
    shortcut: "U",
    permission: "manage_users",
    group: "Navigation",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    shortcut: ",",
    permission: "view_dashboard",
    group: "Navigation",
  },
  {
    title: "Back to Website",
    href: "/",
    icon: Home,
    group: "Navigation",
  },
  {
    title: "Add New Album",
    href: "/admin/albums/new",
    icon: PlusCircle,
    shortcut: "A",
    permission: "manage_albums",
    group: "Quick Actions",
  },
  {
    title: "Add New Customer",
    href: "/admin/customers",
    icon: UserPlus,
    shortcut: "C",
    permission: "manage_users",
    group: "Quick Actions",
    action: "add_customer",
  },
  {
    title: "Add New Order",
    href: "/admin/orders",
    icon: FilePlus,
    shortcut: "O",
    permission: "manage_orders",
    group: "Quick Actions",
    action: "add_order",
  },
];

export default function AdminCommandMenu() {
  const router = useRouter();
  const { hasPermission } = useRole();
  const { profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const platform = window.navigator.platform.toLowerCase();
      setIsMac(platform.includes("mac"));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredItems = useMemo(
    () =>
      commandMenuItems.filter((item) => {
        if (!item.permission) return true;
        return hasPermission(item.permission);
      }),
    [hasPermission]
  );

  const handleItemSelect = (item: (typeof commandMenuItems)[0]) => {
    if (item.action === "add_customer") {
      router.push("/admin/customers?action=add");
    } else if (item.action === "add_order") {
      router.push("/admin/orders?action=add");
    } else {
      router.push(item.href);
    }
    setIsOpen(false);
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          {filteredItems
            .filter((i) => i.group === "Quick Actions")
            .map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => handleItemSelect(item)}
                className="group"
              >
                <item.icon className="mr-2 h-4 w-4 text-slate-400 group-data-[selected=true]:text-white transition-colors duration-100" />
                <span className="transition-colors duration-100 group-data-[selected=true]:text-white text-slate-800">
                  {item.title}
                </span>
                {item.shortcut ? (
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium opacity-100 transition-colors duration-100 group-data-[selected=true]:bg-white/20 group-data-[selected=true]:text-white text-slate-500">
                    {isMac
                      ? item.shortcut
                      : item.shortcut.replace("⌘", "Ctrl+")}
                  </kbd>
                ) : null}
              </CommandItem>
            ))}
        </CommandGroup>
        <CommandGroup heading="Navigation">
          {filteredItems
            .filter((i) => i.group === "Navigation")
            .map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => {
                  router.push(item.href);
                  setIsOpen(false);
                }}
                className="group"
              >
                <item.icon className="mr-2 h-4 w-4 text-slate-400 group-data-[selected=true]:text-white transition-colors duration-100" />
                <span className="transition-colors duration-100 group-data-[selected=true]:text-white text-slate-800">
                  {item.title}
                </span>
                {item.shortcut ? (
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium opacity-100 transition-colors duration-100 group-data-[selected=true]:bg-white/20 group-data-[selected=true]:text-white text-slate-500">
                    {isMac
                      ? item.shortcut
                      : item.shortcut.replace("⌘", "Ctrl+")}
                  </kbd>
                ) : null}
              </CommandItem>
            ))}
        </CommandGroup>
        {profile && (
          <CommandGroup heading="Account">
            <CommandItem
              onSelect={() => {
                router.push("/admin/settings/profile");
                setIsOpen(false);
              }}
              className="group"
            >
              <User className="mr-2 h-4 w-4 text-slate-400 group-data-[selected=true]:text-white transition-colors duration-100" />
              <span className="transition-colors duration-100 group-data-[selected=true]:text-white text-slate-800">
                Profile
              </span>
              <span className="ml-auto text-xs text-slate-500 transition-colors duration-100 group-data-[selected=true]:text-white">
                {profile.full_name}
              </span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push("/admin/settings/activity");
                setIsOpen(false);
              }}
              className="group"
            >
              <History className="mr-2 h-4 w-4 text-slate-400 group-data-[selected=true]:text-white transition-colors duration-100" />
              <span className="transition-colors duration-100 group-data-[selected=true]:text-white text-slate-800">
                Activity Log
              </span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                if (typeof window !== "undefined") {
                  window.localStorage.clear();
                  window.sessionStorage.clear();
                }
                signOut();
                router.push("/admin/login");
                setIsOpen(false);
              }}
              className="group"
            >
              <LogOut className="mr-2 h-4 w-4 text-red-500 group-data-[selected=true]:text-white transition-colors duration-100" />
              <span className="transition-colors duration-100 group-data-[selected=true]:text-white text-red-500">
                Log Out
              </span>
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
