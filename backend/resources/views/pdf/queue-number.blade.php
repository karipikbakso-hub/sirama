<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nomor Antrian - {{ $queue_number }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
        }
        .ticket {
            width: 80mm;
            height: 60mm;
            border: 2px solid #2563eb;
            border-radius: 8px;
            padding: 15px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            position: relative;
            overflow: hidden;
        }
        .ticket::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 25px;
            background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
        }
        .header {
            text-align: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
        }
        .queue-number {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin: 10px 0;
            padding: 8px;
            background: white;
            border: 2px solid #2563eb;
            border-radius: 6px;
        }
        .patient-info {
            margin: 8px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
        }
        .label {
            font-size: 8px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .value {
            font-size: 9px;
            color: #1f2937;
            font-weight: 500;
        }
        .poli-info {
            text-align: center;
            margin: 8px 0;
            padding: 6px;
            background: #dbeafe;
            border-radius: 4px;
        }
        .poli-name {
            font-size: 10px;
            font-weight: bold;
            color: #1e40af;
        }
        .doctor-name {
            font-size: 8px;
            color: #3730a3;
        }
        .footer {
            position: absolute;
            bottom: 8px;
            left: 15px;
            right: 15px;
            text-align: center;
            font-size: 7px;
            color: #9ca3af;
        }
        .timestamp {
            font-size: 6px;
            color: #6b7280;
            margin-top: 4px;
        }
    </style>
</head>
<body>
    <div class="ticket">
        <div class="header">
            NOMOR ANTRIAN
        </div>

        <div class="queue-number">
            {{ $queue_number }}
        </div>

        <div class="patient-info">
            <div class="info-row">
                <div>
                    <div class="label">Nama Pasien</div>
                    <div class="value">{{ $patient->nama_lengkap }}</div>
                </div>
                <div>
                    <div class="label">No. RM</div>
                    <div class="value">{{ $patient->no_rm }}</div>
                </div>
            </div>
        </div>

        <div class="poli-info">
            <div class="poli-name">{{ $poli_name }}</div>
            @if(isset($doctor_name))
            <div class="doctor-name">Dokter: {{ $doctor_name }}</div>
            @endif
        </div>

        <div class="footer">
            <div>Silakan menunggu panggilan nomor antrian Anda</div>
            <div class="timestamp">{{ now()->format('d/m/Y H:i') }}</div>
        </div>
    </div>
</body>
</html>