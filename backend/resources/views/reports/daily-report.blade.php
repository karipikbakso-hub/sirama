<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Harian Kunjungan Pasien - {{ $summary['date'] }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', 'Arial', sans-serif;
            font-size: 10px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .header h1 {
            color: #2563eb;
            font-size: 18px;
            margin: 0 0 5px 0;
            font-weight: bold;
        }

        .header .subtitle {
            color: #666;
            font-size: 12px;
            margin: 0;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
        }

        .summary-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            background: #f9fafb;
        }

        .summary-card .value {
            font-size: 16px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 4px;
        }

        .summary-card .label {
            font-size: 9px;
            color: #666;
            margin: 0;
        }

        .table-container {
            margin-top: 20px;
        }

        .table-title {
            font-size: 14px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 8px;
        }

        th, td {
            border: 1px solid #e5e7eb;
            padding: 6px 8px;
            text-align: left;
            vertical-align: top;
        }

        th {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #374151;
            font-size: 9px;
        }

        tr:nth-child(even) {
            background-color: #f9fafb;
        }

        .status-badge {
            padding: 2px 6px;
            border-radius: 12px;
            font-size: 7px;
            font-weight: bold;
            text-align: center;
            display: inline-block;
        }

        .status-registered { background: #dbeafe; color: #1e40af; }
        .status-checked-in { background: #fef3c7; color: #92400e; }
        .status-completed { background: #d1fae5; color: #065f46; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }

        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 8px;
            color: #666;
        }

        .no-data {
            text-align: center;
            padding: 20px;
            color: #666;
            font-style: italic;
        }

        .page-break {
            page-break-before: always;
        }

        @media print {
            body { margin: 0; }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>Laporan Harian Kunjungan Pasien</h1>
        <p class="subtitle">Tanggal: {{ $summary['date'] }} | Dicetak: {{ $summary['generated_at'] }}</p>
    </div>

    <!-- Summary Cards -->
    <div class="summary-grid">
        <div class="summary-card">
            <div class="value">{{ number_format($summary['total_registrations']) }}</div>
            <p class="label">Total Kunjungan</p>
        </div>
        <div class="summary-card">
            <div class="value">{{ $summary['completed_registrations'] }}</div>
            <p class="label">Kunjungan Selesai</p>
        </div>
        <div class="summary-card">
            <div class="value">{{ $summary['pending_registrations'] }}</div>
            <p class="label">Dalam Proses</p>
        </div>
        <div class="summary-card">
            <div class="value">{{ $summary['cancelled_registrations'] }}</div>
            <p class="label">Dibatalkan</p>
        </div>
    </div>

    <!-- Registrations Table -->
    <div class="table-container">
        <div class="table-title">Detail Kunjungan Pasien</div>

        @if($registrations->count() > 0)
            <table>
                <thead>
                    <tr>
                        <th style="width: 5%;">No</th>
                        <th style="width: 12%;">No. Registrasi</th>
                        <th style="width: 15%;">Nama Pasien</th>
                        <th style="width: 10%;">MRN</th>
                        <th style="width: 12%;">Unit Pelayanan</th>
                        <th style="width: 12%;">Dokter</th>
                        <th style="width: 10%;">Waktu Registrasi</th>
                        <th style="width: 8%;">Status</th>
                        <th style="width: 10%;">Pembayaran</th>
                        <th style="width: 6%;">Sumber Rujukan</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($registrations as $index => $registration)
                        <tr>
                            <td style="text-align: center;">{{ $index + 1 }}</td>
                            <td style="font-family: 'Courier New', monospace; font-size: 8px;">
                                {{ $registration->registration_number }}
                            </td>
                            <td>{{ $registration->patient?->name ?? 'Unknown' }}</td>
                            <td style="font-family: 'Courier New', monospace; font-size: 8px;">
                                {{ $registration->patient?->mrn ?? '-' }}
                            </td>
                            <td>{{ $registration->service_unit ?? 'Umum' }}</td>
                            <td>{{ $registration->doctor?->name ?? '-' }}</td>
                            <td style="font-size: 7px;">
                                {{ \Carbon\Carbon::parse($registration->created_at)->format('H:i') }}
                            </td>
                            <td>
                                @php
                                    $statusClass = match($registration->status) {
                                        'registered' => 'status-registered',
                                        'checked-in' => 'status-checked-in',
                                        'completed' => 'status-completed',
                                        'cancelled' => 'status-cancelled',
                                        default => 'status-registered'
                                    };
                                    $statusText = match($registration->status) {
                                        'registered' => 'Terdaftar',
                                        'checked-in' => 'Check-in',
                                        'completed' => 'Selesai',
                                        'cancelled' => 'Dibatalkan',
                                        default => ucfirst($registration->status)
                                    };
                                @endphp
                                <span class="status-badge {{ $statusClass }}">{{ $statusText }}</span>
                            </td>
                            <td>{{ $registration->payment_method ?? '-' }}</td>
                            <td>{{ $registration->referral_source ?? '-' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div class="no-data">
                Tidak ada data kunjungan untuk tanggal yang dipilih.
            </div>
        @endif
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>Laporan ini dibuat secara otomatis oleh Sistem Informasi Rumah Sakit</p>
        <p>Total Data: {{ $registrations->count() }} kunjungan</p>
    </div>
</body>
</html>
