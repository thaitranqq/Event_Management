"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Users, Plus, Trash2, Copy, Check, Loader2 } from "lucide-react"

interface Staff {
    id: string
    name: string
    email: string
    createdAt: string
    _count: {
        assignedEvents: number
    }
}

export default function StaffManagementPage() {
    const { toast } = useToast()
    const [staffList, setStaffList] = useState<Staff[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const [newStaffData, setNewStaffData] = useState({ name: "", username: "" })
    const [createdStaff, setCreatedStaff] = useState<{ email: string, password: string } | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchStaff()
    }, [])

    const fetchStaff = async () => {
        try {
            const res = await fetch("/api/admin/staff")
            if (!res.ok) throw new Error("Failed to fetch staff")
            const data = await res.json()
            setStaffList(data)
        } catch (error) {
            console.error(error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load staff list",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)
        try {
            const res = await fetch("/api/admin/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStaffData),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Failed to create staff")

            setCreatedStaff({
                email: data.staff.email,
                password: data.staff.password
            })

            fetchStaff()
            toast({
                title: "Success",
                description: "Staff account created successfully",
            })
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            })
        } finally {
            setCreating(false)
        }
    }

    const handleDeleteStaff = async (id: string) => {
        if (!confirm("Are you sure you want to delete this staff account?")) return

        try {
            const res = await fetch(`/api/admin/staff/${id}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to delete staff")
            }

            setStaffList(staffList.filter(s => s.id !== id))
            toast({
                title: "Success",
                description: "Staff account deleted",
            })
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            })
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({ description: "Password copied to clipboard" })
    }

    const resetDialog = () => {
        setIsDialogOpen(false)
        setCreatedStaff(null)
        setNewStaffData({ name: "", username: "" })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
                    <p className="text-muted-foreground">Manage staff accounts and assignments</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => !open && resetDialog()}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Staff
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Staff</DialogTitle>
                            <DialogDescription>
                                Create a new staff account. The email will be automatically generated as username@staff.fpt.edu.vn.
                            </DialogDescription>
                        </DialogHeader>

                        {!createdStaff ? (
                            <form onSubmit={handleCreateStaff} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                                    <Input
                                        id="name"
                                        value={newStaffData.name}
                                        onChange={(e) => setNewStaffData({ ...newStaffData, name: e.target.value })}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="username" className="text-sm font-medium">Username</label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="username"
                                            value={newStaffData.username}
                                            onChange={(e) => setNewStaffData({ ...newStaffData, username: e.target.value })}
                                            placeholder="john.doe"
                                            required
                                            pattern="[a-zA-Z0-9.]+"
                                            title="Alphanumeric and dots only"
                                        />
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">@staff.fpt.edu.vn</span>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={creating}>
                                        {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Create Account
                                    </Button>
                                </DialogFooter>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-green-50 p-4 rounded-md border border-green-200 text-center">
                                    <h3 className="text-green-800 font-medium mb-2">Account Created Successfully!</h3>
                                    <p className="text-sm text-green-700 mb-4">Please save these credentials immediately.</p>

                                    <div className="space-y-2 text-left">
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase font-semibold">Email</span>
                                            <div className="font-mono bg-white p-2 rounded border">{createdStaff.email}</div>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase font-semibold">Password</span>
                                            <div className="flex gap-2">
                                                <div className="font-mono bg-white p-2 rounded border flex-1">{createdStaff.password}</div>
                                                <Button size="icon" variant="outline" onClick={() => copyToClipboard(createdStaff.password)}>
                                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={resetDialog}>Close</Button>
                                </DialogFooter>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Staff List</CardTitle>
                    <CardDescription>
                        Total {staffList.length} staff members
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Assigned Events</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {staffList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No staff members found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    staffList.map((staff) => (
                                        <TableRow key={staff.id}>
                                            <TableCell className="font-medium">{staff.name}</TableCell>
                                            <TableCell>{staff.email}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-semibold">{staff._count.assignedEvents}</span>
                                                    <span className="text-xs text-muted-foreground">events</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{new Date(staff.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteStaff(staff.id)}
                                                    disabled={staff._count.assignedEvents > 0}
                                                    title={staff._count.assignedEvents > 0 ? "Cannot delete staff with assigned events" : "Delete staff"}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
