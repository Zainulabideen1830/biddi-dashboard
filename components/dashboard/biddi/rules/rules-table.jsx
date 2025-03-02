import { Checkbox } from '@/components/ui/checkbox'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { ChevronDown } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'

// Sample data - replace with actual data
const rules = [
    {
        id: '00001',
        description: 'Dominik Lamakani',
        addedBy: 'Dominik Lamakani',
        lastUpdatedOn: 'Dominik Lamakani',
    },
    {
        id: '00002',
        description: 'Carolyn McNeail',
        addedBy: 'Carolyn McNeail',
        lastUpdatedOn: 'Carolyn McNeail',
    },
    {
        id: '00003',
        description: 'Carolyn McNeail',
        addedBy: 'Carolyn McNeail',
        lastUpdatedOn: 'Carolyn McNeail',
    },
    {
        id: '00004',
        description: 'Carolyn McNeail',
        addedBy: 'Carolyn McNeail',
        lastUpdatedOn: 'Carolyn McNeail',
    },
    {
        id: '00005',
        description: 'Carolyn McNeail',
        addedBy: 'Carolyn McNeail',
        lastUpdatedOn: 'Carolyn McNeail',
    },
    {
        id: '00006',
        description: 'Carolyn McNeail',
        addedBy: 'Carolyn McNeail',
        lastUpdatedOn: 'Carolyn McNeail',
    },
    {
        id: '00007',
        description: 'Carolyn McNeail',
        addedBy: 'Carolyn McNeail',
        lastUpdatedOn: 'Carolyn McNeail',
    },
    {
        id: '00008',
        description: 'Carolyn McNeail',
        addedBy: 'Carolyn McNeail',
        lastUpdatedOn: 'Carolyn McNeail',
    },
    {
        id: '00009',
        description: 'Carolyn McNeail',
        addedBy: 'Carolyn McNeail',
        lastUpdatedOn: 'Carolyn McNeail',
    },
]

const RulesTable = () => {
    return (
        <div className="space-y-5">
            <div className="bg-white dark:bg-backgroundSecondary rounded-lg shadow-sm">
                <div className="p-5 border-b border-border">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold">Rules</h3>
                        <span className="bg-muted text-muted-foreground text-xs rounded-full px-2 py-0.5">
                            21
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border hover:bg-transparent">
                                <TableHead className="w-[150px] pl-5">RULE</TableHead>
                                <TableHead className="w-[300px]">DESCRIPTION</TableHead>
                                <TableHead className="w-[200px]">ADDED BY</TableHead>
                                <TableHead className="w-[200px]">LAST UPDATED ON</TableHead>
                                <TableHead className="w-[100px] text-right pr-5">ACTION</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules.map((rule) => (
                                <TableRow key={rule.id} className="border-b border-border">
                                    <TableCell className="py-4 pl-5">
                                        <span className="text-sm font-medium text-secondary-base">Rule {rule.id}</span>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{rule.description}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{rule.addedBy}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{rule.lastUpdatedOn}</TableCell>
                                    <TableCell className="text-right pr-5">
                                        <div className="flex items-center justify-end gap-1 text-red-500 cursor-pointer">
                                            <span className="text-xs font-medium">DELETE RULE</span>
                                            <ChevronDown className="size-4" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            <div className='flex items-center justify-between'>
                <div className='text-sm text-muted-foreground'>
                    Showing {rules.length} to {rules.length} of {rules.length} results
                </div>
                <div>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" className='opacity-50 cursor-not-allowed' />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#" isActive>1</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#">2</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#">3</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext href="#" />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    )
}

export default RulesTable