import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/auth-store'
import { ChevronDown, User } from 'lucide-react'

const UserProfile = () => {
    const { user } = useAuthStore()
    console.log('[UserProfile] user: ', user)
    return (
        <DropdownMenu className='text-sm'>
            <DropdownMenuTrigger asChild className=''>
                <Button variant="ghost" className="bg-white dark:bg-backgroundSecondary !outline-none focus:!outline-none px-1">
                    {/* for small screens only show the avatar and for above the sm screen show the avatar and the name */}
                    <Avatar className='w-8 h-8'>
                        <AvatarImage src={user?.image} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className='hidden sm:flex items-center gap-2'>
                        <span className='text-muted-foreground'>{user?.name}</span>
                        <ChevronDown className="size-4 text-muted-foreground" />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <User className="size-5" />
                    <span>Profile</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserProfile