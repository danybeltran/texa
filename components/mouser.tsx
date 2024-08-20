'use client'

import { setNavHidden } from '@/states'
import { useEffect } from 'react'

export default function Mouser() {
  useEffect(() => {
    function mouser() {
      setTimeout(() => {
        setNavHidden(false)
      }, 100)
    }

    function mouserHide() {
      setTimeout(() => {
        setNavHidden(true)
      }, 100)
    }

    window.addEventListener('mousemove', mouser)
    window.addEventListener('touchmove', mouser)

    window.addEventListener('wheel', mouserHide)

    return () => {
      window.removeEventListener('mousemove', mouser)
      window.removeEventListener('touchmove', mouser)

      window.removeEventListener('wheel', mouserHide)
    }
  }, [])

  return null
}
