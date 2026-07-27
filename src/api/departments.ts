import { apiRequest } from './client'
import type { DepartmentRequest, DepartmentResponse } from './types'

export const departmentsApi = {
  list: () => apiRequest<DepartmentResponse[]>('/api/departments'),
  get: (id: number) => apiRequest<DepartmentResponse>(`/api/departments/${id}`),
  create: (body: DepartmentRequest) =>
    apiRequest<DepartmentResponse>('/api/departments', { method: 'POST', body }),
  update: (id: number, body: DepartmentRequest) =>
    apiRequest<DepartmentResponse>(`/api/departments/${id}`, { method: 'PUT', body }),
  remove: (id: number) => apiRequest<void>(`/api/departments/${id}`, { method: 'DELETE' }),
}
