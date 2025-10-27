import { useKasirData } from './hooks'
import KasirForm from './components/KasirForm'
import KasirTable from './components/KasirTable'

export default function KasirPage() {
  const { data } = useKasirData()

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Transaksi Kasir</h1>
      <KasirForm />
      <KasirTable data={data} />
    </div>
  )
}
