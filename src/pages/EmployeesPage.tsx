import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AlertCircle, MoreHorizontal, Plus, Search } from 'lucide-react'
import { useDelayedLoading } from '@/hooks/useDelayedLoading'
import { useAuth } from '@/context/AuthContext'
import { employeesApi } from '@/api/employees'
import { departmentsApi } from '@/api/departments'
import { ApiError } from '@/api/client'
import type { DepartmentResponse, EmployeeResponse } from '@/api/types'
import { getDepartmentColor } from '@/lib/colors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { EmployeeFormDialog } from '@/components/employees/EmployeeFormDialog'

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function formatHireDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString()
}

function isNewHire(isoDate: string): boolean {
  const [year, month, day] = isoDate.split('-').map(Number)
  const hireDate = new Date(year, month - 1, day)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return hireDate >= thirtyDaysAgo
}

const ALL_DEPARTMENTS = 'all'

export function EmployeesPage() {
  const { isAdmin } = useAuth()
  const [employees, setEmployees] = useState<EmployeeResponse[] | null>(null)
  const [departments, setDepartments] = useState<DepartmentResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState(ALL_DEPARTMENTS)

  const [formOpen, setFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeResponse | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<EmployeeResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    Promise.all([employeesApi.list(), departmentsApi.list()])
      .then(([emps, depts]) => {
        setEmployees(emps)
        setDepartments(depts)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load employees.'))
  }, [])

  const filtered = useMemo(() => {
    if (!employees) return null
    const query = search.trim().toLowerCase()
    return employees.filter((employee) => {
      const matchesDepartment =
        departmentFilter === ALL_DEPARTMENTS || String(employee.departmentId) === departmentFilter
      if (!matchesDepartment) return false
      if (!query) return true
      const haystack = `${employee.firstName} ${employee.lastName} ${employee.email}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [employees, search, departmentFilter])

  function openCreateDialog() {
    setEditingEmployee(null)
    setFormOpen(true)
  }

  function openEditDialog(employee: EmployeeResponse) {
    setEditingEmployee(employee)
    setFormOpen(true)
  }

  function handleSaved(saved: EmployeeResponse, wasEditing: boolean) {
    setEmployees((current) => {
      if (!current) return [saved]
      const exists = current.some((employee) => employee.id === saved.id)
      return exists ? current.map((employee) => (employee.id === saved.id ? saved : employee)) : [...current, saved]
    })
    toast.success(wasEditing ? 'Employee updated' : 'Employee created')
  }

  async function handleConfirmDelete() {
    if (!deletingEmployee) return
    setIsDeleting(true)
    try {
      await employeesApi.remove(deletingEmployee.id)
      setEmployees((current) => current?.filter((employee) => employee.id !== deletingEmployee.id) ?? null)
      toast.success('Employee deleted')
      setDeletingEmployee(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete employee.')
    } finally {
      setIsDeleting(false)
    }
  }

  const isDataLoading = employees === null
  const isLoading = useDelayedLoading(isDataLoading)

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title font-semibold tracking-tight">Employees</h1>
          <p className="text-foreground-muted text-body">
            {isAdmin ? "Manage your organization's staff records." : "View the staff directory."}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreateDialog} disabled={departments.length === 0}>
            <Plus />
            New employee
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="text-foreground-muted absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_DEPARTMENTS}>All departments</SelectItem>
            {departments.map((department) => (
              <SelectItem key={department.id} value={String(department.id)}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-surface overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Department</TableHead>
              {isAdmin && <TableHead>Salary</TableHead>}
              <TableHead>Hire Date</TableHead>
              {isAdmin && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: isAdmin ? 7 : 5 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && filtered?.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 5} className="text-foreground-muted h-24 text-center">
                  {search || departmentFilter !== ALL_DEPARTMENTS
                    ? 'No employees match your filters.'
                    : 'No employees yet.'}
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              filtered?.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {employee.firstName} {employee.lastName}
                      {isNewHire(employee.hireDate) && (
                        <span className="inline-flex items-center rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                          New
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground-muted">{employee.email}</TableCell>
                  <TableCell>{employee.jobTitle}</TableCell>
                  <TableCell>
                    {employee.departmentName ? (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getDepartmentColor(employee.departmentName)}`}>
                        {employee.departmentName}
                      </span>
                    ) : (
                      <span className="text-foreground-muted">—</span>
                    )}
                  </TableCell>
                  {isAdmin && <TableCell>{currencyFormatter.format(employee.salary)}</TableCell>}
                  <TableCell className="text-foreground-muted">{formatHireDate(employee.hireDate)}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(employee)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => setDeletingEmployee(employee)}>
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

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={editingEmployee}
        departments={departments}
        onSaved={handleSaved}
      />

      <AlertDialog open={deletingEmployee !== null} onOpenChange={(open) => !open && setDeletingEmployee(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deletingEmployee?.firstName} {deletingEmployee?.lastName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. If they have login access, it will be removed as well.
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
