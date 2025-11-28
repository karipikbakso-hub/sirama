# PowerShell script to remove foreign key constraints from migration files
# This will help fix migration dependency issues

$path = "database/migrations"

# Get all PHP migration files
$migrationFiles = Get-ChildItem -Path $path -Filter "*.php" -Recurse

foreach ($file in $migrationFiles) {
    $content = Get-Content $file.FullName -Raw

    # Remove foreign key constraints using constrained() method
    $content = $content -replace '\$table->foreignId\([^)]+\)->constrained\([^)]+\)([^;]*);', '$table->unsignedBigInteger(''${1}'');'

    # Remove foreign key constraints using references() method
    $content = $content -replace '\$table->foreign\([^)]+\)\s*->references\([^)]+\)\s*->on\([^)]+\)([^;]*);', ''

    # Remove foreign key constraints using constrained() with parameters
    $content = $content -replace '\$table->foreignId\([^)]+\)->constrained\([^)]+\)->onDelete\([^)]+\);', '$table->unsignedBigInteger(''${1}'');'

    # Remove foreign key constraints using constrained() with multiple parameters
    $content = $content -replace '\$table->foreignId\([^)]+\)->constrained\([^)]+\)->onDelete\([^)]+\)->onUpdate\([^)]+\);', '$table->unsignedBigInteger(''${1}'');'

    # Remove foreign key constraints using nullable constrained
    $content = $content -replace '\$table->foreignId\([^)]+\)->nullable\(\)->constrained\([^)]+\);', '$table->unsignedBigInteger(''${1}'')->nullable();'

    # Remove foreign key constraints using nullable constrained with onDelete
    $content = $content -replace '\$table->foreignId\([^)]+\)->nullable\(\)->constrained\([^)]+\)->onDelete\([^)]+\);', '$table->unsignedBigInteger(''${1}'')->nullable();'

    # Write back the modified content
    Set-Content -Path $file.FullName -Value $content

    Write-Host "Processed: $($file.Name)"
}

Write-Host "All migration files processed. Foreign key constraints removed."