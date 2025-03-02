import { SidebarTrigger } from '@/components/ui/sidebar'
import { ModeToggle } from './theme-toggle'
import { Bell, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SearchInput from './search-input'
import UserProfile from './user-profiel'

const DashboardHeader = () => {
  return (
    <header className={`bg-sidebar flex items-center h-[70px] shrink-0 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16 sticky top-0 z-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]`}>
      <div className='custom_container flex items-center justify-between w-full'>
        <div className="flex items-center gap-2 flex-1">
          <SidebarTrigger className="-ml-1" />
          <SearchInput />
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
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
          <UserProfile />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader 
// import { SidebarTrigger } from '@/components/ui/sidebar'
// import { ModeToggle } from './theme-toggle'
// import { Bell, Calendar, ChevronDown, HelpCircle, Search, User } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import SearchInput from './search-input'
// import UserProfile from './user-profiel'

// const DashboardHeader = () => {
//   return (
//     <header className={`bg-sidebar flex items-center h-[70px] shrink-0 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16 sticky top-0 z-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]`}>
//       <div className='custom_container flex items-center justify-between w-full'>
//         <div className="flex items-center gap-2 flex-1">
//           <SidebarTrigger className="-ml-1" />
//           <SearchInput />
//         </div>
//         <div className="flex items-center gap-2 sm:gap-4">
//           {/* chat notification icon button */}
//           <Button variant="ghost" size="icon" className='relative'>
//             <Bell className="size-5 text-muted-foreground" />
//             {/* notification red dot icon at the top right of the bell icon */}
//             <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
//           </Button>
//           {/* help icon button */}
//           <Button variant="ghost" size="icon">
//             <HelpCircle className="size-5 text-muted-foreground" />
//           </Button>
//           {/* dropdown menu for user profile */}
//           <UserProfile />
//           <ModeToggle />
//         </div>
//       </div>
//     </header>
//   )
// }

// export default DashboardHeader 