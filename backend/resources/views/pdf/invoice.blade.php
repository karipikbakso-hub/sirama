<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $billing->no_invoice }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .hospital-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .hospital-info {
            font-size: 14px;
            margin-bottom: 5px;
        }
        .invoice-title {
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }
        .info-section {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        .info-left, .info-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        .info-label {
            font-weight: bold;
            width: 120px;
            display: inline-block;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .table th, .table td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
        }
        .table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .table .text-right {
            text-align: right;
        }
        .table .text-center {
            text-align: center;
        }
        .total-section {
            text-align: right;
            margin-top: 20px;
        }
        .total-row {
            margin: 5px 0;
        }
        .total-label {
            display: inline-block;
            width: 150px;
        }
        .total-amount {
            display: inline-block;
            font-weight: bold;
            min-width: 100px;
            text-align: right;
        }
        .grand-total {
            border-top: 2px solid #333;
            padding-top: 10px;
            font-size: 14px;
            font-weight: bold;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        .signature-section {
            margin-top: 40px;
            display: table;
            width: 100%;
        }
        .signature-left, .signature-right {
            display: table-cell;
            width: 50%;
            text-align: center;
        }
        .signature-line {
            border-bottom: 1px solid #333;
            margin: 40px 20px 5px 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="hospital-name">{{ $hospital['name'] }}</div>
        <div class="hospital-info">{{ $hospital['address'] }}</div>
        <div class="hospital-info">Telp: {{ $hospital['phone'] }} | Email: {{ $hospital['email'] }}</div>
    </div>

    <div class="invoice-title">INVOICE</div>

    <div class="info-section">
        <div class="info-left">
            <div><span class="info-label">No. Invoice:</span> {{ $billing->no_invoice }}</div>
            <div><span class="info-label">Tanggal:</span> {{ \Carbon\Carbon::parse($billing->tanggal_billing)->format('d/m/Y H:i') }}</div>
            <div><span class="info-label">Kasir:</span> {{ $billing->cashier_name ?? 'N/A' }}</div>
        </div>
        <div class="info-right">
            <div><span class="info-label">Nama Pasien:</span> {{ $billing->patient_name }}</div>
            <div><span class="info-label">No. RM:</span> {{ $billing->medical_record_number }}</div>
            <div><span class="info-label">Penjamin:</span> {{ $billing->insurance_type ?? 'Umum' }}</div>
        </div>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 45%;">Deskripsi</th>
                <th style="width: 10%;" class="text-center">Qty</th>
                <th style="width: 20%;" class="text-right">Harga Satuan</th>
                <th style="width: 20%;" class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @php $no = 1; @endphp
            @foreach($items as $item)
            <tr>
                <td class="text-center">{{ $no++ }}</td>
                <td>{{ $item['description'] }}</td>
                <td class="text-center">{{ $item['quantity'] }}</td>
                <td class="text-right">Rp {{ number_format($item['unit_price'], 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($item['total'], 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total-section">
        <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span class="total-amount">Rp {{ number_format($billing->total_tagihan + ($billing->diskon ?? 0), 0, ',', '.') }}</span>
        </div>
        @if($billing->diskon > 0)
        <div class="total-row">
            <span class="total-label">Diskon:</span>
            <span class="total-amount">- Rp {{ number_format($billing->diskon, 0, ',', '.') }}</span>
        </div>
        @endif
        <div class="total-row grand-total">
            <span class="total-label">Total Bayar:</span>
            <span class="total-amount">Rp {{ number_format($billing->total_bayar, 0, ',', '.') }}</span>
        </div>
    </div>

    <div class="signature-section">
        <div class="signature-left">
            <div class="signature-line"></div>
            <div>Pasien/Keluarga</div>
        </div>
        <div class="signature-right">
            <div class="signature-line"></div>
            <div>Kasir</div>
        </div>
    </div>

    <div class="footer">
        <p>Terima kasih atas kunjungan Anda ke {{ $hospital['name'] }}</p>
        <p>Invoice ini dicetak pada {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}</p>
    </div>
</body>
</html>