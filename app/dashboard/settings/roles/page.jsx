import RolesTable from '@/components/dashboard/settings/roles/roles-table'
import SectionHeading from '@/components/shared/section-heading'

export const metadata = {
  title: 'Roles Management',
  description: 'Manage roles and their permissions',
}

export default function RolesPage() {
  return (
    <div className="space-y-6 custom_container">
      <div>
        <SectionHeading title='Roles Management' />
      </div>
      <RolesTable />
    </div>
  )
} 