<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tanda Terima Serah Terima Obat</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
        }
        .header p {
            margin: 5px 0;
            font-size: 11px;
        }
        .info-section {
            margin-bottom: 15px;
        }
        .info-section h3 {
            margin: 0 0 8px 0;
            font-size: 13px;
            font-weight: bold;
            border-bottom: 1px solid #ccc;
            padding-bottom: 3px;
        }
        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 10px;
        }
        .info-row {
            display: table-row;
        }
        .info-label {
            display: table-cell;
            width: 120px;
            font-weight: bold;
            padding: 3px 0;
        }
        .info-value {
            display: table-cell;
            padding: 3px 0;
        }
        .medicine-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 11px;
        }
        .medicine-table th,
        .medicine-table td {
            border: 1px solid #333;
            padding: 6px;
            text-align: left;
        }
        .medicine-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .medicine-table .number {
            text-align: center;
            width: 40px;
        }
        .medicine-table .quantity {
            text-align: center;
            width: 80px;
        }
        .medicine-table .dosage {
            width: 120px;
        }
        .education-section {
            margin: 15px 0;
        }
        .education-section h4 {
            margin: 0 0 8px 0;
            font-size: 12px;
            font-weight: bold;
        }
        .education-item {
            margin: 3px 0;
            padding-left: 15px;
        }
        .education-item::before {
            content: "✓";
            margin-left: -15px;
            margin-right: 5px;
        }
        .signature-section {
            margin-top: 30px;
            display: table;
            width: 100%;
        }
        .signature-box {
            display: table-cell;
            width: 50%;
            text-align: center;
            vertical-align: top;
        }
        .signature-line {
            border-bottom: 1px solid #333;
            margin: 40px 20px 5px 20px;
        }
        .signature-label {
            font-size: 11px;
            margin-top: 5px;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 10px;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 8px;
            margin: 10px 0;
            font-size: 11px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>TANDA TERIMA SERAH TERIMA OBAT</h1>
        <p>Rumah Sakit SIRAMA</p>
        <p>Jl. Contoh No. 123, Kota Contoh</p>
    </div>

    <div class="info-section">
        <h3>Informasi Pasien</h3>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Nama Pasien:</div>
                <div class="info-value">{{ $patient->nama_pasien ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">No. RM:</div>
                <div class="info-value">{{ $patient->no_rm ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Tanggal Lahir:</div>
                <div class="info-value">{{ $patient->tanggal_lahir ? \Carbon\Carbon::parse($patient->tanggal_lahir)->format('d/m/Y') : 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Alamat:</div>
                <div class="info-value">{{ $patient->alamat ?? 'N/A' }}</div>
            </div>
        </div>
    </div>

    <div class="info-section">
        <h3>Informasi Serah Terima</h3>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Tanggal Serah Terima:</div>
                <div class="info-value">{{ $handover->handover_at->format('d/m/Y H:i') }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Penerima Obat:</div>
                <div class="info-value">{{ $handover->receiver_name }} ({{ ucfirst($handover->receiver_relation) }})</div>
            </div>
            <div class="info-row">
                <div class="info-label">Apoteker:</div>
                <div class="info-value">{{ $pharmacist->name ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">No. Resep:</div>
                <div class="info-value">{{ $prescription->prescription_number ?? $prescription->id }}</div>
            </div>
        </div>
    </div>

    <div class="info-section">
        <h3>Daftar Obat</h3>
        <table class="medicine-table">
            <thead>
                <tr>
                    <th class="number">No</th>
                    <th>Nama Obat</th>
                    <th class="dosage">Dosis</th>
                    <th class="quantity">Jumlah</th>
                    <th>Aturan Pakai</th>
                </tr>
            </thead>
            <tbody>
                @foreach($items as $index => $item)
                <tr>
                    <td class="number">{{ $index + 1 }}</td>
                    <td>{{ $item->medicine->nama_obat ?? 'N/A' }}</td>
                    <td>{{ $item->dosage ?? '-' }}</td>
                    <td class="quantity">{{ $item->quantity ?? 0 }} {{ $item->medicine->satuan ?? '' }}</td>
                    <td>{{ $item->instructions ?? '-' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    @if($handover->education_checklist && count($handover->education_checklist) > 0)
    <div class="education-section">
        <h4>Edukasi yang Telah Diberikan:</h4>
        @foreach($handover->education_checklist as $education)
        <div class="education-item">{{ $education }}</div>
        @endforeach
    </div>
    @endif

    <div class="warning">
        <strong>Peringatan:</strong> Simpan obat di tempat yang aman, jauh dari jangkauan anak-anak.
        Ikuti aturan pakai dengan benar. Jika ada efek samping, segera konsultasikan dengan dokter atau apoteker.
    </div>

    @if($handover->notes)
    <div class="info-section">
        <h3>Catatan Tambahan</h3>
        <p>{{ $handover->notes }}</p>
    </div>
    @endif

    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Penerima Obat</div>
            <div style="font-size: 10px; margin-top: 5px;">{{ $handover->receiver_name }}</div>
        </div>
        <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Apoteker Penyerah</div>
            <div style="font-size: 10px; margin-top: 5px;">{{ $pharmacist->name ?? 'N/A' }}</div>
        </div>
    </div>

    <div class="footer">
        <p>Dicetak pada: {{ now()->format('d/m/Y H:i:s') }}</p>
        <p>Dokumen ini merupakan bukti sah serah terima obat dari apotek rumah sakit</p>
    </div>
</body>
</html>