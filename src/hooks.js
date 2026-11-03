import { useEffect, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Fades elements in as they scroll into view.
// Add data-reveal to any element; pass the route so it re-scans on navigation.
export function useScrollReveal(routeKey) {
  useEffect(() => {
    const items = document.querySelectorAll('[data-reveal]')
    if (!items.length) return

    // No IntersectionObserver (or reduced motion): just show everything.
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('nq-in'))
      return
    }

    document.documentElement.classList.add('nq-js')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('nq-in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    items.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [routeKey])
}

// Counts from 0 up to `target` once, e.g. for the stats strip.
export function useCountUp(target, duration = 1100) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!target || prefersReducedMotion()) return
    let frame
    const start = performance.now()
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  // With reduced motion the number is shown straight away, no counting
  return prefersReducedMotion() ? target : value
}