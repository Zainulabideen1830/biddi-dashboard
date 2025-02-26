// frontend/app/auth/(sign-in)/sign-in/page.jsx
import AuthTitle from '@/components/auth/auth-title'
import SignInForm from '@/components/auth/sign-in-form'
import React from 'react'

const SignInPage = () => {
    return (
        <div className=''>
            <AuthTitle title='Sign In' />
            <SignInForm />
        </div>
    )
}

export default SignInPage