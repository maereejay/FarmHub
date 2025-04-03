<?php
// Add CORS headers at the top of your PHP files
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request (when sending complex requests like POST or PUT)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require "../config.php"; // Database connection
require "../auth.php"; // Authentication script to get logged-in user ID

// Get logged-in user ID from token
$user_id = getUserIdFromToken(); // Assuming this function fetches the logged-in user ID from token

// Get current date
$current_date = date('Y-m-d');

// SQL query to get all crops where harvest_date <= today's date
$sql = "SELECT * FROM crops WHERE harvest_date <= ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$current_date]);

$crops = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Track whether any new notifications were created
$newNotifications = false;

// Loop through crops and create notifications for each one
foreach ($crops as $crop) {
    // Check if this crop's notification already exists for this user
    $checkNotificationSql = "SELECT * FROM user_notifications WHERE user_id = ? AND crop_id = ?";
    $checkStmt = $pdo->prepare($checkNotificationSql);
    $checkStmt->execute([$user_id, $crop['id']]);
    $existingNotification = $checkStmt->fetch(PDO::FETCH_ASSOC);

    // If the notification doesn't already exist, insert a new notification
    if (!$existingNotification) {
        $crop_name = $crop['crop_name']; // Correct column name for crop name
        
        $insertNotificationSql = "INSERT INTO user_notifications (user_id, notification_type, crop_name, crop_id, status, created_at, updated_at) 
                                   VALUES (?, 'harvest', ?, ?, 'unread', NOW(), NOW())";
        $insertStmt = $pdo->prepare($insertNotificationSql);
        $insertStmt->execute([$user_id, $crop_name, $crop['id']]);

        // Set flag indicating that a new notification was inserted
        $newNotifications = true;
    }
}

// Respond with success if new notifications were created, otherwise indicate no new notifications
if ($newNotifications) {
    echo json_encode(['success' => true, 'message' => 'Notifications sent successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'No new notifications.']);
}
?>
