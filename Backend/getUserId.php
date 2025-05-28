<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
header("Content-Type: application/json");
require_once "auth.php"; 

$user_id = getUserIdFromToken();

echo json_encode([
    "success" => true,
    "user_id" => $user_id
]);
?>
