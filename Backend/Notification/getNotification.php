<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization"); 
header("Access-Control-Allow-Credentials: true"); 

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require "../config.php"; // Database connection
require "../auth.php"; // Authentication script to get logged-in user ID

// Get logged-in user ID
$user_id = getUserIdFromToken();

// Fetch notifications for the user
$sql = "SELECT * FROM user_notifications WHERE user_id = ? ORDER BY created_at DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute([$user_id]);
$notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Return the notifications in JSON format
echo json_encode(["success" => true, "notifications" => $notifications]);
?>
