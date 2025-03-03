import AuthTitle from '@/components/auth/auth-title'
import ResetPasswordForm from '@/components/auth/reset-password-form'
import React from 'react'

const ResetPasswordPage = async ({ searchParams }) => {
    const params = await searchParams;
    return (
        <div>
            <AuthTitle title='Reset Password' />
            <ResetPasswordForm token={params.token} />
        </div>
    )
}

export default ResetPasswordPage