<?php
// Database connection
require "../config.php"; 

// Get the state and current date from the POST request
$data = json_decode(file_get_contents("php://input"), true);
$state = $data['state']; // State from the frontend

// Get the current month
$currentMonth = date('n'); 

// Query the crop_suggestions table to fetch crops based on state and the current month
$sql = "
    SELECT crop_name 
    FROM crop_suggestions 
    WHERE state = ? 
    AND ? BETWEEN planting_month_start AND planting_month_end
";
$stmt = $pdo->prepare($sql);
$stmt->execute([$state, $currentMonth]);

// Fetch the crop names
$crops = $stmt->fetchAll(PDO::FETCH_ASSOC);

// If there are fewer than 6 crops, add 'NA' for the remaining ones
if (count($crops) < 6) {
    $remaining = 6 - count($crops);
    for ($i = 0; $i < $remaining; $i++) {
        $crops[] = ['crop_name' => 'NA'];
    }
}

// Respond with the crop suggestions
echo json_encode(['success' => true, 'crops' => $crops]);
?>
