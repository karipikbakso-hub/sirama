<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Deposit Receipt - {{ $receipt_number }}</title>
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
        .transaction-type {
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
        .transaction-text {
            font-weight: bold;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="hospital-name">{{ $hospital['name'] }}</div>
        <div>{{ $hospital['address'] }}</div>
        <div>{{ $hospital['phone'] }}</div>
    </div>

    <div class="receipt-title">STRUK {{ $transaction_type == 'top_up' ? 'TOP-UP DEPOSIT' : 'REFUND DEPOSIT' }}</div>

    <div class="receipt-number">{{ $receipt_number }}</div>

    <div class="info-row">
        <span class="label">Tanggal:</span>
        <span>{{ \Carbon\Carbon::parse($transaction->created_at)->format('d/m/Y H:i') }}</span>
    </div>

    <div class="info-row">
        <span class="label">Pasien:</span>
        <span>{{ $patient->nama_pasien }}</span>
    </div>

    <div class="info-row">
        <span class="label">No. RM:</span>
        <span>{{ $patient->no_rm }}</span>
    </div>

    <div class="info-row">
        <span class="label">Tipe Deposit:</span>
        <span>{{ ucfirst(str_replace('_', ' ', $deposit->deposit_type)) }}</span>
    </div>

    <div class="divider"></div>

    <div class="total-row">
        <span>{{ $transaction_type == 'top_up' ? 'JUMLAH TOP-UP' : 'JUMLAH REFUND' }}:</span>
        <span>Rp {{ number_format($transaction->amount, 0, ',', '.') }}</span>
    </div>

    <div class="divider"></div>

    <div style="margin: 10px 0;">
        <div class="transaction-type">
            <div style="text-align: center;">
                <div class="transaction-text">{{ ucfirst(str_replace('_', ' ', $transaction_type)) }}</div>
                @if($transaction->payment_method)
                <div style="font-size: 10px; margin-top: 3px;">
                    Metode: {{ ucfirst($transaction->payment_method) }}
                </div>
                @endif
                @if($transaction->reference_id)
                <div style="font-size: 10px; margin-top: 3px;">
                    Ref: {{ $transaction->reference_id }}
                </div>
                @endif
            </div>
        </div>
    </div>

    <div class="divider"></div>

    <div style="margin: 10px 0; font-size: 11px;">
        <strong>SALDO DEPOSIT SETELAH TRANSAKSI:</strong><br/>
        <span>Rp {{ number_format($deposit->balance, 0, ',', '.') }}</span>
    </div>

    @if($transaction->notes)
    <div style="margin: 10px 0; font-size: 10px;">
        <strong>Catatan:</strong><br/>
        {{ $transaction->notes }}
    </div>
    @endif

    <div class="footer">
        <div>Terima Kasih Atas Kunjungan Anda</div>
        <div>Semoga Lekas Sembuh</div>
        <div style="margin-top: 10px; font-size: 9px;">
            Dicetak: {{ $generated_at->format('d/m/Y H:i:s') }}
        </div>
    </div>
</body>
</html>
