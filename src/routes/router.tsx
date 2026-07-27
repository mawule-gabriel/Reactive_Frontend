import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { AppShell } from '@/components/AppShell'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    lazy: async () => {
      const { RegisterPage } = await import('@/pages/RegisterPage')
      return { Component: RegisterPage }
    },
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: '/',
            lazy: async () => {
              const { DashboardPage } = await import('@/pages/DashboardPage')
              return { Component: DashboardPage }
            },
          },
          {
            path: '/departments',
            lazy: async () => {
              const { DepartmentsPage } = await import('@/pages/DepartmentsPage')
              return { Component: DepartmentsPage }
            },
          },
          {
            path: '/employees',
            lazy: async () => {
              const { EmployeesPage } = await import('@/pages/EmployeesPage')
              return { Component: EmployeesPage }
            },
          },
          {
            path: '/profile',
            lazy: async () => {
              const { ProfilePage } = await import('@/pages/ProfilePage')
              return { Component: ProfilePage }
            },
          },
          {
            path: '/colleagues',
            lazy: async () => {
              const { ColleaguesPage } = await import('@/pages/ColleaguesPage')
              return { Component: ColleaguesPage }
            },
          },
        ],
      },
    ],
  },
])
