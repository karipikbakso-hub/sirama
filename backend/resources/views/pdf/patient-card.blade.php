<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Kartu Berobat - {{ $patient->nama_lengkap }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
        }
        .card {
            width: 85.6mm; /* ID card width */
            height: 54mm;  /* ID card height */
            border: 2px solid #2563eb;
            border-radius: 8px;
            padding: 10px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            position: relative;
            overflow: hidden;
        }
        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 30px;
            background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
        }
        .header {
            text-align: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 5px;
            position: relative;
            z-index: 1;
        }
        .logo-section {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        .logo {
            width: 40px;
            height: 40px;
            background: #e5e7eb;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            margin-right: 10px;
        }
        .hospital-info {
            flex: 1;
        }
        .hospital-name {
            font-size: 10px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 2px;
        }
        .hospital-address {
            font-size: 8px;
            color: #6b7280;
        }
        .patient-info {
            display: flex;
            gap: 10px;
        }
        .info-left, .info-right {
            flex: 1;
        }
        .info-item {
            margin-bottom: 3px;
        }
        .label {
            font-size: 7px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .value {
            font-size: 9px;
            color: #1f2937;
            font-weight: 500;
        }
        .qr-section {
            position: absolute;
            bottom: 10px;
            right: 10px;
            text-align: center;
        }
        .qr-code {
            width: 35px;
            height: 35px;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            margin: 0 auto 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: #6b7280;
        }
        .qr-label {
            font-size: 6px;
            color: #6b7280;
        }
        .footer {
            position: absolute;
            bottom: 5px;
            left: 10px;
            font-size: 6px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            KARTU BEROBAT
        </div>

        <div class="logo-section">
            <div class="logo">RS</div>
            <div class="hospital-info">
                <div class="hospital-name">Rumah Sakit SIRAMA</div>
                <div class="hospital-address">Jl. Kesehatan No. 123, Jakarta</div>
            </div>
        </div>

        <div class="patient-info">
            <div class="info-left">
                <div class="info-item">
                    <div class="label">No. RM</div>
                    <div class="value">{{ $patient->no_rm }}</div>
                </div>
                <div class="info-item">
                    <div class="label">Nama</div>
                    <div class="value">{{ $patient->nama_lengkap }}</div>
                </div>
                <div class="info-item">
                    <div class="label">Tgl Lahir</div>
                    <div class="value">{{ \Carbon\Carbon::parse($patient->tanggal_lahir)->format('d/m/Y') }}</div>
                </div>
            </div>
            <div class="info-right">
                <div class="info-item">
                    <div class="label">Jenis Kelamin</div>
                    <div class="value">{{ $patient->jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan' }}</div>
                </div>
                <div class="info-item">
                    <div class="label">No. BPJS</div>
                    <div class="value">{{ $patient->no_bpjs ?: '-' }}</div>
                </div>
                <div class="info-item">
                    <div class="label">Gol. Darah</div>
                    <div class="value">{{ $patient->golongan_darah ?: '-' }}</div>
                </div>
            </div>
        </div>

        <div class="qr-section">
            <div class="qr-code">QR</div>
            <div class="qr-label">Scan untuk info</div>
        </div>

        <div class="footer">
            Berlaku selama menjadi pasien aktif
        </div>
    </div>
</body>
</html>