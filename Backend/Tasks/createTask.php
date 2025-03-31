<?php
header("Content-Type: application/json");
require "../config.php"; // Database connection
require "../auth.php"; // Authentication script to get the logged-in user ID

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["title"], $data["description"], $data["due_date"], $data["status"])) {
    echo json_encode(["error" => "All fields are required"]);
    exit;
}

$title = trim($data["title"]);
$description = trim($data["description"]);
$due_date = $data["due_date"];
$status = $data["status"]; // Status will be provided by the frontend
$user_id = getUserIdFromToken(); // Function to get logged-in user ID

// Insert task into the database
$sql = "INSERT INTO tasks (user_id, title, description, due_date, status) VALUES (?, ?, ?, ?, ?)";
$stmt = $pdo->prepare($sql);
$success = $stmt->execute([$user_id, $title, $description, $due_date, $status]);

if ($success) {
    echo json_encode(["success" => true, "message" => "Task created successfully"]);
} else {
    echo json_encode(["error" => "Failed to create task"]);
}
?>
