import React from 'react'
import SectionHeading from '@/components/shared/section-heading'
import Image from 'next/image'
import { TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'

const metrics = [
    {
        title: 'Estimates Sent Out',
        value: '1,024',
        image: '/metric1.svg',
        changePercentage: 8.5,
        changeText: 'Up from yesterday',
    },
    {
        title: 'Estimates Accepted',
        value: '1,023',
        image: '/metric2.svg',
        changePercentage: 8.5,
        changeText: 'Up from yesterday',
    },
    {
        title: 'Win Rate',
        value: '87%',
        image: '/metric1.svg',
        changePercentage: 4.3,
        changeText: 'Down from yesterday',
    },
    {
        title: 'Avg. Est Amt ($)',
        value: '$ 19,160.00',
        image: '/metric1.svg',
        changePercentage: 8.5,
        changeText: 'Up from yesterday',
    },
    {
        title: 'Avg. Profit on Jobs',
        value: '75.3%',
        image: '/metric1.svg',
        changePercentage: 8.5,
        changeText: 'Up from yesterday',
    },
    {
        title: 'Avg. Profit on Estimate',
        value: '$ 19,160.00',
        image: '/metric1.svg',
        changePercentage: 8.5,
        changeText: 'Up from yesterday',
    },
    {
        title: 'Inc or Dec from prior',
        value: '$ 19,160.00',
        image: '/metric1.svg',
        changePercentage: '+/-',
        changeText: 'from Prior 30 Days',
    },
]

const MetricsCards = () => {
    return (
        <section className='mt-10'>
            <SectionHeading title="Company Metrics" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-7">
                {metrics.map((metric, index) => (
                    <Card key={index} className='bg-white dark:bg-backgroundSecondary rounded-[20px] p-5 flex flex-col gap-7'>
                        <div className='flex items-center justify-between'>
                            <div className='flex flex-col gap-2'>
                                <p className='text-sm text-muted-foreground dark:text-white/90'>{metric.title}</p>
                                <h3 className='text-2xl font-bold'>{metric.value}</h3>
                            </div>
                            <Image
                                src={metric.image}
                                alt={metric.title}
                                width={64}
                                height={64}
                            />
                        </div>
                        <div className="flex items-center justify-start flex-wrap gap-2 text-sm">
                            <span className="text-[#00B69B] flex items-center gap-1"><TrendingUp className='size-4' /> {metric.changePercentage}%</span>
                            <span className="text-gray-500">{metric.changeText}</span>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    )
}

export default MetricsCards