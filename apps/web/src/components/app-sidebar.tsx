import { createSignal, For } from "solid-js"
import { Link, useNavigate } from "@tanstack/solid-router"
import { Home, Mail, Calendar, Search, Settings, Users, FolderTree, User, ChevronUp, ChevronDown, LogOut } from "lucide-solid"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"
 
const mainMenuItems = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home
  },
  {
    title: "Category Management",
    url: "/dashboard/categories",
    icon: FolderTree
  },
  {
    title: "User Management",
    url: "/dashboard/users",
    icon: Users
  },
]
 
export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <For each={mainMenuItems}>
                {(item) => (
                  <SidebarMenuItem>
                    <SidebarMenuButton as={Link} href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </For>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <FooterSidebar />
    </Sidebar>
  )
}

function FooterSidebar(){
  const [open, setOpen] = createSignal(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      navigate({ to: "/auth/login" })
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={open()} onOpenChange={setOpen}>
            <DropdownMenuTrigger class="w-full flex items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0">  
                <User /> Username
                {open() ? <ChevronUp class="ml-auto" /> : <ChevronDown class="ml-auto" />}
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56">
              <DropdownMenuItem>
                <User class="mr-2 h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut class="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  )
}