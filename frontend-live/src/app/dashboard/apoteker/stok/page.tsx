'use client'

const stok = [
  {
    nama: 'Paracetamol',
    jumlah: 1200,
    satuan: 'tablet',
    bentuk: 'Solid',
    kategori: 'Analgesik',
    kadaluarsa: '2026-03-15',
  },
  {
    nama: 'Amoxicillin',
    jumlah: 850,
    satuan: 'kapsul',
    bentuk: 'Solid',
    kategori: 'Antibiotik',
    kadaluarsa: '2025-12-01',
  },
  {
    nama: 'Omeprazole',
    jumlah: 600,
    satuan: 'kapsul',
    bentuk: 'Solid',
    kategori: 'Antasida',
    kadaluarsa: '2026-06-30',
  },
  {
    nama: 'Cetirizine',
    jumlah: 400,
    satuan: 'tablet',
    bentuk: 'Solid',
    kategori: 'Antihistamin',
    kadaluarsa: '2025-11-10',
  },
  {
    nama: 'Ibuprofen',
    jumlah: 950,
    satuan: 'tablet',
    bentuk: 'Solid',
    kategori: 'Anti-inflamasi',
    kadaluarsa: '2026-01-20',
  },
  {
    nama: 'Metformin',
    jumlah: 720,
    satuan: 'tablet',
    bentuk: 'Solid',
    kategori: 'Antidiabetik',
    kadaluarsa: '2025-09-05',
  },
  {
    nama: 'Simvastatin',
    jumlah: 500,
    satuan: 'tablet',
    bentuk: 'Solid',
    kategori: 'Hipolipidemik',
    kadaluarsa: '2026-04-12',
  },
  {
    nama: 'Amlodipine',
    jumlah: 630,
    satuan: 'tablet',
    bentuk: 'Solid',
    kategori: 'Antihipertensi',
    kadaluarsa: '2026-02-28',
  },
  {
    nama: 'Ciprofloxacin',
    jumlah: 300,
    satuan: 'kapsul',
    bentuk: 'Solid',
    kategori: 'Antibiotik',
    kadaluarsa: '2025-10-18',
  },
  {
    nama: 'Lansoprazole',
    jumlah: 450,
    satuan: 'kapsul',
    bentuk: 'Solid',
    kategori: 'Antasida',
    kadaluarsa: '2026-05-07',
  },
]

export default function StokGudangPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Stok Gudang</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
              <th className="px-4 py-3">Nama Obat</th>
              <th className="px-4 py-3">Jumlah</th>
              <th className="px-4 py-3">Satuan</th>
              <th className="px-4 py-3">Bentuk</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Kadaluarsa</th>
            </tr>
          </thead>
          <tbody>
            {stok.map((item, i) => (
              <tr
                key={i}
                className="border-t border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100"
              >
                <td className="px-4 py-2">{item.nama}</td>
                <td className="px-4 py-2">{item.jumlah}</td>
                <td className="px-4 py-2">{item.satuan}</td>
                <td className="px-4 py-2">{item.bentuk}</td>
                <td className="px-4 py-2">{item.kategori}</td>
                <td className="px-4 py-2">{item.kadaluarsa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}