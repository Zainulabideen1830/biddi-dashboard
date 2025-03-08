'use client'

import { useState, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, RotateCw, Trash2, Check } from 'lucide-react'
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

export function InvitationsTable() {
    const [invitations, setInvitations] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isResending, setIsResending] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)
    const [selectedInvitation, setSelectedInvitation] = useState(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [copiedId, setCopiedId] = useState(null)
    const api = useApi()

    useEffect(() => {
        fetchInvitations()
    }, [])

    const fetchInvitations = async () => {
        try {
            setIsLoading(true)
            const response = await api.get('/api/invitations')

            if (response.success) {
                setInvitations(response.data)
            } else {
                throw new Error(response.message || 'Failed to fetch invitations')
            }
        } catch (error) {
            toast.error('Failed to load invitations. Please try again.')
            console.error('Error fetching invitations:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendInvitation = async (invitationId) => {
        try {
            setIsResending(invitationId)
            const response = await api.post(`/api/invitations/${invitationId}/resend`, {
                
            })

            if (response.success) {
                toast.success('Invitation resent successfully')

                // Update the invitation in the list
                setInvitations(invitations.map(inv =>
                    inv.id === invitationId
                        ? { ...inv, expires_at: response.data.expires_at, status: 'PENDING' }
                        : inv
                ))

                // Copy the invitation URL to clipboard
                if (response.invitationUrl) {
                    await navigator.clipboard.writeText(response.invitationUrl)
                    // display a toast notification after half a second
                    setTimeout(() => {
                        toast.success('Invitation link copied to clipboard')
                    }, 500)
                }
            } else {
                throw new Error(response.message || 'Failed to resend invitation')
            }
        } catch (error) {
            toast.error(error.message || 'Failed to resend invitation. Please try again.')
            console.error('Error resending invitation:', error)
        } finally {
            setIsResending(null)
        }
    }

    const confirmCancelInvitation = (invitation) => {
        setSelectedInvitation(invitation)
        setDeleteDialogOpen(true)
    }

    const handleCancelInvitation = async () => {
        if (!selectedInvitation) return

        try {
            setIsCancelling(true)
            const response = await api.delete(`/api/invitations/${selectedInvitation.id}`)

            if (response.success) {
                toast.success('Invitation cancelled successfully')

                // Remove the invitation from the list
                setInvitations(invitations.filter(inv => inv.id !== selectedInvitation.id))
                setDeleteDialogOpen(false)
            } else {
                throw new Error(response.message || 'Failed to cancel invitation')
            }
        } catch (error) {
            toast.error(error.message || 'Failed to cancel invitation. Please try again.')
            console.error('Error cancelling invitation:', error)
        } finally {
            setIsCancelling(false)
            setSelectedInvitation(null)
        }
    }

    const handleCopyEmail = async (email) => {
        try {
            await navigator.clipboard.writeText(email)
            setCopiedId(email)
            toast.success('Email copied to clipboard')

            // Reset copied state after 2 seconds
            setTimeout(() => {
                setCopiedId(null)
            }, 2000)
        } catch (error) {
            toast.error('Failed to copy email')
        }
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
            case 'ACCEPTED':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>
            case 'EXPIRED':
                return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Expired</Badge>
            case 'CANCELLED':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <RotateCw className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Loading invitations...</span>
            </div>
        )
    }

    if (invitations.length === 0) {
        return (
            <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground">No invitations found</p>
            </div>
        )
    }

    return (
        <>
            <div className="bg-white dark:bg-backgroundSecondary rounded-lg shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='pl-4'>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Invited</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead className="text-right pr-4">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invitations.map((invitation) => (
                            <TableRow key={invitation.id}>
                                <TableCell className='pl-4'>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{invitation.email}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleCopyEmail(invitation.email)}
                                        >
                                            {copiedId === invitation.email ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell>{invitation.role.name}</TableCell>
                                <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                                <TableCell>
                                    {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                                </TableCell>
                                <TableCell>
                                    {invitation.status === 'PENDING' && (
                                        formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })
                                    )}
                                </TableCell>
                                <TableCell className="!text-right pr-4">
                                    <div className="flex justify-end gap-2">
                                        {invitation.status === 'PENDING' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleResendInvitation(invitation.id)}
                                                    disabled={isResending === invitation.id}
                                                >
                                                    {isResending === invitation.id ? (
                                                        <RotateCw className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        'Resend'
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-500 border-red-200 hover:bg-red-50"
                                                    onClick={() => confirmCancelInvitation(invitation)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                        {(invitation.status === 'EXPIRED' || invitation.status === 'CANCELLED') && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleResendInvitation(invitation.id)}
                                                disabled={isResending === invitation.id}
                                            >
                                                {isResending === invitation.id ? (
                                                    <RotateCw className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    'Resend'
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel the invitation for {selectedInvitation?.email}?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isCancelling}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelInvitation}
                            disabled={isCancelling}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isCancelling ? (
                                <>
                                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                                    Cancelling...
                                </>
                            ) : (
                                'Yes, Cancel Invitation'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default InvitationsTable 