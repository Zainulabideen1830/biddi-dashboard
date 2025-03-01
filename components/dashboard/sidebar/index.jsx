"use client"

import * as React from "react"

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
                return item.items ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={item.isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem className="px-4 relative">
                      {item.isActive && <div className="absolute left-0 h-full w-[5px] bg-blue-500 rounded-tr-[5px] rounded-br-[5px]" />}
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title} className="py-6 pl-3 rounded-[10px]">
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild className="py-5">
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title} className="px-4 relative">
                    {/* a vertical line on the left side if the item is active */}
                    {item.isActive && <div className="absolute left-0 h-full w-[5px] bg-blue-500 rounded-tr-[5px] rounded-br-[5px]" />}
                    <SidebarMenuButton asChild className={cn("py-6 pl-3 rounded-[10px]",
                      item.isActive && "active-gradient-primary"
                    )}>
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