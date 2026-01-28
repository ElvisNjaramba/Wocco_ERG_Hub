import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/animate-ui/components/radix/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/animate-ui/primitives/radix/collapsible";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";

import {
  Bot,
  BookOpen,
  ChevronRight,
  ChevronsUpDown,
  GalleryVerticalEnd,
  LogOut,
  Settings2,
  LayoutDashboardIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function RadixSidebarLayout({ children }) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const isAuthenticated = !!localStorage.getItem("access");

  const [user, setUser] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    avatar: "",
  });

  // 🔥 Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/me/");
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const dashboardUrl =
    role === "superuser" ? "/superuser/dashboard" : "/user/dashboard";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const DATA = {
    teams: [{ name: "Wocco Company", logo: GalleryVerticalEnd, plan: "ERG Platform" }],
    navMain: [
      {
        title: "Dashboard",
        icon: LayoutDashboardIcon,
        items: [{ title: "Dashboard", url: dashboardUrl }],
      },
      ...(role === "superuser"
        ? [
            {
              title: "User Management",
              icon: Settings2,
              items: [
                { title: "Create User", url: "/superuser/users/create" },
                { title: "Upload Users", url: "/superuser/users/upload" },
              ],
            },
          ]
        : []),
{
  title: "Wocco Hubs",
  icon: Bot,
  items: [
    { title: "All Hubs", url: "/hubs/list" },
    ...(role === "superuser" ? [{ title: "Create Hub", url: "/hubs/create" }] : []),
  ],
},
      {
        title: "Wocco Events",
        icon: BookOpen,
        items: [
          { title: "All Events", url: "/events/list" },
          ...(role === "superuser" ? [{ title: "Create Event", url: "/events/create" }] : []),
        ],
      },
      {
        title: "User Profile",
        icon: Settings2,
        items: [{ title: "Profile", url: "/profile" }],
      },
    ],
  };

  const [activeTeam, setActiveTeam] = React.useState(DATA.teams[0]);
  if (!activeTeam) return null;

  const PRIMARY_COLOR = "#432dd7";

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="bg-white dark:bg-[#0b0b1c]">
        {/* ---------- HEADER ---------- */}
        <SidebarHeader className="px-2 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="gap-3 px-3 py-3">
                    <div
                      className="flex size-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
                    >
                      <activeTeam.logo className="size-4" />
                    </div>
                    <div className="flex-1 text-left text-sm">
                      <div className="font-semibold">{activeTeam.name}</div>
                      <div className="text-xs opacity-80">{activeTeam.plan}</div>
                    </div>
                    <ChevronsUpDown className="size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* ---------- CONTENT ---------- */}
        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[#432dd7] px-3 mb-2">
              Platform
            </SidebarGroupLabel>

            <SidebarMenu className="space-y-1">
              {DATA.navMain.map((item) => (
                <Collapsible key={item.title} asChild>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="gap-3 px-3 py-2.5">
                        <item.icon className="size-4" />
                        <span className="flex-1">{item.title}</span>
                        <ChevronRight className="size-4" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-3 mt-1">
                        {item.items.map((sub) => (
                          <SidebarMenuSubItem key={sub.title}>
                            <SidebarMenuSubButton asChild>
                              <a href={sub.url} className="block px-3 py-2">
                                {sub.title}
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* ---------- FOOTER ---------- */}
        <SidebarFooter className="px-2 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="gap-3 px-3 py-3">
                    <Avatar className="h-8 w-8">
                      {user.avatar ? (
                        <AvatarImage src={`http://127.0.0.1:8000${user.avatar}`} />
                      ) : (
                        <AvatarFallback>
                          {user.first_name?.[0]}
                          {user.last_name?.[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{user.username || "User"}</div>
                      <div className="text-xs opacity-80">{user.email}</div>
                    </div>
                    <ChevronsUpDown className="size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="p-2">
                  {isAuthenticated ? (
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 size-4" /> Logout
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* ---------- MAIN ---------- */}
      <SidebarInset className="min-w-0 overflow-x-hidden">
        <header className="flex h-16 items-center gap-3 px-4 border-b">
          <SidebarTrigger className="text-[#432dd7]" />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#432dd7] font-semibold">
                  Wocco Company
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
<main className="p-6 bg-gray-50 dark:bg-[#080818] min-h-[calc(100vh-64px)] min-w-0 overflow-x-hidden">
  {children}
</main>

      </SidebarInset>
    </SidebarProvider>
  );
}
