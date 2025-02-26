import AuthTitle from '@/components/auth/auth-title'
import SignUpForm from '@/components/auth/sign-up-form'
import React from 'react'

const SignUpPage = () => {
    return (
        <div className='w-full h-full flex flex-col justify-center'>
            <div className='w-[90%] max-w-xl mx-auto'>
                <AuthTitle title='Sign Up' />
                <SignUpForm />
            </div>
        </div>
    )
}

export default SignUpPage