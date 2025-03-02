"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { navLinks } from "@/constants"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import SidebarLogout from "./sidebar-logout"

const DashboardSidebar = ({ session, ...props }) => {
  const pathname = usePathname()
  
  // Check if a link is active (exact match)
  const isExactMatch = (url) => {
    return pathname === url
  }
  
  // Check if a link is active (starts with) but not the dashboard root
  const isPartialMatch = (url) => {
    // Skip the check for "#" placeholder URLs
    if (url === "#") return false
    
    // Special case for dashboard root to prevent it from matching all dashboard routes
    if (url === "/dashboard" && pathname !== "/dashboard") {
      return false
    }
    
    return pathname.startsWith(url)
  }
  
  // Check if any subitem is active
  const hasActiveSubItem = (items) => {
    if (!items) return false
    return items.some(subItem => {
      if (subItem.url === "#") return false
      return isExactMatch(subItem.url) || isPartialMatch(subItem.url)
    })
  }
  
  // Determine if an item is active
  const isItemActive = (item) => {
    // For items with subitems, they're active if any subitem is active
    if (item.items) {
      return hasActiveSubItem(item.items)
    }
    
    // For regular items, they're active if they match the current path
    if (item.url === "#") return false
    
    // Special case for dashboard root
    if (item.url === "/dashboard") {
      return pathname === "/dashboard"
    }
    
    return isExactMatch(item.url) || isPartialMatch(item.url)
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="py-5">
              <Link href="/dashboard">
                <Image
                  src="/logo-blue.svg"
                  alt="logo"
                  className="w-[103px] h-auto"
                  width={103}
                  height={46}
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.map((item) => {
                if (item.type === "separator") {
                  return <SidebarSeparator key={item.type} className="my-4" />
                }
                
                // Determine if this item is active
                const isActive = isItemActive(item)
                
                return item.items ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem className="px-4 relative">
                      {isActive && <div className="absolute left-0 h-[50px] w-[5px] bg-blue-500 rounded-tr-[5px] rounded-br-[5px]" />}
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton 
                          tooltip={item.title} 
                          className={cn("h-[50px] pl-3 rounded-[10px] transition-all duration-200",
                            isActive && "active-gradient-primary"
                          )}
                          isActive={isActive}
                        >
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => {
                            const isSubItemActive = subItem.url !== "#" && 
                              (isExactMatch(subItem.url) || isPartialMatch(subItem.url))
                            
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton 
                                  asChild 
                                  className={cn("py-5", isSubItemActive && "!text-secondary-base")}
                                  isActive={isSubItemActive}
                                >
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title} className="px-4 relative">
                    {/* a vertical line on the left side if the item is active */}
                    {isActive && <div className="absolute left-0 h-[50px] w-[5px] bg-blue-500 rounded-tr-[5px] rounded-br-[5px]" />}
                    <SidebarMenuButton 
                      asChild 
                      className={cn("h-[50px] pl-3 rounded-[10px] transition-all duration-200",
                        isActive && "active-gradient-primary"
                      )}
                      isActive={isActive}
                    >
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
      </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* Logout button */}
        <SidebarLogout />
      </SidebarFooter>
      <SidebarRail className="!hidden" />
    </Sidebar>
  )
}

export default DashboardSidebar