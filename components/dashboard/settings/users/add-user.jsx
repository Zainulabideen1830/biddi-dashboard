import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

export const AddUser = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="primary" size="xl">
                    <Plus className='size-4' />
                    Add New User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add User</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="name" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            defaultValue="peduarte@gmail.com"
                            className="col-span-3"
                        />
                    </div>
                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="permissions" className="text-right">
                            Permissions
                        </Label>
                        {/* dropdwon for permissions selection(Choose user permission) */}
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a permission" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <div className="flex items-center justify-end gap-4">
                        <Button type="submit" variant="outline">
                            Cancel
                        </Button>   
                        <Button type="submit" variant="primary">
                            Invite User
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddUser