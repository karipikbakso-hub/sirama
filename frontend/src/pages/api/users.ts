import type { NextApiRequest, NextApiResponse } from 'next'

const API_BASE = 'http://localhost:8000/api/users' // ganti sesuai URL Laravel kamu

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body, query } = req
  const id = query.id ? `/${query.id}` : ''

  const target = `${API_BASE}${id}`

  const laravelRes = await fetch(target, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: method === 'POST' || method === 'PUT' ? JSON.stringify(body) : undefined,
  })

  const data = await laravelRes.json()
  res.status(laravelRes.status).json(data)
}