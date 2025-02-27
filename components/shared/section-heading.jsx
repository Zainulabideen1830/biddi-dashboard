import { cn } from '@/lib/utils'
import React from 'react'

const SectionHeading = ({ title, className }) => {
  return (
    <h2 className={cn('text-3xl font-bold', className)}>{title}</h2>
  )
}

export default SectionHeading