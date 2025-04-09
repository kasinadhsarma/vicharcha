import { useState, useLayoutEffect } from 'react'

export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false)

  useLayoutEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return { isMobile }
}
