import SectionHeading from '@/components/shared/section-heading'
import { Input } from '@/components/ui/input'
import UsersTable from '@/components/dashboard/settings/users/users-table'
import AddUser from '@/components/dashboard/settings/users/add-user'
import { Search } from 'lucide-react'

const UsersSettingsPage = () => {
  return (
    <div className='custom_container'>
      <div className='flex items-center justify-between gap-4 flex-wrap mb-6'>
        <SectionHeading title='Manage Users' />
        <div className='flex items-center justify-end gap-4 flex-1'>
          <div className="flex items-center gap-2 border border-[#D5D5D5] dark:border-[#061733] bg-white dark:bg-backgroundSecondary pl-4 rounded-full flex-1 max-w-[470px] ml-5">
            <Search className="size-5 text-muted-foreground" />
            <Input type="text" placeholder="Search" className="border-none outline-none focus:!outline-none focus:!ring-0 shadow-none h-10 text-sm text-muted-foreground" />
          </div>
          <AddUser />
        </div>
      </div>

      <UsersTable />
    </div>
  )
}

export default UsersSettingsPage