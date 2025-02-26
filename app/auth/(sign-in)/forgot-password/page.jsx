import AuthTitle from '@/components/auth/auth-title'
import ForgotPasswordForm from '@/components/auth/forgot-password-form'
import React from 'react'

const ForgotPasswordPage = () => {
    return (
        <div>
            <AuthTitle title='Forgot Password' />
            <ForgotPasswordForm />
        </div>
    )
}

export default ForgotPasswordPage