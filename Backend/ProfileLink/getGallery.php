<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

require "../auth.php"; 
require "../config.php"; // Database connection

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// Ensure it's a GET request
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Get user ID from query parameter
$user_id = isset($_GET['id']) ? $_GET['id'] : null;

if ($user_id) {
    // Fetch gallery images from user_gallery table
    $stmt = $pdo->prepare("SELECT * FROM user_gallery WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($images) {
        echo json_encode(["success" => true, "images" => $images]);
    } else {
        echo json_encode(["success" => false, "message" => "No gallery images found"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "No user ID provided"]);
}
?>
