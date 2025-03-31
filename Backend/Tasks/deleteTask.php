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

// Ensure it's a DELETE request
if ($_SERVER["REQUEST_METHOD"] !== "DELETE") {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Authenticate user
$user_id = getUserIdFromToken();

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["id"])) {
    echo json_encode(["error" => "Task ID is required"]);
    exit;
}

$task_id = $data["id"];

// Check if the task exists and belongs to the user
$stmt = $pdo->prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?");
$stmt->execute([$task_id, $user_id]);
$task = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$task) {
    echo json_encode(["error" => "Task not found or unauthorized"]);
    exit;
}

// Delete the task
$deleteStmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
$deleteStmt->execute([$task_id]);

echo json_encode(["success" => true, "message" => "Task deleted successfully"]);
?>
