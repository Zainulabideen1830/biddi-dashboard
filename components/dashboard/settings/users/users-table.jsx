'use client'

import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { ChevronDown, Edit, Trash2, RotateCw, AlertCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { toast } from 'react-toastify'
import { useApi } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

export function UsersTable() {
    const [users, setUsers] = useState([])
    const [roles, setRoles] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)
    const [actionUserId, setActionUserId] = useState(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [serverError, setServerError] = useState(null)
    const api = useApi()

    useEffect(() => {
        fetchUsers()
        fetchRoles()
    }, [])

    const fetchUsers = async () => {
        try {
            setIsLoading(true)
            setServerError(null)
            
            const response = await api.get('/api/users')
            
            if (response.success) {
                setUsers(response.data)
            } else {
                throw new Error(response.message || 'Failed to fetch users')
            }
        } catch (error) {
            console.error('Error fetching users:', error)
            setServerError('Failed to load users. Please try again.')
            toast.error('Failed to load users. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchRoles = async () => {
        try {
            const response = await api.get('/api/rbac/roles')
            
            if (response.success) {
                setRoles(response.data)
            } else {
                throw new Error(response.message || 'Failed to fetch roles')
            }
        } catch (error) {
            console.error('Error fetching roles:', error)
            toast.error('Failed to load roles. Please try again.')
        }
    }

    const handleRoleChange = async (userId, roleId) => {
        setIsUpdating(true)
        setActionUserId(userId)

        try {
            // first check if the user is the only admin and try to change the role to a non-admin role
            if (users.length === 1 && users.find(user => user.role.name === 'admin').id === userId) {
                toast.error('You cannot change the role of the only admin user')
                setIsUpdating(false)
                setActionUserId(null)
                return
            }
            const response = await api.put(`/api/rbac/users/${userId}/role`, {
                roleId
            })

            if (response.success) {
                // Update local state
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, role: response.data.role } : user
                ))

                const roleName = roles.find(r => r.id === roleId)?.name || 'new role'
                toast.success(`Role updated to ${roleName}`)
            } else {
                throw new Error(response.message || 'Failed to update user role')
            }
        } catch (error) {
            toast.error('Failed to update user role')
            console.error('Error updating role:', error)
        } finally {
            setIsUpdating(false)
            setActionUserId(null)
        }
    }

    const handleDeactivateToggle = async (userId, currentStatus) => {
        setIsUpdating(true)
        setActionUserId(userId)

        try {
            const response = await api.put(`/api/users/${userId}/status`, {
                active: !currentStatus
            })

            if (response.success) {
                // Update local state
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, is_active: !currentStatus } : user
                ))

                toast.success(`User ${currentStatus ? 'activated' : 'deactivated'} successfully`)
            } else {
                throw new Error(response.message || `Failed to ${currentStatus ? 'activate' : 'deactivate'} user`)
            }
        } catch (error) {
            toast.error(`Failed to ${currentStatus ? 'activate' : 'deactivate'} user`)
            console.error('Error updating status:', error)
        } finally {
            setIsUpdating(false)
            setActionUserId(null)
        }
    }

    const confirmDeleteUser = (user) => {
        setSelectedUser(user)
        setDeleteDialogOpen(true)
    }

    const handleDeleteUser = async () => {
        if (!selectedUser) return
        
        setIsUpdating(true)
        
        try {
            // first check if there is only one user and the user is admin
            if (users.length === 1 && selectedUser.role.name === 'admin') {
                toast.error('You cannot delete the only admin user')
                setIsUpdating(false)
                setDeleteDialogOpen(false)
                setSelectedUser(null)
                return
            }

            const response = await api.delete(`/api/users/${selectedUser.id}`)
            
            if (response.success) {
                // Remove user from local state
                setUsers(users.filter(user => user.id !== selectedUser.id))
                toast.success('User deleted successfully')
            } else {
                throw new Error(response.message || 'Failed to delete user')
            }
        } catch (error) {
            toast.error('Failed to delete user')
            console.error('Error deleting user:', error)
        } finally {
            setIsUpdating(false)
            setDeleteDialogOpen(false)
            setSelectedUser(null)
        }
    }
    
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-backgroundSecondary rounded-lg shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='pl-4'>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right pr-4">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array(3).fill(0).map((_, index) => (
                            <TableRow key={index}>
                                <TableCell className='pl-4'>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </TableCell>
                                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell className="text-right pr-4">
                                    <div className="flex justify-end">
                                        <Skeleton className="h-8 w-28" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    if (serverError) {
        return (
            <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{serverError}</AlertDescription>
            </Alert>
        )
    }

    if (users.length === 0) {
        return (
            <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground">No users found</p>
            </div>
        )
    }

    return (
        <>
            <div className="bg-white dark:bg-backgroundSecondary rounded-lg shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='pl-4'>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right pr-4">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className='pl-4'>
                                    <div className="flex items-center gap-3">
                                        <Avatar className='w-8 h-8'>
                                            <AvatarImage src={user?.image} />
                                            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{user.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Select
                                        defaultValue={user.role?.id}
                                        onValueChange={(value) => handleRoleChange(user.id, value)}
                                        disabled={isUpdating && actionUserId === user.id}
                                    >
                                        <SelectTrigger className="w-[130px]">
                                            {isUpdating && actionUserId === user.id ? (
                                                <div className="flex items-center justify-center w-full">
                                                    <RotateCw className="h-4 w-4 animate-spin" />
                                                </div>
                                            ) : (
                                                <SelectValue placeholder="Select role" />
                                            )}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map(role => (
                                                <SelectItem key={role.id} value={role.id}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    {user.last_login_at ? (
                                        formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true })
                                    ) : (
                                        'Never'
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`deactivate-${user.id}`}
                                            checked={!user.is_active}
                                            onCheckedChange={() => handleDeactivateToggle(user.id, !user.is_active)}
                                            disabled={isUpdating && actionUserId === user.id}
                                        />
                                        <label htmlFor={`deactivate-${user.id}`} className="text-sm">
                                            {!user.is_active ? 'Deactivated' : 'Active'}
                                        </label>
                                        {isUpdating && actionUserId === user.id && (
                                            <RotateCw className="h-3 w-3 animate-spin ml-1" />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="!text-right pr-4 flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center gap-1 text-red-500 cursor-pointer"
                                        onClick={() => confirmDeleteUser(user)}
                                        disabled={isUpdating}
                                    >
                                        <span className="text-xs font-medium whitespace-nowrap">DELETE USER</span>
                                        <Trash2 className="size-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            <strong> {selectedUser?.name}</strong> and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            disabled={isUpdating}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            {isUpdating ? (
                                <RotateCw className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default UsersTable