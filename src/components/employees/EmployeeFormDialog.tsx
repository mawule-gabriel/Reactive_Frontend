import { useEffect, useState, type FormEvent } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { employeesApi } from '@/api/employees'
import { ApiError } from '@/api/client'
import type { DepartmentResponse, EmployeeResponse } from '@/api/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface EmployeeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: EmployeeResponse | null
  departments: DepartmentResponse[]
  onSaved: (employee: EmployeeResponse, wasEditing: boolean) => void
}

interface FormState {
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  salary: string
  hireDate: string
  departmentId: string
}

const EMPTY_FORM: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  jobTitle: '',
  salary: '',
  hireDate: '',
  departmentId: '',
}

function toFormState(employee: EmployeeResponse | null): FormState {
  if (!employee) return EMPTY_FORM
  return {
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    jobTitle: employee.jobTitle,
    salary: String(employee.salary),
    hireDate: employee.hireDate,
    departmentId: String(employee.departmentId),
  }
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  departments,
  onSaved,
}: EmployeeFormDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = employee !== null

  useEffect(() => {
    if (open) {
      setForm(toFormState(employee))
      setError(null)
    }
  }, [open, employee])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const request = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        jobTitle: form.jobTitle,
        salary: Number(form.salary),
        hireDate: form.hireDate,
        departmentId: Number(form.departmentId),
      }
      const saved = employee
        ? await employeesApi.update(employee.id, request)
        : await employeesApi.create(request)
      onSaved(saved, isEditing)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit employee' : 'New employee'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update this employee\'s details below.'
                : 'Add a new employee and assign them to a department.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emp-first-name">First name</Label>
                <Input
                  id="emp-first-name"
                  required
                  value={form.firstName}
                  onChange={(event) => updateField('firstName', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-last-name">Last name</Label>
                <Input
                  id="emp-last-name"
                  required
                  value={form.lastName}
                  onChange={(event) => updateField('lastName', event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emp-email">Email</Label>
              <Input
                id="emp-email"
                type="email"
                required
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emp-job-title">Job title</Label>
                <Input
                  id="emp-job-title"
                  required
                  value={form.jobTitle}
                  onChange={(event) => updateField('jobTitle', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-salary">Salary</Label>
                <Input
                  id="emp-salary"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.salary}
                  onChange={(event) => updateField('salary', event.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emp-hire-date">Hire date</Label>
                <Input
                  id="emp-hire-date"
                  type="date"
                  required
                  value={form.hireDate}
                  onChange={(event) => updateField('hireDate', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-department">Department</Label>
                <Select value={form.departmentId} onValueChange={(value) => updateField('departmentId', value)}>
                  <SelectTrigger id="emp-department" className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={String(department.id)}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !form.departmentId}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isEditing ? 'Save changes' : 'Create employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
