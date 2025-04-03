<?php
header("Content-Type: application/json");
require "../config.php"; // Database connection
require "../auth.php"; // Authentication script to get the logged-in user ID

// Get the input data from the frontend
$data = json_decode(file_get_contents("php://input"), true);

// Check if crop_id is set
if (!isset($data["crop_id"])) {
    echo json_encode(["error" => "Crop ID is required"]);
    exit;
}

$crop_id = $data["crop_id"];
$user_id = getUserIdFromToken(); // Function to get the logged-in user ID

// Prepare SQL query to delete the crop from the storage table
$sql = "DELETE FROM storage WHERE id = ? AND user_id = ?"; // Ensure we only delete crops belonging to the logged-in user
$stmt = $pdo->prepare($sql);

// Execute the query
$success = $stmt->execute([$crop_id, $user_id]);

// Check if the deletion was successful
if ($success) {
    echo json_encode(["success" => true, "message" => "Crop deleted from storage"]);
} else {
    echo json_encode(["error" => "Failed to delete crop from storage"]);
}
?>
