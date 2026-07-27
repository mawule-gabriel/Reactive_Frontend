import { apiRequest } from './client'
import type {
  EmployeeRequest,
  EmployeeResponse,
  EmployeeSelfUpdateRequest,
  EmployeeSummaryResponse,
} from './types'

export const employeesApi = {
  list: (departmentId?: number) =>
    apiRequest<EmployeeResponse[]>(
      `/api/employees${departmentId !== undefined ? `?departmentId=${departmentId}` : ''}`,
    ),
  get: (id: number) => apiRequest<EmployeeResponse>(`/api/employees/${id}`),
  create: (body: EmployeeRequest) =>
    apiRequest<EmployeeResponse>('/api/employees', { method: 'POST', body }),
  update: (id: number, body: EmployeeRequest) =>
    apiRequest<EmployeeResponse>(`/api/employees/${id}`, { method: 'PUT', body }),
  remove: (id: number) => apiRequest<void>(`/api/employees/${id}`, { method: 'DELETE' }),
  me: () => apiRequest<EmployeeResponse>('/api/employees/me'),
  updateMe: (body: EmployeeSelfUpdateRequest) =>
    apiRequest<EmployeeResponse>('/api/employees/me', { method: 'PUT', body }),
  colleagues: () => apiRequest<EmployeeSummaryResponse[]>('/api/employees/me/colleagues'),
}
