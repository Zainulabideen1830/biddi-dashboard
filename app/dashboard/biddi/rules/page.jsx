import SectionHeading from '@/components/shared/section-heading'
import AddRule from '@/components/dashboard/biddi/rules/add-rule'
import RulesTable from '@/components/dashboard/biddi/rules/rules-table'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const RulesPage = () => {
  return (
    <div className='custom_container'>
      <div className='flex items-center justify-between gap-4 flex-wrap mb-6'>
        <SectionHeading title='Rules' />
        <div className='flex items-center justify-end gap-4 flex-1'>
          <Button variant="secondary_outline" size="xl" className="">
            Upgrade to biddi Pro+
            <span className="hidden xl:flex bg-secondary-base hover:bg-secondary-base/90 hover:scale-105 transition-all duration-300 rounded-full w-6 h-6 justify-center items-center">
              <ArrowUpRight className="!siz-[10px] text-white" />
            </span>
          </Button>
          <AddRule />
        </div>
      </div>

      <RulesTable />
    </div>
  )
}

export default RulesPage