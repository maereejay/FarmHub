<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'No valid image uploaded.']);
    exit;
}

// File validation
$allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
$fileType = mime_content_type($_FILES['image']['tmp_name']);

if (!in_array($fileType, $allowedTypes)) {
    echo json_encode(['success' => false, 'message' => 'Invalid file type.']);
    exit;
}

// Upload directory
$uploadDir = "../../frontend/assets/gallery/";
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Use original filename (sanitized)
$originalFileName = $_FILES['image']['name'];
$sanitizedFileName = preg_replace("/[^a-zA-Z0-9\-\_\.]/", "_", $originalFileName);
$targetPath = $uploadDir . $sanitizedFileName;

if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
    echo json_encode(['success' => false, 'message' => 'Failed to save image.']);
    exit;
}

// Relative path for frontend access
$imagePath = "../../frontend/assets/gallery/" . $sanitizedFileName;

// Insert into gallery table
$stmt = $pdo->prepare("INSERT INTO user_gallery (user_id, image) VALUES (?, ?)");
$stmt->execute([$user_id, $imagePath]);

echo json_encode([
    'success' => true,
    'message' => 'Image uploaded to gallery successfully.',
    'image' => $imagePath
]);
