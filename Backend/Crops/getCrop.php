<?php
// Add CORS headers at the top of your PHP files
header("Access-Control-Allow-Origin: *"); // Allow all origins
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); // Allow these HTTP methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow these headers (Content-Type and Authorization)
header("Access-Control-Allow-Credentials: true"); // Allow credentials if needed

// Handle preflight OPTIONS request (when sending complex requests like POST or PUT)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

header("Content-Type: application/json");
require "../config.php"; // Database connection
require "../auth.php"; // Authentication script to get the logged-in user ID

// Get the user ID from the authentication token
$user_id = getUserIdFromToken();

try {
    // Query to get crops associated with the user
    $stmt = $pdo->prepare("SELECT * FROM crops WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $crops = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($crops) {
        echo json_encode(["success" => true, "crops" => $crops]);
    } else {
        echo json_encode(["success" => false, "message" => "No crops found"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch crops", "details" => $e->getMessage()]);
}
?>
