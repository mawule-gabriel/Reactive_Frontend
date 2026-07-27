import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { AlertCircle, Loader2, UserX } from 'lucide-react'
import { useDelayedLoading } from '@/hooks/useDelayedLoading'
import { employeesApi } from '@/api/employees'
import { ApiError } from '@/api/client'
import type { EmployeeResponse } from '@/api/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAvatarGradient } from '@/lib/colors'
import { cn } from '@/lib/utils'

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function formatHireDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString()
}

function initialsFrom(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function ProfilePage() {
  const [employee, setEmployee] = useState<EmployeeResponse | null>(null)
  const [notLinked, setNotLinked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const isLoading = useDelayedLoading(isDataLoading)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    employeesApi
      .me()
      .then((data) => {
        setEmployee(data)
        setFirstName(data.firstName)
        setLastName(data.lastName)
        setEmail(data.email)
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotLinked(true)
        } else {
          setError(err instanceof ApiError ? err.message : 'Failed to load your profile.')
        }
      })
      .finally(() => setIsDataLoading(false))
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setIsSubmitting(true)
    try {
      const updated = await employeesApi.updateMe({ firstName, lastName, email })
      setEmployee(updated)
      toast.success('Profile updated')
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-8 p-4 md:p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (notLinked) {
    return (
      <div className="max-w-3xl p-4 md:p-8">
        <h1 className="mb-6 text-page-title font-semibold tracking-tight">My Profile</h1>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <UserX className="text-foreground-muted h-10 w-10" />
            <p className="font-medium">No employee record linked to your account</p>
            <p className="text-foreground-muted max-w-sm text-body">
              Ask your administrator to add you as an employee using this account's email address.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl p-4 md:p-8">
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!employee) return null

  return (
    <div className="max-w-3xl space-y-8 p-4 md:p-8">
      <div>
        <h1 className="text-page-title font-semibold tracking-tight">My Profile</h1>
        <p className="text-foreground-muted text-body">View and update your personal details.</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className={cn("text-card-title", getAvatarGradient(`${employee.firstName} ${employee.lastName}`))}>              {initialsFrom(employee.firstName, employee.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>
              {employee.firstName} {employee.lastName}
            </CardTitle>
            <CardDescription>{employee.jobTitle}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 border-t pt-4 text-body sm:grid-cols-3">
          <div>
            <div className="text-foreground-muted">Department</div>
            <div className="font-medium">{employee.departmentName ?? '—'}</div>
          </div>
          <div>
            <div className="text-foreground-muted">Salary</div>
            <div className="font-medium">{currencyFormatter.format(employee.salary)}</div>
          </div>
          <div>
            <div className="text-foreground-muted">Hire date</div>
            <div className="font-medium">{formatHireDate(employee.hireDate)}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-card-title">Edit details</CardTitle>
          <CardDescription>Only your name and email can be changed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-first-name">First name</Label>
                <Input
                  id="profile-first-name"
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-last-name">Last name</Label>
                <Input
                  id="profile-last-name"
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
