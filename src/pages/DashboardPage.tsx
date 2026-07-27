import { useEffect, useState } from 'react'
import { AlertCircle, Building2, Users } from 'lucide-react'
import { departmentsApi } from '@/api/departments'
import { employeesApi } from '@/api/employees'
import { ApiError } from '@/api/client'
import type { DepartmentResponse, EmployeeResponse } from '@/api/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function DashboardPage() {
  const [departments, setDepartments] = useState<DepartmentResponse[] | null>(null)
  const [employees, setEmployees] = useState<EmployeeResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([departmentsApi.list(), employeesApi.list()])
      .then(([depts, emps]) => {
        if (cancelled) return
        setDepartments(depts)
        setEmployees(emps)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : 'Failed to load dashboard data.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const isLoading = departments === null || employees === null
  const headcountByDepartment = departments?.map((department) => ({
    department,
    count: employees?.filter((employee) => employee.departmentId === department.id).length ?? 0,
  }))
  const maxHeadcount = Math.max(...(headcountByDepartment?.map((entry) => entry.count) ?? [1]), 1)

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-page-title font-semibold tracking-tight">Dashboard</h1>
        <p className="text-foreground-muted text-body">An overview of your organization.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-card-title font-medium">Total Employees</CardTitle>
            <Users className="text-foreground-muted h-4 w-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-metrics font-semibold">{employees?.length}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-card-title font-medium">Total Departments</CardTitle>
            <Building2 className="text-foreground-muted h-4 w-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-metrics font-semibold">{departments?.length}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-card-title font-medium">Headcount by department</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && (
            <>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </>
          )}
          {!isLoading && headcountByDepartment?.length === 0 && (
            <p className="text-foreground-muted text-body">No departments yet.</p>
          )}
          {!isLoading &&
            headcountByDepartment?.map(({ department, count }) => (
              <div key={department.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{department.name}</span>
                  <span className="text-foreground-muted">{count}</span>
                </div>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${(count / maxHeadcount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
