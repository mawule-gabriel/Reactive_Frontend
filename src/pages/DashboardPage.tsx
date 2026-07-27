import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Building2, Users } from 'lucide-react'
import { useDelayedLoading } from '@/hooks/useDelayedLoading'
import { departmentsApi } from '@/api/departments'
import { employeesApi } from '@/api/employees'
import { ApiError } from '@/api/client'
import type { DepartmentResponse, EmployeeResponse } from '@/api/types'
import { getDepartmentColor } from '@/lib/colors'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts'

function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (target === 0) { setValue(0); return }
    const start = performance.now()
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => { if (frameRef.current !== null) cancelAnimationFrame(frameRef.current) }
  }, [target, duration])

  return value
}

function buildHiresOverTime(employees: EmployeeResponse[]) {
  const counts: Record<string, number> = {}
  employees.forEach((e) => {
    const month = e.hireDate.slice(0, 7)
    counts[month] = (counts[month] ?? 0) + 1
  })
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }))
}

const CHART_PURPLE = '#8B5CF6'

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  isLoading,
}: {
  title: string
  value: number
  icon: React.ElementType
  iconBg: string
  isLoading: boolean
}) {
  const animated = useCountUp(isLoading ? 0 : value)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-card-title font-medium">{title}</CardTitle>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-10 w-16" />
        ) : (
          <div className="text-metrics font-semibold tabular-nums">{animated}</div>
        )}
      </CardContent>
    </Card>
  )
}

const CustomTooltipBar = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-body shadow-elevated">
      <p className="font-medium">{label}</p>
      <p className="text-foreground-muted">{payload[0].value} employees</p>
    </div>
  )
}

const CustomTooltipArea = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-body shadow-elevated">
      <p className="font-medium">{label}</p>
      <p className="text-foreground-muted">{payload[0].value} hired</p>
    </div>
  )
}

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
    return () => { cancelled = true }
  }, [])

  const isDataLoading = departments === null || employees === null
  const isLoading = useDelayedLoading(isDataLoading)

  const headcountByDepartment = departments?.map((department) => ({
    name: department.name,
    count: employees?.filter((e) => e.departmentId === department.id).length ?? 0,
    color: getDepartmentColor(department.name),
  })) ?? []

  const hiresOverTime = employees ? buildHiresOverTime(employees) : []

  return (
    <div className="space-y-8 p-4 md:p-8">
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

      <div className="grid gap-6 sm:grid-cols-2">
        <StatCard
          title="Total Employees"
          value={employees?.length ?? 0}
          icon={Users}
          iconBg="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Departments"
          value={departments?.length ?? 0}
          icon={Building2}
          iconBg="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-card-title font-medium">Headcount by department</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <Skeleton className="h-48 w-full" />}
            {!isLoading && headcountByDepartment.length === 0 && (
              <p className="text-foreground-muted text-body py-8 text-center">No departments yet.</p>
            )}
            {!isLoading && headcountByDepartment.length > 0 && (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={headcountByDepartment} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: 'var(--foreground-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: 'var(--foreground-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltipBar />} cursor={{ fill: 'var(--surface-elevated)' }} />
                  <Bar dataKey="count" fill={CHART_PURPLE} radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-card-title font-medium">Hires over time</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <Skeleton className="h-48 w-full" />}
            {!isLoading && hiresOverTime.length === 0 && (
              <p className="text-foreground-muted text-body py-8 text-center">No hire data available yet.</p>
            )}
            {!isLoading && hiresOverTime.length > 0 && (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={hiresOverTime} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hireGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_PURPLE} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={CHART_PURPLE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: 'var(--foreground-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: 'var(--foreground-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltipArea />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={CHART_PURPLE}
                    strokeWidth={2}
                    fill="url(#hireGradient)"
                    dot={{ fill: CHART_PURPLE, r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
