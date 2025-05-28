<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization"); 
header("Access-Control-Allow-Credentials: true"); 


if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

header("Content-Type: application/json");
require "../config.php"; // Database connection
require "../auth.php"; // Authentication script to get the logged-in user ID

// Get the crop ID from the frontend
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["crop_id"])) {
    echo json_encode(["error" => "Crop ID is required"]);
    exit;
}

$crop_id = (int) $data["crop_id"];
$user_id = getUserIdFromToken(); // Get the logged-in user's ID
$sql = "DELETE FROM user_notifications WHERE crop_id = ? AND user_id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$crop_id, $user_id]);
// Check if the crop exists and belongs to the user
$stmt = $pdo->prepare("SELECT * FROM crops WHERE id = ? AND user_id = ?");
$stmt->execute([$crop_id, $user_id]);
$crop = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$crop) {
    echo json_encode(["error" => "Crop not found or you do not have permission to delete it"]);
    exit;
}

// Delete the crop
$sql = "DELETE FROM crops WHERE id = ?";
$stmt = $pdo->prepare($sql);
$success = $stmt->execute([$crop_id]);

if ($success) {
    echo json_encode(["success" => true, "message" => "Crop deleted successfully"]);
} else {
    echo json_encode(["error" => "Failed to delete crop"]);
}
?>
