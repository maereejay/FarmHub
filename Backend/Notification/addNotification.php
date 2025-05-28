<?php
require "../config.php"; 
require "../auth.php";

// Get logged-in user ID
$user_id = getUserIdFromToken();

// Check if the notification data is provided
$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data["notification_type"], $data["message"])) {
    echo json_encode(["error" => "Notification type and message are required"]);
    exit;
}

$notification_type = $data["notification_type"];
$message = $data["message"];

// Insert notification into the database
$sql = "INSERT INTO user_notifications (user_id, notification_type, message, status) 
        VALUES (?, ?, ?, 'unread')";
$stmt = $pdo->prepare($sql);
if ($stmt->execute([$user_id, $notification_type, $message])) {
    echo json_encode(["success" => true, "message" => "Notification created successfully"]);
} else {
    echo json_encode(["error" => "Failed to create notification"]);
}
?>
