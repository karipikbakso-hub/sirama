import axios from 'axios'

const apiData = axios.create({
  baseURL: typeof window !== 'undefined' ? 'http://localhost:8000' : '', // Laravel base URL
  withCredentials: true,
})

export default apiData
