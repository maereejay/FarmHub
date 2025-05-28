<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization"); 
header("Access-Control-Allow-Credentials: true"); 

// Handle preflight OPTIONS request (when sending complex requests like POST or PUT)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require "../config.php"; // Database connection
require "../auth.php"; // Authentication script to get logged-in user ID

// Get the POST data
$data = json_decode(file_get_contents("php://input"), true);

// Get logged-in user ID from token
$user_id = getUserIdFromToken();  

if ($user_id) {
    // Prepare the SQL query to update the status of all unread notifications to 'read' for the logged-in user
    $stmt = $pdo->prepare("UPDATE user_notifications SET status = 'read' WHERE user_id = ? AND status = 'unread'");

    // Execute the query with the user ID
    $stmt->execute([$user_id]);

    // Check if the update was successful
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No unread notifications found.']);
    }
} else {
    // If the user ID is not found in the token
    echo json_encode(['success' => false, 'message' => 'User ID not found.']);
}
?>
