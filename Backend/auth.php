<?php
require __DIR__ . "/../vendor/autoload.php";
require "config.php"; // Database connection

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$secret_key = "your_secret_key"; 

function getUserIdFromToken()
{
    global $pdo, $secret_key; 

    // Get Authorization header properly
    $headers = getallheaders();
    $authHeader = $_SERVER["HTTP_AUTHORIZATION"] 
               ?? $_SERVER["REDIRECT_HTTP_AUTHORIZATION"] 
               ?? $headers["Authorization"] 
               ?? null;

    if (!$authHeader) {
        http_response_code(401);
        echo json_encode(["error" => "Authorization token required"]);
        exit;
    }

    // Extract token (remove "Bearer " prefix if present)
    $token = preg_replace('/^Bearer\s/', '', trim($authHeader));

    try {
        // Decode JWT token
        $decoded = JWT::decode($token, new Key($secret_key, "HS256"));
        $user_id = $decoded->id;

        // Verify user exists in DB
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
            http_response_code(401);
            echo json_encode(["error" => "User not found"]);
            exit;
        }

        return $user_id; // Return user ID if valid
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(["error" => "Invalid or expired token", "details" => $e->getMessage()]);
        exit;
    }
}
?>