import { useAntrianData } from './hooks'
import AntrianForm from './components/AntrianForm'
import AntrianTable from './components/AntrianTable'

export default function AntrianPage() {
  const { data } = useAntrianData()

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Antrian Hari Ini</h1>
      <AntrianForm />
      <AntrianTable data={data} />
    </div>
  )
}
