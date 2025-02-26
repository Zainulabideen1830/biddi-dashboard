import RequireAuth from '@/components/auth/require-auth'
import React from 'react'

const PrivatePage = async () => {
    return (
        <RequireAuth>
            <p>PrivatePage</p>
        </RequireAuth>
    )
}

export default PrivatePage