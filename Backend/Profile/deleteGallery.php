<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require "../config.php";
require "../auth.php";

// Authenticate and get user ID from token
$user_id = getUserIdFromToken();

// Validate input
if (!isset($_POST['image_name'])) {
    echo json_encode(['success' => false, 'message' => 'Image name is missing.']);
    exit;
}

$image_name = $_POST['image_name'];

// Delete image from database
$sql = "DELETE FROM user_gallery WHERE user_id = ? AND image = ? LIMIT 1";
$stmt = $pdo->prepare($sql);
$stmt->execute([$user_id, $image_name]);

if ($stmt->rowCount() > 0) {
    // Optionally delete the file from the server (uncomment if needed)
    // $filePath = "../../../Assets/Uploads/Gallery/" . $image_name;
    // if (file_exists($filePath)) {
    //     unlink($filePath);
    // }

    echo json_encode(['success' => true, 'message' => 'Image deleted successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Image not found or could not be deleted.']);
}
?>
