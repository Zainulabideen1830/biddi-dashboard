import { Checkbox } from '@/components/ui/checkbox'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { ChevronDown } from 'lucide-react'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const users = [
    {
        id: 1,
        name: 'Jonathan Doe',
        email: 'jonathan.doe@gmail.com',
        role: 'Admin',
        lastLogin: '1/12/2025',
        deactivated: false,
        image: '/users/user1.png',
    },
    {
        id: 2,
        name: 'Nilson Homes',
        email: 'nilson.home@gmail.com',
        role: 'Admin',
        lastLogin: '1/12/2025',
        deactivated: false,
        image: '/users/user2.png',
    },
    {
        id: 3,
        name: 'Brighton Homes',
        email: 'brighton.homes@gmail.com',
        role: 'Limited',
        lastLogin: '1/12/2025',
        deactivated: true,
        image: '/users/user3.png',
    },
]

export function UsersTable() {
    return (
        <div className="bg-white dark:bg-backgroundSecondary rounded-lg shadow-sm">
            <div className="p-5 border-b border-border">
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold">Users</h3>
                    <span className="bg-muted text-muted-foreground text-xs rounded-full px-2 py-0.5">
                        {users.length}
                    </span>
                </div>
            </div>

            {/* The horizontal scrollable should only come on to the table, not on the complete page */}
            <div
                className="!flex !overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            >
                <figure className="!shrink-0 grow">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border hover:bg-transparent">
                                <TableHead className="w-[200px] pl-5">NAME</TableHead>
                                <TableHead className="w-[250px]">EMAIL</TableHead>
                                <TableHead className="w-[150px]">ROLE</TableHead>
                                <TableHead className="w-[150px]">LAST LOGIN</TableHead>
                                <TableHead className="w-[150px]">DEACTIVATED</TableHead>
                                <TableHead className="w-[200px] text-right pr-5">ACTION</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} className="border-b border-border">
                                    <TableCell className="py-4 pl-5">
                                        <div className="flex items-center gap-3">
                                            <Avatar className='w-8 h-8'>
                                                <AvatarImage src={user?.image} />
                                                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium text-secondary-base">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{user.role}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={user.deactivated}
                                            className={user.deactivated ? "data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" : ""}
                                        />
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        <div className="flex items-center justify-end gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs rounded-[10px] border-gray-200 dark:border-gray-700 bg-transparent"
                                            >
                                                {user.role === 'Admin' ? 'ADMIN PERMISSIONS' : 'MANAGE PERMISSIONS'}
                                            </Button>
                                            <div className="flex items-center gap-1 text-red-500 cursor-pointer">
                                                <span className="text-xs font-medium whitespace-nowrap">DELETE USER</span>
                                                <ChevronDown className="size-4" />
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </figure>
            </div>
        </div>
    )
}

export default UsersTable