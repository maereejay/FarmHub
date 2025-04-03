<?php
// Add CORS headers at the top of your PHP files
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request (when sending complex requests like POST or PUT)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require "../config.php"; // Database connection
require "../auth.php"; // Authentication script to get logged-in user ID

// Get the logged-in user ID from token
$user_id = getUserIdFromToken(); // Assuming this function fetches the logged-in user ID from token

// Get the posted user state
$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['user_state'])) {
    echo json_encode(["error" => "User state is missing"]);
    exit;
}

$user_state = $data['user_state']; // Get the user's state passed from the frontend

// SQL query to get the top 5 most popular crops for the user's state
$sql = "
    SELECT c.crop_name, COUNT(DISTINCT c.user_id) AS num_plantings
    FROM crops c
    INNER JOIN users u ON c.user_id = u.id
    WHERE u.state = ?
    GROUP BY c.crop_name
    ORDER BY num_plantings DESC
    LIMIT 5
";
$stmt = $pdo->prepare($sql);
$stmt->execute([$user_state]); // The state variable should be fetched from the user table
$topCrops = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Calculate the total number of plantings for the top 5 crops
$totalPlantings = 0;
foreach ($topCrops as $crop) {
    $totalPlantings += $crop['num_plantings'];
}

// Calculate the percentage for each crop
foreach ($topCrops as &$crop) {
    $crop['percentage'] = ($crop['num_plantings'] / $totalPlantings) * 100;
}

// Respond with the data
echo json_encode(['success' => true, 'top_crops' => $topCrops]);
?>
