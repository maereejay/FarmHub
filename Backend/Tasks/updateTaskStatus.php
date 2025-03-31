<?php
header("Access-Control-Allow-Origin: *"); // Allow all origins (for development)
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

header("Content-Type: application/json");
require "../auth.php"; // Ensure authentication is included
require "../config.php"; // Database connection

// Get authenticated user ID
$user_id = getUserIdFromToken();

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["id"]) || !isset($data["status"])) {
    echo json_encode(["error" => "Task ID and new status are required"]);
    exit;
}

$task_id = $data["id"];
$new_status = strtolower($data["status"]); // Convert to lowercase for consistency

// Ensure the status is valid
$valid_statuses = ["ongoing", "overdue", "completed"];
if (!in_array($new_status, $valid_statuses)) {
    echo json_encode(["error" => "Invalid status"]);
    exit;
}

// Check if the task belongs to the user
$stmt = $pdo->prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?");
$stmt->execute([$task_id, $user_id]);
$task = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$task) {
    echo json_encode(["error" => "Task not found or unauthorized"]);
    exit;
}

// Update the task status in the database
$updateStmt = $pdo->prepare("UPDATE tasks SET status = ? WHERE id = ?");
$updateStmt->execute([$new_status, $task_id]);

echo json_encode(["success" => true, "message" => "Task status updated"]);
?>
