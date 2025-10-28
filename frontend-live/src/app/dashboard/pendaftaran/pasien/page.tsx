'use client'

const pasien = [
  { nama: 'Dewi', nik: '3401010101010001', umur: 32, alamat: 'Mlati, Sleman', status: 'Aktif' },
  { nama: 'Budi', nik: '3401010101010002', umur: 45, alamat: 'Godean, Sleman', status: 'Aktif' },
  { nama: 'Siti', nik: '3401010101010003', umur: 29, alamat: 'Ngaglik, Sleman', status: 'Nonaktif' },
  { nama: 'Agus', nik: '3401010101010004', umur: 51, alamat: 'Kalasan, Sleman', status: 'Aktif' },
  { nama: 'Lina', nik: '3401010101010005', umur: 38, alamat: 'Berbah, Sleman', status: 'Aktif' },
  { nama: 'Joko', nik: '3401010101010006', umur: 60, alamat: 'Tempel, Sleman', status: 'Nonaktif' },
  { nama: 'Rina', nik: '3401010101010007', umur: 26, alamat: 'Depok, Sleman', status: 'Aktif' },
]

export default function PasienPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🧑‍⚕️ Data Pasien</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Informasi identitas, status, dan domisili pasien.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Nama</th>
              <th>NIK</th>
              <th>Umur</th>
              <th>Alamat</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pasien.map((p, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{p.nama}</td>
                <td>{p.nik}</td>
                <td>{p.umur} tahun</td>
                <td>{p.alamat}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    p.status === 'Aktif'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}