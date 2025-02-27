import { SidebarTrigger } from '@/components/ui/sidebar'
import { ModeToggle } from './theme-toggle'
import { Bell, Calendar, ChevronDown, HelpCircle, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const DashboardHeader = () => {
  return (
    <header className=" bg-sidebar flex items-center h-[70px] shrink-0 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16">
      <div className='custom_container flex items-center justify-between'>
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
        </div>
        <div className="flex items-center gap-4">
          {/* Search button icon */}
          <Button variant="ghost" size="icon">
            <Search className="size-5 text-muted-foreground" />
          </Button>
          {/* chat notification icon button */}
          <Button variant="ghost" size="icon" className='relative'>
            <Bell className="size-5 text-muted-foreground" />
            {/* notification red dot icon at the top right of the bell icon */}
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          </Button>
          {/* help icon button */}
          <Button variant="ghost" size="icon">
            <HelpCircle className="size-5 text-muted-foreground" />
          </Button>
          {/* dropdown menu for user profile */}
          <DropdownMenu className='text-sm'>
            <DropdownMenuTrigger asChild className=''>
              <Button variant="ghost" className="bg-white dark:bg-backgroundSecondary !outline-none focus:!outline-none px-1">
                <Avatar className='w-8 h-8'>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span className='text-muted-foreground'>John Doe</span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <User className="size-5" />
                <span>Profile</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader 