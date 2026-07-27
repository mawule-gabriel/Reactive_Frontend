import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AlertCircle, MoreHorizontal, Plus, Search } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { departmentsApi } from '@/api/departments'
import { ApiError } from '@/api/client'
import type { DepartmentResponse } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DepartmentFormDialog } from '@/components/departments/DepartmentFormDialog'

export function DepartmentsPage() {
  const { isAdmin } = useAuth()
  const [departments, setDepartments] = useState<DepartmentResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<DepartmentResponse | null>(null)
  const [deletingDepartment, setDeletingDepartment] = useState<DepartmentResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    departmentsApi
      .list()
      .then(setDepartments)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load departments.'))
  }, [])

  const filtered = useMemo(() => {
    if (!departments) return null
    const query = search.trim().toLowerCase()
    if (!query) return departments
    return departments.filter((department) => department.name.toLowerCase().includes(query))
  }, [departments, search])

  function openCreateDialog() {
    setEditingDepartment(null)
    setFormOpen(true)
  }

  function openEditDialog(department: DepartmentResponse) {
    setEditingDepartment(department)
    setFormOpen(true)
  }

  function handleSaved(saved: DepartmentResponse, wasEditing: boolean) {
    setDepartments((current) => {
      if (!current) return [saved]
      const exists = current.some((department) => department.id === saved.id)
      return exists ? current.map((department) => (department.id === saved.id ? saved : department)) : [...current, saved]
    })
    toast.success(wasEditing ? 'Department updated' : 'Department created')
  }

  async function handleConfirmDelete() {
    if (!deletingDepartment) return
    setIsDeleting(true)
    try {
      await departmentsApi.remove(deletingDepartment.id)
      setDepartments((current) => current?.filter((department) => department.id !== deletingDepartment.id) ?? null)
      toast.success('Department deleted')
      setDeletingDepartment(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete department.')
    } finally {
      setIsDeleting(false)
    }
  }

  const isLoading = departments === null

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
          <p className="text-muted-foreground text-sm">Manage your organization's departments.</p>
        </div>
        {isAdmin && (
          <Button onClick={openCreateDialog}>
            <Plus />
            New department
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative max-w-sm">
        <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
        <Input
          placeholder="Search departments..."
          className="pl-8"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              {isAdmin && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  {isAdmin && <TableCell />}
                </TableRow>
              ))}

            {!isLoading && filtered?.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 4 : 3} className="text-muted-foreground h-24 text-center">
                  {search ? 'No departments match your search.' : 'No departments yet.'}
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              filtered?.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">{department.name}</TableCell>
                  <TableCell className="text-muted-foreground">{department.description || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(department.createdAt).toLocaleDateString()}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(department)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => setDeletingDepartment(department)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <DepartmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        department={editingDepartment}
        onSaved={handleSaved}
      />

      <AlertDialog open={deletingDepartment !== null} onOpenChange={(open) => !open && setDeletingDepartment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deletingDepartment?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. If this department still has employees assigned to it, deletion will be
              blocked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
