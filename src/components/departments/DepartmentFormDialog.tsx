import { useEffect, useState, type FormEvent } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { departmentsApi } from '@/api/departments'
import { ApiError } from '@/api/client'
import type { DepartmentResponse } from '@/api/types'
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
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DepartmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department: DepartmentResponse | null
  onSaved: (department: DepartmentResponse, wasEditing: boolean) => void
}

export function DepartmentFormDialog({ open, onOpenChange, department, onSaved }: DepartmentFormDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = department !== null

  useEffect(() => {
    if (open) {
      setName(department?.name ?? '')
      setDescription(department?.description ?? '')
      setError(null)
    }
  }, [open, department])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const saved = department
        ? await departmentsApi.update(department.id, { name, description })
        : await departmentsApi.create({ name, description })
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
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit department' : 'New department'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the department details below.' : 'Add a new department to your organization.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="dept-name">Name</Label>
              <Input
                id="dept-name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dept-description">Description</Label>
              <Textarea
                id="dept-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isEditing ? 'Save changes' : 'Create department'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
