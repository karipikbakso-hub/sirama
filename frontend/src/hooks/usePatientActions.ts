import { Patient } from '@/types/role/pendaftaran'
import toast from '@/lib/toast'

export function usePatientActions() {
  const printPatientCard = async (patient: Patient) => {
    try {
      // Create printable content
      const printContent = `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
          <h2 style="text-align: center; margin-bottom: 20px;">Kartu Berobat</h2>
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="width: 60px; height: 60px; background: #f0f0f0; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 24px;">👤</span>
            </div>
            <div>
              <h3 style="margin: 0; font-size: 18px;">${patient.name}</h3>
              <p style="margin: 5px 0; color: #666;">No. RM: ${patient.mrn}</p>
            </div>
          </div>
          <div style="margin-bottom: 10px;">
            <strong>NIK:</strong> ****${patient.nik?.slice(-4) || '****'}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Tanggal Lahir:</strong> ${new Date(patient.birth_date).toLocaleDateString('id-ID')}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Jenis Kelamin:</strong> ${patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Asuransi:</strong> ${patient.insurance_status}
          </div>
          ${patient.bpjs_number ? `<div style="margin-bottom: 10px;"><strong>No. BPJS:</strong> ${patient.bpjs_number}</div>` : ''}
          <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
            RSUD SIRAMA - ${new Date().toLocaleDateString('id-ID')}
          </div>
        </div>
      `

      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Kartu Berobat - ${patient.name}</title>
              <style>
                body { margin: 0; padding: 20px; }
                @media print {
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>
              ${printContent}
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 100);
                }
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()
      }

      toast.success('Kartu berobat berhasil dicetak')
    } catch (error) {
      toast.error('Gagal mencetak kartu berobat')
    }
  }

  const exportEMR = async (patient: Patient) => {
    try {
      // Call API to generate and download EMR PDF
      const response = await fetch(`/api/pendaftaran/pasien/${patient.id}/export-emr`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/pdf',
        },
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `EMR_${patient.name}_${patient.mrn}_${new Date().toISOString().split('T')[0]}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('EMR berhasil didownload')
    } catch (error) {
      console.error('Export EMR error:', error)
      toast.error('Gagal export EMR. Silakan coba lagi.')
    }
  }

  const mergeDuplicate = async (patient: Patient) => {
    try {
      // Mock merge functionality
      toast.info('Fitur merge duplikat akan diimplementasikan dengan backend API')
      // This would typically open a modal to select which patient to merge with
    } catch (error) {
      toast.error('Gagal merge pasien duplikat')
    }
  }

  const deactivatePatient = async (patientId: number) => {
    try {
      // Mock deactivate functionality
      if (confirm('Apakah Anda yakin ingin menonaktifkan pasien ini?')) {
        toast.info('Fitur nonaktifkan pasien akan diimplementasikan dengan backend API')
        // This would call an API to soft delete the patient
      }
    } catch (error) {
      toast.error('Gagal menonaktifkan pasien')
    }
  }

  return {
    printPatientCard,
    exportEMR,
    mergeDuplicate,
    deactivatePatient,
  }
}
