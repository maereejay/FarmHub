<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

require "../auth.php"; // Ensure authentication is included
require "../config.php"; // Database connection

// Handle preflight (CORS)
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

// Authenticate user
$user_id = getUserIdFromToken();

// Fetch 3 most recent incomplete tasks for this user
$stmt = $pdo->prepare("SELECT id, title, description, due_date FROM tasks WHERE user_id = ? AND status != 'complete' ORDER BY due_date ASC LIMIT 3");
$stmt->execute([$user_id]);
$tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(["success" => true, "tasks" => $tasks]);
?>
