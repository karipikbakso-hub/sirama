<?php
// Test script for Admin Dashboard API endpoints

function makeRequest($url) {
    echo "Testing: $url\n";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/$url");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json',
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if (curl_errno($ch)) {
        echo "cURL Error: " . curl_error($ch) . "\n";
        return null;
    }

    curl_close($ch);

    echo "HTTP Code: $httpCode\n";

    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo "Response: Success\n";
            return $data;
        } else {
            echo "Response: Invalid JSON - " . substr($response, 0, 200) . "\n";
            return $response;
        }
    } elseif ($httpCode === 500) {
        echo "Response: Server Error - " . substr($response, 0, 200) . "\n";
        return null;
    } else {
        echo "Response: HTTP $httpCode - " . substr($response, 0, 200) . "\n";
        return null;
    }
}

// Test all dashboard endpoints
$endpoints = [
    'api/admin/dashboard/stats',
    'api/admin/dashboard/user-activity',
    'api/admin/dashboard/system-health',
    'api/admin/dashboard/recent-activities',
    'api/admin/dashboard/alerts'
];

foreach ($endpoints as $endpoint) {
    echo "\n" . str_repeat("=", 50) . "\n";
    $result = makeRequest($endpoint);
    if ($result && isset($result['success'])) {
        echo "Status: " . ($result['success'] ? "SUCCESS" : "FAILED") . "\n";
        if (isset($result['message'])) {
            echo "Message: " . $result['message'] . "\n";
        }
    }
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "Dashboard API testing complete!\n";
?>
