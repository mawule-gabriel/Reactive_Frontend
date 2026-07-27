import { useEffect, useState } from 'react'
import { AlertCircle, UserX, Users } from 'lucide-react'
import { employeesApi } from '@/api/employees'
import { ApiError } from '@/api/client'
import type { EmployeeSummaryResponse } from '@/api/types'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getAvatarGradient } from '@/lib/colors'
import { cn } from '@/lib/utils'

function initialsFrom(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function ColleaguesPage() {
  const [colleagues, setColleagues] = useState<EmployeeSummaryResponse[] | null>(null)
  const [notLinked, setNotLinked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    employeesApi
      .colleagues()
      .then(setColleagues)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotLinked(true)
        } else {
          setError(err instanceof ApiError ? err.message : 'Failed to load your colleagues.')
        }
      })
  }, [])

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div>
        <h1 className="text-page-title font-semibold tracking-tight">My Colleagues</h1>
        <p className="text-foreground-muted text-body">People in your department.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {notLinked && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <UserX className="text-foreground-muted h-10 w-10" />
            <p className="font-medium">No employee record linked to your account</p>
            <p className="text-foreground-muted max-w-sm text-body">
              Ask your administrator to add you as an employee using this account's email address.
            </p>
          </CardContent>
        </Card>
      )}

      {!notLinked && !error && colleagues === null && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="flex items-center gap-3 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!notLinked && !error && colleagues !== null && colleagues.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Users className="text-foreground-muted h-10 w-10" />
            <p className="font-medium">No colleagues yet</p>
            <p className="text-foreground-muted max-w-sm text-body">
              There's no one else in your department right now.
            </p>
          </CardContent>
        </Card>
      )}

      {colleagues !== null && colleagues.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {colleagues.map((colleague) => (
            <Card key={colleague.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={cn(getAvatarGradient(`${colleague.firstName} ${colleague.lastName}`))}>
                    {initialsFrom(colleague.firstName, colleague.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {colleague.firstName} {colleague.lastName}
                  </div>
                  <div className="text-foreground-muted text-body">{colleague.jobTitle}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
