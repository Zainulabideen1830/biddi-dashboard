import AuthTitle from '@/components/auth/auth-title'
import SignUpForm from '@/components/auth/sign-up-form'
import React from 'react'

const SignUpPage = async ({ searchParams }) => {
    const params = await searchParams;
    return (
        <div className='w-[90%] max-w-xl mx-auto'>
            <AuthTitle title='Sign Up' />
            <SignUpForm token={params.token} />
        </div>
    )
}

export default SignUpPage