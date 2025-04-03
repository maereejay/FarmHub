<?php

// Add CORS headers at the top of your PHP files
header("Access-Control-Allow-Origin: *"); // Allow all origins
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); // Allow these HTTP methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow these headers (Content-Type and Authorization)
header("Access-Control-Allow-Credentials: true"); // Allow credentials if needed

// Handle preflight OPTIONS request (when sending complex requests like POST or PUT)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

header("Content-Type: application/json");
require "../config.php"; // Database connection
require "../auth.php"; // Authentication script to get the logged-in user ID

// Get the input data from the frontend
$data = json_decode(file_get_contents("php://input"), true);

// Check if all required fields are set
if (!isset($data["crop_id"], $data["quantity"])) {
    echo json_encode(["error" => "All fields (crop_id, quantity) are required"]);
    exit;
}

$crop_id = (int) $data["crop_id"];
$quantity = (int) $data["quantity"];
$user_id = getUserIdFromToken(); // Function to get the logged-in user ID

// Retrieve the crop name from the crops table based on the crop_id
$sql = "SELECT crop_name FROM crops WHERE id = ? AND user_id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$crop_id, $user_id]);
$crop = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$crop) {
    echo json_encode(["error" => "Crop not found or you do not have permission to harvest this crop"]);
    exit;
}

$crop_name = $crop["crop_name"];

// Check if the crop already exists in the storage table for the user
$sqlCheckStorage = "SELECT id FROM storage WHERE user_id = ? AND crop_name = ?";
$stmtCheckStorage = $pdo->prepare($sqlCheckStorage);
$stmtCheckStorage->execute([$user_id, $crop_name]);
$existingCropInStorage = $stmtCheckStorage->fetch(PDO::FETCH_ASSOC);

if ($existingCropInStorage) {
    echo json_encode(["error" => "This crop has already been harvested and moved to storage"]);
    exit;
}

// Insert harvested crop into the storage table with current date for "date_harvested"
$sql = "INSERT INTO storage (user_id, crop_name, quantity, date_harvested) VALUES (?, ?, ?, CURDATE())";
$stmt = $pdo->prepare($sql);
$success = $stmt->execute([$user_id, $crop_name, $quantity]);

if ($success) {
    // Delete the crop from the crops table after harvesting
    $sql = "DELETE FROM crops WHERE id = ? AND user_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$crop_id, $user_id]);

    echo json_encode(["success" => true, "message" => "Crop harvested and moved to storage"]);
} else {
    echo json_encode(["error" => "Failed to harvest crop"]);
}
?>
