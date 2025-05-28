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

// Get user ID 
$user_id = isset($_GET['id']) ? $_GET['id'] : null;

if ($user_id) {
    // Fetch recent posts from user_recents table
    $stmt = $pdo->prepare("SELECT * FROM user_recents WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($posts) {
        echo json_encode(["success" => true, "posts" => $posts]);
    } else {
        echo json_encode(["success" => false, "message" => "No recent posts found"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "No user ID provided"]);
}
?>
