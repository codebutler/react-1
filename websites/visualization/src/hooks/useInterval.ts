import { useEffect } from 'react'

export const useInterval = (fn: () => void, ms: number) =>
  useEffect(() => {
    const id = setInterval(fn, ms)
    return () => clearInterval(id)
  }, [fn, ms])
