import AuthTitle from '@/components/auth/auth-title'
import ResetPasswordForm from '@/components/auth/reset-password-form'
import React from 'react'

const ResetPasswordPage = () => {
    return (
        <div>
            <AuthTitle title='Reset Password' />
            <ResetPasswordForm />
        </div>
    )
}

export default ResetPasswordPage