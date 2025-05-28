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

$user_id = getUserIdFromToken(); // assumes token is valid

if (!isset($_POST['data_index'], $_POST['title'], $_POST['caption'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

$data_index = intval($_POST['data_index']);
$title = trim($_POST['title']);
$caption = trim($_POST['caption']);
$imagePath = null;

// Handle image if uploaded
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    $fileType = mime_content_type($_FILES['image']['tmp_name']);

    if (!in_array($fileType, $allowedTypes)) {
        echo json_encode(['success' => false, 'message' => 'Invalid file type.']);
        exit;
    }

    // Save image with original name
    $uploadDir = "../../frontend/assets/posts/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $originalFileName = $_FILES['image']['name'];
    $sanitizedFileName = preg_replace("/[^a-zA-Z0-9\-\_\.]/", "_", $originalFileName); // basic safety
    $targetPath = $uploadDir . $sanitizedFileName;

    if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
        echo json_encode(['success' => false, 'message' => 'Failed to upload image.']);
        exit;
    }

    $imagePath = "../../frontend/assets/posts/" . $sanitizedFileName;
}

// Check if post exists
$stmt = $pdo->prepare("SELECT id FROM user_recents WHERE user_id = ? AND data_index = ?");
$stmt->execute([$user_id, $data_index]);
$exists = $stmt->fetch();

if ($exists) {
    $query = "UPDATE user_recents SET title = ?, caption = ?, updated_at = NOW()";
    $params = [$title, $caption];

    if (!empty($imagePath)) {
        $query .= ", image = ?";
        $params[] = $imagePath;
    }

    $query .= " WHERE user_id = ? AND data_index = ?";
    $params[] = $user_id;
    $params[] = $data_index;

    $updateStmt = $pdo->prepare($query);
    $updateStmt->execute($params);
} else {
    $insertStmt = $pdo->prepare("
        INSERT INTO user_recents (user_id, data_index, title, image, caption, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    $insertStmt->execute([
        $user_id,
        $data_index,
        $title,
        $imagePath ?? '',
        $caption
    ]);
}

header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'Post saved successfully.']);
