import jsPDF from 'jspdf'

// Generate QR Code URL (using a free QR code service)
const generateQRCodeURL = (data: string): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`
}

// Patient Card PDF Generator
export const generatePatientCard = (patientData: {
  no_rm: string
  nama_lengkap: string
  nik: string
  tanggal_lahir: string
  jenis_kelamin: string
  alamat: string
  telepon?: string
  jenis_asuransi?: string
  no_bpjs?: string
}) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [85.6, 54] // ID card size
  })

  // Colors
  const primaryColor = [0, 123, 255] // Blue
  const textColor = [33, 37, 41] // Dark gray

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, 85.6, 15, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('RUMAH SAKIT SIRAMA', 42.8, 8, { align: 'center' })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Kartu Berobat Pasien', 42.8, 12, { align: 'center' })

  // Patient Info Section
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMASI PASIEN', 5, 22)

  // Patient details
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')

  const details = [
    `No. RM: ${patientData.no_rm}`,
    `Nama: ${patientData.nama_lengkap}`,
    `NIK: ${patientData.nik}`,
    `Tgl Lahir: ${new Date(patientData.tanggal_lahir).toLocaleDateString('id-ID')}`,
    `Jenis Kelamin: ${patientData.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}`,
    `Telepon: ${patientData.telepon || '-'}`
  ]

  details.forEach((detail, index) => {
    doc.text(detail, 5, 28 + (index * 4))
  })

  // Insurance info
  if (patientData.jenis_asuransi) {
    doc.setFont('helvetica', 'bold')
    doc.text('ASURANSI:', 5, 28 + (details.length * 4) + 2)
    doc.setFont('helvetica', 'normal')
    doc.text(`${patientData.jenis_asuransi}${patientData.no_bpjs ? ` - ${patientData.no_bpjs}` : ''}`, 5, 28 + (details.length * 4) + 6)
  }

  // Address (truncated if too long)
  const address = patientData.alamat.length > 50 ? patientData.alamat.substring(0, 47) + '...' : patientData.alamat
  doc.setFont('helvetica', 'bold')
  doc.text('Alamat:', 5, 28 + (details.length * 4) + 10)
  doc.setFont('helvetica', 'normal')
  doc.text(address, 5, 28 + (details.length * 4) + 14)

  // QR Code
  const qrData = `RM:${patientData.no_rm}|NIK:${patientData.nik}|Nama:${patientData.nama_lengkap}`
  const qrURL = generateQRCodeURL(qrData)

  // Note: In a real implementation, you'd load the QR code image
  // For now, we'll just show a placeholder
  doc.setFontSize(6)
  doc.text('QR Code:', 60, 25)
  doc.rect(55, 27, 25, 25)

  // Footer
  doc.setFontSize(6)
  doc.setTextColor(128, 128, 128)
  doc.text('Berlaku selama menjadi pasien aktif', 42.8, 50, { align: 'center' })
  doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 42.8, 53, { align: 'center' })

  return doc
}

// Queue Number PDF Generator
export const generateQueueNumber = (queueData: {
  queue_number: string
  patient_name: string
  poli_name: string
  doctor_name?: string
  registration_date: string
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 60] // Receipt size
  })

  // Colors
  const primaryColor = [0, 123, 255] // Blue
  const accentColor = [40, 167, 69] // Green

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, 80, 15, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('RUMAH SAKIT SIRAMA', 40, 8, { align: 'center' })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Nomor Antrian', 40, 12, { align: 'center' })

  // Queue Number (Large and prominent)
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
  doc.rect(10, 18, 60, 15, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(queueData.queue_number, 40, 28, { align: 'center' })

  // Patient Info
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')

  const info = [
    `Nama: ${queueData.patient_name}`,
    `Poli: ${queueData.poli_name}`,
    `Dokter: ${queueData.doctor_name || 'Umum'}`,
    `Tanggal: ${new Date(queueData.registration_date).toLocaleDateString('id-ID')}`
  ]

  info.forEach((item, index) => {
    doc.text(item, 10, 40 + (index * 4))
  })

  // Instructions
  doc.setFontSize(6)
  doc.setTextColor(128, 128, 128)
  doc.text('Silakan menunggu panggilan sesuai nomor antrian', 40, 52, { align: 'center' })
  doc.text('Nomor antrian akan dipanggil melalui speaker', 40, 55, { align: 'center' })

  // Footer line
  doc.setDrawColor(200, 200, 200)
  doc.line(10, 57, 70, 57)

  return doc
}

// Utility function to download PDF
export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(filename)
}

// Utility function to print PDF (opens in new window)
export const printPDF = (doc: jsPDF) => {
  const pdfBlob = doc.output('blob')
  const pdfURL = URL.createObjectURL(pdfBlob)
  const printWindow = window.open(pdfURL, '_blank')

  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print()
      URL.revokeObjectURL(pdfURL)
    }
  }
}