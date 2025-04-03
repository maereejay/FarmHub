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
require "../config.php"; // Database connection
require "../auth.php"; // Authentication script to get logged-in user ID

// Get logged-in user ID
$user_id = getUserIdFromToken();

// Get notification ID from the request
$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data["notification_id"])) {
    echo json_encode(["error" => "Notification ID is required"]);
    exit;
}

$notification_id = $data["notification_id"];


// Delete the notification
$sql = "DELETE FROM user_notifications WHERE id = ? AND user_id = ?";
$stmt = $pdo->prepare($sql);
if ($stmt->execute([$notification_id, $user_id])) {
    echo json_encode(["success" => true, "message" => "Notification deleted successfully"]);
} else {
    echo json_encode(["error" => "Failed to delete notification"]);
}
?>
