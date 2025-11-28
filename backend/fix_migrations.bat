@echo off
REM Batch script to fix migration files by removing foreign key constraints

echo Fixing migration files...

REM Use PowerShell to replace foreign key patterns
powershell -Command "& {Get-ChildItem -Path 'database/migrations' -Filter '*.php' -Recurse | ForEach-Object { $content = Get-Content $_.FullName -Raw; $content = $content -replace '->foreignId\([^)]+\)->constrained\([^)]+\)', '->unsignedBigInteger(''${1}'')'; $content = $content -replace '->foreignId\([^)]+\)->nullable\(\)->constrained\([^)]+\)', '->unsignedBigInteger(''${1}'')->nullable()'; Set-Content -Path $_.FullName -Value $content; Write-Host 'Processed:' $_.Name }}"

echo Migration files fixed!
pause