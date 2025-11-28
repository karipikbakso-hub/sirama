<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Receipt - {{ $billing->no_invoice }}</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            max-width: 300px;
        }
        .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
        }
        .hospital-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .receipt-title {
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
        }
        .label {
            font-weight: bold;
        }
        .divider {
            border-top: 1px dashed #000;
            margin: 10px 0;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 14px;
            margin: 5px 0;
        }
        .payment-method {
            margin: 5px 0;
            padding: 5px;
            background: #f0f0f0;
            border-radius: 3px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
        }
        .receipt-number {
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="hospital-name">{{ $hospital['name'] }}</div>
        <div>{{ $hospital['address'] }}</div>
        <div>{{ $hospital['phone'] }}</div>
    </div>

    <div class="receipt-title">STRUK PEMBAYARAN</div>

    <div class="receipt-number">{{ $receipt_number }}</div>

    <div class="info-row">
        <span class="label">No. Invoice:</span>
        <span>{{ $billing->no_invoice }}</span>
    </div>

    <div class="info-row">
        <span class="label">Tanggal:</span>
        <span>{{ \Carbon\Carbon::parse($billing->tanggal_billing)->format('d/m/Y H:i') }}</span>
    </div>

    <div class="info-row">
        <span class="label">Pasien:</span>
        <span>{{ $billing->patient_name }}</span>
    </div>

    <div class="info-row">
        <span class="label">No. RM:</span>
        <span>{{ $billing->medical_record_number }}</span>
    </div>

    <div class="info-row">
        <span class="label">Kasir:</span>
        <span>{{ $billing->cashier_name ?? 'N/A' }}</span>
    </div>

    <div class="divider"></div>

    <div class="total-row">
        <span>TOTAL TAGIHAN:</span>
        <span>Rp {{ number_format($billing->total_bayar, 0, ',', '.') }}</span>
    </div>

    <div class="divider"></div>

    <div style="margin: 10px 0;">
        <strong>METODE PEMBAYARAN:</strong>
    </div>

    @foreach($payments as $payment)
    <div class="payment-method">
        <div class="info-row">
            <span>{{ ucfirst($payment->metode_bayar) }}:</span>
            <span>Rp {{ number_format($payment->jumlah_bayar, 0, ',', '.') }}</span>
        </div>
        @if($payment->no_referensi)
        <div style="font-size: 10px; color: #666;">
            Ref: {{ $payment->no_referensi }}
        </div>
        @endif
    </div>
    @endforeach

    <div class="divider"></div>

    <div class="total-row">
        <span>TOTAL BAYAR:</span>
        <span>Rp {{ number_format($payments->sum('jumlah_bayar'), 0, ',', '.') }}</span>
    </div>

    @php
        $totalPaid = $payments->sum('jumlah_bayar');
        $change = $totalPaid - $billing->total_bayar;
    @endphp

    @if($change > 0)
    <div class="total-row">
        <span>KEMBALIAN:</span>
        <span>Rp {{ number_format($change, 0, ',', '.') }}</span>
    </div>
    @endif

    <div class="footer">
        <div>Terima Kasih Atas Kunjungan Anda</div>
        <div>Semoga Lekas Sembuh</div>
        <div style="margin-top: 10px; font-size: 9px;">
            Dicetak: {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}
        </div>
    </div>
</body>
</html>