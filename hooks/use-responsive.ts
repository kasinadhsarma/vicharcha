import { useEffect, useState } from 'react'

export function useResponsive() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    isDesktop: width >= 1024, // lg
    isTablet: width >= 768 && width < 1024, // md to lg
    isMobile: width < 768, // < md
    width
  }
}
