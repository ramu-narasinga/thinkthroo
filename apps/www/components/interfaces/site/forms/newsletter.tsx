'use client'

import { useEffect, useRef } from 'react'

export default function ConvertKitForm() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://thinkthroo.kit.com/7c78986414/index.js'
    script.async = true
    script.setAttribute('data-uid', '7c78986414')

    if (containerRef.current) {
      containerRef.current.innerHTML = '' // Clear anything if needed
      containerRef.current.appendChild(script)
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="max-w-[80rem] mt-24 mx-auto px-6 md:px-8">
      <div ref={containerRef} />
    </div>
  )
}
