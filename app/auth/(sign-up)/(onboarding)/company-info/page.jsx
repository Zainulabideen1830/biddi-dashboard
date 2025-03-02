//app/auth/(sign-up)/(onboarding)/company-info/page.jsx
import AuthTitle from '@/components/auth/auth-title'
import CompanyInfoForm from '@/components/onboarding/company-info-form'
import React from 'react'

const CompanyInfo = () => {
    return (
        <div className='w-[90%] max-w-xl mx-auto'>
            <AuthTitle title='Company Information' />
            <CompanyInfoForm />
        </div>
    )
}

export default CompanyInfo