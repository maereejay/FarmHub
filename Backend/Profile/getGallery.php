<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require "../config.php";
require "../auth.php";

$user_id = getUserIdFromToken(); // Get user ID from token

// Fetch all gallery images for this user
$query = "SELECT image FROM user_gallery WHERE user_id = ? ORDER BY uploaded_at DESC";
$stmt = $pdo->prepare($query);
$stmt->execute([$user_id]);

$images = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Respond with all image paths
echo json_encode(['success' => true, 'images' => $images]);
?>
