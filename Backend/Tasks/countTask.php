<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

header("Content-Type: application/json");
require "../auth.php"; // Ensure authentication
require "../config.php"; // Database connection

$user_id = getUserIdFromToken(); // Authenticate and get user ID


try {
    // Check if user_id is valid
    if (!$user_id) {
        echo json_encode(["error" => "User not authenticated or invalid token"]);
        exit;
    }

    // SQL query to get total tasks, completed tasks, and uncompleted tasks
    $stmt = $pdo->prepare("SELECT 
        COUNT(*) AS total_tasks, 
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks, 
        SUM(CASE WHEN status != 'completed' THEN 1 ELSE 0 END) AS uncompleted_tasks
    FROM tasks WHERE user_id = ?");
    
    $stmt->execute([$user_id]);

    // Fetch the result
    $result = $stmt->fetch(PDO::FETCH_ASSOC);


    if ($result) {
        // Return the task counts
        echo json_encode([
            "success" => true,
            "total_tasks" => $result["total_tasks"] ?? 0,
            "completed_tasks" => $result["completed_tasks"] ?? 0,
            "uncompleted_tasks" => $result["uncompleted_tasks"] ?? 0
        ]);
    } else {
        echo json_encode(["error" => "No tasks found or database error"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch task counts", "details" => $e->getMessage()]);
}
?>
