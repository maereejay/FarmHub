<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require "../config.php"; // Database connection
require "../auth.php";   // Authentication script to get logged-in user ID

$user_id = getUserIdFromToken(); // Logged-in user ID
$current_date = date('Y-m-d');

// SQL to fetch crops ready to harvest
$sql = "SELECT * FROM crops WHERE harvest_date <= ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$current_date]);

$crops = $stmt->fetchAll(PDO::FETCH_ASSOC);
$newNotifications = false;

foreach ($crops as $crop) {
    $crop_name = $crop['crop_name'];

    // Check if notification with same crop name and created_at date already exists
    $checkSql = "
        SELECT 1 FROM user_notifications 
        WHERE user_id = ? 
          AND crop_name = ? 
          AND DATE(created_at) = ?
        LIMIT 1
    ";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([$user_id, $crop_name, $current_date]);
    $exists = $checkStmt->fetch();

    // If no such notification exists, insert a new one
    if (!$exists) {
        $insertSql = "
            INSERT INTO user_notifications 
            (user_id, notification_type, crop_name, status, created_at, updated_at) 
            VALUES (?, 'harvest', ?, 'unread', NOW(), NOW())
        ";
        $insertStmt = $pdo->prepare($insertSql);
        $insertStmt->execute([$user_id, $crop_name]);

        $newNotifications = true;
    }
}

// Final response
if ($newNotifications) {
    echo json_encode(['success' => true, 'message' => 'Notifications sent successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'No new notifications.']);
}
?>
