import { useState, useEffect } from 'react'

export function useDelayedLoading(isLoading: boolean, delayMs = 300) {
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    
    if (isLoading) {
      timeout = setTimeout(() => {
        setShowLoading(true)
      }, delayMs)
    } else {
      setShowLoading(false)
    }

    return () => clearTimeout(timeout)
  }, [isLoading, delayMs])

  return showLoading
}
