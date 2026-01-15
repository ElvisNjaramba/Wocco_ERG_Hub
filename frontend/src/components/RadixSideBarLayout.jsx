import * as React from "react";
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
  SidebarRail,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";

import {
  AudioWaveform,
  Bot,
  BookOpen,
  ChevronRight,
  ChevronsUpDown,
  Command,
  Frame,
  GalleryVerticalEnd,
  LogOut,
  Map,
  PieChart,
  Plus,
  Settings2,
  Sparkles,
  SquareTerminal,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

/* ---------------- DATA ---------------- */
const DATA = {
  user: {
    name: "Wocco Company",
    email: "wocco@gowocco.com",
    avatar:
      "https://pbs.twimg.com/profile_images/1909615404789506048/MTqvRsjo_400x400.jpg",
  },
  teams: [
    { name: "Wocco Company", logo: GalleryVerticalEnd, plan: "ERG Platform" },

  ],
  navMain: [
    {
      title: "Wocco User Management",
      icon: Settings2,
      items: [
        { title: "Create User", url: "/superuser/users/create" },
        { title: "Upload Users", url: "/superuser/users/upload" },
      ],
    },
    {
      title: "Wocco Hubs",
      icon: Bot,
      items: [
        { title: "All Hubs", url: "#" },
        { title: "Create Hub", url: "#" },
        { title: "Edit Hub", url: "#" },
      ],
    },
    {
      title: "Wocco Events",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "All Events", url: "#" },
        { title: "Create Events", url: "#" },
        { title: "Edit Event", url: "#" },
      ],
    },
    {
      title: "User Profile",
      icon: Settings2,
      items: [
        { title: "Profile", url: "#" },
        { title: "Edit Profile", url: "#" },
        { title: "Hubs & Events", url: "#" },
      ],
    },
  ],
  projects: [
    { name: "Design Engineering", url: "#", icon: Frame },
    { name: "Sales & Marketing", url: "#", icon: PieChart },
    { name: "Travel", url: "#", icon: Map },
  ],
};

/* ---------------- COMPONENT ---------------- */
export default function RadixSidebarLayout({ children }) {
  const isMobile = useIsMobile();
  const [activeTeam, setActiveTeam] = React.useState(DATA.teams[0]);

  if (!activeTeam) return null;

  const PRIMARY_COLOR = "#432dd7";

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="bg-white dark:bg-[#0b0b1c]">
        {/* ---------- HEADER ---------- */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="hover:bg-[#432dd7] hover:text-white transition-colors duration-200">
                    <div
                      className="flex size-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
                    >
                      <activeTeam.logo className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm ml-2">
                      <span className="truncate font-semibold">{activeTeam.name}</span>
                      <span className="truncate text-xs">{activeTeam.plan}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  side={isMobile ? "bottom" : "right"}
                  sideOffset={4}
                  className="bg-white dark:bg-[#0b0b1c] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
                >
                  <DropdownMenuLabel>Teams</DropdownMenuLabel>
                  {DATA.teams.map((team, i) => (
                    <DropdownMenuItem
                      key={team.name}
                      onClick={() => setActiveTeam(team)}
                      className="hover:bg-[#432dd7] hover:text-white transition-colors duration-150 rounded-md"
                    >
                      <team.logo className="mr-2 size-4" />
                      {team.name}
                      <DropdownMenuShortcut>⌘{i + 1}</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="hover:bg-[#432dd7] hover:text-white transition-colors duration-150 rounded-md">
                    <Plus className="mr-2 size-4" /> Add team
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* ---------- CONTENT ---------- */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[#432dd7]">Platform</SidebarGroupLabel>
            <SidebarMenu>
              {DATA.navMain.map((item) => (
                <Collapsible key={item.title} defaultOpen={item.isActive} asChild>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="hover:bg-[#432dd7] hover:text-white transition-colors duration-150">
                        <item.icon />
                        <span className="ml-2">{item.title}</span>
                        <ChevronRight className="ml-auto" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((sub) => (
                          <SidebarMenuSubItem key={sub.title}>
                            <SidebarMenuSubButton asChild>
                              <a
                                href={sub.url}
                                className="block px-2 py-1 hover:bg-[#432dd7] hover:text-white rounded-md transition-colors duration-150"
                              >
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
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="hover:bg-[#432dd7] hover:text-white transition-colors duration-150">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={DATA.user.avatar} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="ml-2 text-left">
                      <div className="font-semibold">{DATA.user.name}</div>
                      <div className="text-xs">{DATA.user.email}</div>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="bg-white dark:bg-[#0b0b1c] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                  <DropdownMenuItem className="hover:bg-[#432dd7] hover:text-white transition-colors duration-150">
                    <Sparkles /> Upgrade
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="hover:bg-[#432dd7] hover:text-white transition-colors duration-150">
                    <LogOut /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* ---------- MAIN ---------- */}
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4 border-b border-gray-200 dark:border-gray-700">
          <SidebarTrigger className="text-[#432dd7]" />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#432dd7] font-semibold">Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="p-6 bg-gray-50 dark:bg-[#080818] min-h-[calc(100vh-64px)] rounded-md shadow-inner">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
