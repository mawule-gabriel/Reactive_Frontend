export type Role = 'ROLE_ADMIN' | 'ROLE_USER'

export interface AuthResponse {
  token: string
  tokenType: string
  email: string
  role: Role
  expiresInMs: number
}

export interface ApiErrorShape {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}

export interface DepartmentResponse {
  id: number
  name: string
  description: string | null
  createdAt: string
}

export interface DepartmentRequest {
  name: string
  description: string
}

export interface EmployeeResponse {
  id: number
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  salary: number
  hireDate: string
  departmentId: number
  departmentName: string | null
  createdAt: string
}

export interface EmployeeRequest {
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  salary: number
  hireDate: string
  departmentId: number
}

export interface EmployeeSelfUpdateRequest {
  firstName: string
  lastName: string
  email: string
}

export interface EmployeeSummaryResponse {
  id: number
  firstName: string
  lastName: string
  jobTitle: string
}
