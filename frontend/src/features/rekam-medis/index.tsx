import { useRekamMedisData } from './hooks'
import RekamMedisForm from './components/RekamMedisForm'
import RekamMedisTable from './components/RekamMedisTable'

export default function RekamMedisPage() {
  const { data } = useRekamMedisData()

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Rekam Medis</h1>
      <RekamMedisForm />
      <RekamMedisTable data={data} />
    </div>
  )
}
