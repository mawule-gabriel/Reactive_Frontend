import type { ReactNode } from 'react'
import officeTeamPhoto from '@/assets/office-team.webp'
import logoMark from '@/assets/hero.png'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={officeTeamPhoto} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-2">
            <img src={logoMark} alt="" className="h-8 w-8" />
            <span className="text-card-title font-semibold">Reactive HR</span>
          </div>
          <blockquote className="max-w-md text-section-title leading-snug font-medium">
            Every department, every hire, one place — built for teams that move fast.
          </blockquote>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
