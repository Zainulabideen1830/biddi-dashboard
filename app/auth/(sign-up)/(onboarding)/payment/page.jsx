//app/auth/(sign-up)/(onboarding)/payment/page.jsx
import AuthTitle from '@/components/auth/auth-title'
import PaymentForm from '@/components/onboarding/payment-form'
import React from 'react'

const PaymentPage = () => {
    return (
        <div className='w-[90%] max-w-xl mx-auto'>
            <AuthTitle title='Payment' />
            <PaymentForm />
        </div>
    )
}

export default PaymentPage