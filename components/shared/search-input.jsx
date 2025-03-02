import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import React from 'react'

const SearchInput = () => {
  return (
    <>
      {/* for small screens only show the serach icon button and for above the sm screen show the search input field */}
      <Button variant="ghost" size="icon" className='lg:hidden'>
        <Search className="size-5 text-muted-foreground" />
      </Button>
      <div className="hidden lg:flex items-center gap-2 border border-[#D5D5D5] dark:border-[#061733] pl-4 rounded-full flex-1 max-w-[410px] ml-5">
        <Search className="size-5 text-muted-foreground" />
        <Input type="text" placeholder="Search" className="border-none outline-none focus:!outline-none focus:!ring-0 shadow-none h-10 text-sm text-muted-foreground" />
      </div>
    </>
  )
}

export default SearchInput