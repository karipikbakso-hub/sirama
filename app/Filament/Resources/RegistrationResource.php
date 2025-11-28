<?php

namespace App\Filament\Resources;

use App\Filament\Resources\RegistrationResource\Pages;
use App\Models\Registration;
use App\Models\Patient;
use App\Models\Doctor;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Filament\Notifications\Notification;

class RegistrationResource extends Resource
{
    protected static ?string $model = Registration::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    protected static ?string $navigationGroup = 'Manajemen Registrasi';

    protected static ?string $label = 'Registrasi Pasien';

    protected static ?string $pluralLabel = 'Registrasi Pasien';

    // Form temporarily removed due to Filament version compatibility
    // Will be added back once Filament version is stabilized

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('registration_no')
                    ->label('No. Registrasi')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->weight('bold'),

                Tables\Columns\TextColumn::make('patient.name')
                    ->label('Nama Pasien')
                    ->searchable()
                    ->sortable()
                    ->weight('medium'),

                Tables\Columns\TextColumn::make('patient.mrn')
                    ->label('MRN')
                    ->searchable()
                    ->copyable(),

                Tables\Columns\TextColumn::make('service_unit')
                    ->label('Unit Pelayanan')
                    ->badge()
                    ->color('primary'),

                Tables\Columns\TextColumn::make('doctor.name')
                    ->label('Dokter')
                    ->placeholder('Belum ditentukan'),

                Tables\Columns\TextColumn::make('arrival_type')
                    ->label('Jenis Kedatangan')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'mandiri' => 'success',
                        'rujukan' => 'warning',
                        'igd' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'mandiri' => 'Mandiri',
                        'rujukan' => 'Rujukan',
                        'igd' => 'IGD',
                        default => $state,
                    }),

                Tables\Columns\TextColumn::make('payment_method')
                    ->label('Pembayaran')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'tunai' => 'success',
                        'bpjs' => 'info',
                        'asuransi' => 'warning',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'registered' => 'gray',
                        'checked-in' => 'warning',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'registered' => 'Terdaftar',
                        'checked-in' => 'Check-in',
                        'completed' => 'Selesai',
                        'cancelled' => 'Dibatalkan',
                        default => $state,
                    }),

                Tables\Columns\TextColumn::make('queue_number')
                    ->label('No. Antrian')
                    ->badge()
                    ->color('secondary'),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Waktu Registrasi')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->since(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Status')
                    ->options([
                        'registered' => 'Terdaftar',
                        'checked-in' => 'Check-in',
                        'completed' => 'Selesai',
                        'cancelled' => 'Dibatalkan',
                    ]),

                Tables\Filters\SelectFilter::make('service_unit')
                    ->label('Unit Pelayanan')
                    ->options([
                        'Poli Penyakit Dalam' => 'Poli Penyakit Dalam',
                        'Poli Anak' => 'Poli Anak',
                        'Poli Kandungan' => 'Poli Kandungan',
                        'IGD' => 'IGD',
                        'Rawat Inap' => 'Rawat Inap',
                        'Poli Umum' => 'Poli Umum',
                        'Poli Gigi' => 'Poli Gigi',
                        'Poli Mata' => 'Poli Mata',
                        'Poli THT' => 'Poli THT',
                        'Poli Kulit' => 'Poli Kulit',
                    ]),

                Tables\Filters\SelectFilter::make('payment_method')
                    ->label('Metode Pembayaran')
                    ->options([
                        'tunai' => 'Tunai',
                        'bpjs' => 'BPJS',
                        'asuransi' => 'Asuransi',
                    ]),

                Tables\Filters\SelectFilter::make('arrival_type')
                    ->label('Jenis Kedatangan')
                    ->options([
                        'mandiri' => 'Mandiri',
                        'rujukan' => 'Rujukan',
                        'igd' => 'IGD',
                    ]),

                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('created_from')
                            ->label('Dari Tanggal'),
                        Forms\Components\DatePicker::make('created_until')
                            ->label('Sampai Tanggal'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['created_from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '>=', $date),
                            )
                            ->when(
                                $data['created_until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '<=', $date),
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()
                    ->icon('heroicon-m-eye'),

                Tables\Actions\EditAction::make()
                    ->icon('heroicon-m-pencil'),

                Tables\Actions\Action::make('check_in')
                    ->label('Check-in')
                    ->icon('heroicon-m-check-circle')
                    ->color('success')
                    ->visible(fn (Registration $record): bool => $record->status === 'registered')
                    ->action(function (Registration $record): void {
                        $record->update(['status' => 'checked-in']);
                        Notification::make()
                            ->title('Pasien berhasil check-in')
                            ->success()
                            ->send();
                    }),

                Tables\Actions\Action::make('complete')
                    ->label('Selesai')
                    ->icon('heroicon-m-check-badge')
                    ->color('success')
                    ->visible(fn (Registration $record): bool => $record->status === 'checked-in')
                    ->action(function (Registration $record): void {
                        $record->update(['status' => 'completed']);
                        Notification::make()
                            ->title('Registrasi selesai')
                            ->success()
                            ->send();
                    }),

                Tables\Actions\Action::make('cancel')
                    ->label('Batalkan')
                    ->icon('heroicon-m-x-circle')
                    ->color('danger')
                    ->visible(fn (Registration $record): bool => in_array($record->status, ['registered', 'checked-in']))
                    ->requiresConfirmation()
                    ->action(function (Registration $record): void {
                        $record->update(['status' => 'cancelled']);
                        Notification::make()
                            ->title('Registrasi dibatalkan')
                            ->warning()
                            ->send();
                    }),

                Tables\Actions\DeleteAction::make()
                    ->icon('heroicon-m-trash')
                    ->requiresConfirmation(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\BulkAction::make('check_in_selected')
                        ->label('Check-in Terpilih')
                        ->icon('heroicon-m-check-circle')
                        ->color('success')
                        ->action(function (Collection $records): void {
                            $records->each->update(['status' => 'checked-in']);
                            Notification::make()
                                ->title("{$records->count()} pasien berhasil check-in")
                                ->success()
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),

                    Tables\Actions\BulkAction::make('complete_selected')
                        ->label('Selesaikan Terpilih')
                        ->icon('heroicon-m-check-badge')
                        ->color('success')
                        ->action(function (Collection $records): void {
                            $records->each->update(['status' => 'completed']);
                            Notification::make()
                                ->title("{$records->count()} registrasi diselesaikan")
                                ->success()
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),

                    Tables\Actions\BulkAction::make('cancel_selected')
                        ->label('Batalkan Terpilih')
                        ->icon('heroicon-m-x-circle')
                        ->color('danger')
                        ->requiresConfirmation()
                        ->action(function (Collection $records): void {
                            $records->each->update(['status' => 'cancelled']);
                            Notification::make()
                                ->title("{$records->count()} registrasi dibatalkan")
                                ->warning()
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),

                    Tables\Actions\DeleteBulkAction::make()
                        ->icon('heroicon-m-trash')
                        ->color('danger')
                        ->requiresConfirmation(),
                ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->paginated([10, 25, 50, 100])
            ->poll('30s')
            ->striped()
            ->emptyStateHeading('Belum ada registrasi')
            ->emptyStateDescription('Mulai dengan membuat registrasi pasien baru.')
            ->emptyStateIcon('heroicon-o-clipboard-document-list');
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRegistrations::route('/'),
            'create' => Pages\CreateRegistration::route('/create'),
            'view' => Pages\ViewRegistration::route('/{record}'),
            'edit' => Pages\EditRegistration::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::where('status', 'registered')->count();
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }
}
