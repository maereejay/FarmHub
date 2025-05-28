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

header("Content-Type: application/json");
require "../config.php"; // Database connection
require "../auth.php"; // Authentication script to get the logged-in user ID

// Get the input data from the frontend
$data = json_decode(file_get_contents("php://input"), true);

// Check if all required fields are set
if (!isset($data["crop_name"], $data["harvest_date"], $data["quantity"])) {
    echo json_encode(["error" => "All fields (crop_name, harvest_date, quantity) are required"]);
    exit;
}

$crop_name = trim($data["crop_name"]);
$harvest_date = $data["harvest_date"];
$quantity = (int) $data["quantity"];
$plot = isset($data["plot"]) ? trim($data["plot"]) : null;
$user_id = getUserIdFromToken(); // Function to get the logged-in user ID

// Insert crop into the database
$sql = "INSERT INTO crops (user_id, crop_name, harvest_date, quantity, plot) VALUES (?, ?, ?, ?, ?)";
$stmt = $pdo->prepare($sql);
$success = $stmt->execute([$user_id, $crop_name, $harvest_date, $quantity, $plot]);

// Check if the insertion was successful
if ($success) {
    echo json_encode(["success" => true, "message" => "Crop added successfully"]);
} else {
    echo json_encode(["error" => "Failed to add crop"]);
}
?>
