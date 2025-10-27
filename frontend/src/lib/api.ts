export async function fetchMock(name: string) {
const res = await fetch(`/data/${name}`)
if (!res.ok) throw new Error('Mock not found')
return res.json()
}
