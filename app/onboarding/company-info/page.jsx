import AuthTitle from '@/components/auth/auth-title'
import CompanyInfoForm from '@/components/onboarding/company-info-form'
import React from 'react'

const CompanyInfo = () => {
    return (
        <div className='w-full h-full flex flex-col justify-center'>
            <div className='w-[90%] max-w-xl mx-auto'>
                <AuthTitle title='Company Information' />
                <CompanyInfoForm />
            </div>
        </div>
    )
}

export default CompanyInfo