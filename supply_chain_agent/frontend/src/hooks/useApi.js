import { useCallback, useEffect, useState } from "react"

export function useApi(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fn()
      setData(result)
    } catch (err) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
