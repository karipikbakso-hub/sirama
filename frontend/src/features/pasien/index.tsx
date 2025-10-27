import { usePasienData } from './hooks'
import PasienForm from './components/PasienForm'
import PasienTable from './components/PasienTable'

export default function PasienPage() {
  const { data } = usePasienData()

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Data Pasien</h1>
      <PasienForm />
      <PasienTable data={data} />
    </div>
  )
}

