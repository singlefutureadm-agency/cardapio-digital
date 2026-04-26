// client/src/hooks/useShows.js
import { useState, useEffect } from 'react'
import api from '../services/api'

export function useProximosShows() {
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/shows/proximos')
      .then(({ data }) => setShows(data))
      .finally(() => setLoading(false))
  }, [])

  return { shows, loading }
}