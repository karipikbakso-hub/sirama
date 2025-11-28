<?php
// Simple PHP script to fix migration files

$dir = __DIR__ . '/database/migrations';
$files = glob($dir . '/*.php');

foreach ($files as $file) {
    $content = file_get_contents($file);

    // Fix foreign key constraints - more specific patterns
    $content = preg_replace('/->foreignId\(\'([^)]+)\'\)->constrained\([^)]+\)/', '->unsignedBigInteger(\'$1\')', $content);
    $content = preg_replace('/->foreignId\(\'([^)]+)\'\)->nullable\(\)->constrained\([^)]+\)/', '->unsignedBigInteger(\'$1\')->nullable()', $content);
    $content = preg_replace('/->foreignId\(\'([^)]+)\'\)->constrained\([^)]+\)->onDelete\([^)]+\)/', '->unsignedBigInteger(\'$1\')', $content);
    $content = preg_replace('/->foreignId\(\'([^)]+)\'\)->nullable\(\)->constrained\([^)]+\)->onDelete\([^)]+\)/', '->unsignedBigInteger(\'$1\')->nullable()', $content);

    // Fix broken patterns from previous script
    $content = str_replace('->unsignedBigInteger(\'->onDelete(\'cascade\')', '->unsignedBigInteger(\'patient_id\'', $content);
    $content = str_replace('->unsignedBigInteger(\'->onDelete(\'cascade\')', '->unsignedBigInteger(\'registration_id\'', $content);
    $content = str_replace('->unsignedBigInteger(\'patient_id\'\'', '->unsignedBigInteger(\'patient_id\'', $content);
    $content = str_replace('->unsignedBigInteger(\'registration_id\'\'', '->unsignedBigInteger(\'registration_id\'', $content);

    file_put_contents($file, $content);
    echo "Fixed: " . basename($file) . "\n";
}

echo "All migration files fixed!\n";
?>