<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require "../config.php";
require "../auth.php";

$user_id = getUserIdFromToken(); // Authenticated user

// Check if a file was uploaded
if (!isset($_FILES['profile_picture']) || $_FILES['profile_picture']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'No valid image uploaded.']);
    exit;
}

// File validation (optional but recommended)
$allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
$fileType = mime_content_type($_FILES['profile_picture']['tmp_name']);

if (!in_array($fileType, $allowedTypes)) {
    echo json_encode(['success' => false, 'message' => 'Invalid file type.']);
    exit;
}

// Create upload directory if not exists
$uploadDir = "../uploads/profile_pictures/";
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Get the original file name
$originalFileName = $_FILES['profile_picture']['name'];

// Sanitize the file name 
$sanitizedFileName = preg_replace("/[^a-zA-Z0-9\-\_\.]/", "_", $originalFileName);

// Set the target path
$targetPath = $uploadDir . $sanitizedFileName;

// Move the uploaded file
if (!move_uploaded_file($_FILES['profile_picture']['tmp_name'], $targetPath)) {
    echo json_encode(['success' => false, 'message' => 'Failed to upload image.']);
    exit;
}

// Store relative path in DB
$imagePath = "../../frontend/assets/profile/" . $sanitizedFileName;

// Check if user profile exists
$checkStmt = $pdo->prepare("SELECT id FROM user_profiles WHERE user_id = ?");
$checkStmt->execute([$user_id]);
$exists = $checkStmt->fetch();

if ($exists) {
    $stmt = $pdo->prepare("UPDATE user_profiles SET profile_picture = ?, updated_at = NOW() WHERE user_id = ?");
    $stmt->execute([$imagePath, $user_id]);
} else {
    $stmt = $pdo->prepare("INSERT INTO user_profiles (user_id, profile_picture) VALUES (?, ?)");
    $stmt->execute([$user_id, $imagePath]);
}

echo json_encode(['success' => true, 'message' => 'Profile picture uploaded successfully.', 'profile_picture' => $imagePath]);
?>
