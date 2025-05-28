<?php
header("Content-Type: application/json"); // Ensure response is JSON
error_reporting(E_ALL);
ini_set('display_errors', 1);

require "config.php"; // Include database connection
require "../vendor/autoload.php"; // Include JWT library

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header("Content-Type: application/json");

// Get JSON input
$data = json_decode(file_get_contents("php://input"));

// Validate input
if (!isset($data->first_name, $data->last_name, $data->email, $data->state, $data->password)) {
    echo json_encode(["error" => "All fields are required"]);
    exit;
}

$first_name = htmlspecialchars(trim($data->first_name));
$last_name = htmlspecialchars(trim($data->last_name));
$email = filter_var($data->email, FILTER_VALIDATE_EMAIL);
$state = htmlspecialchars(trim($data->state));
$password = password_hash($data->password, PASSWORD_DEFAULT);

// Check if email already exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);

if ($stmt->rowCount() > 0) {
    echo json_encode(["error" => "Email already registered"]);
    exit;
}

// Insert new user
$stmt = $pdo->prepare("INSERT INTO users (first_name, last_name, email, state, password) VALUES (?, ?, ?, ?, ?)");
if ($stmt->execute([$first_name, $last_name, $email, $state, $password])) {
    $user_id = $pdo->lastInsertId();

    // Generate JWT Token
    $secret_key = "your_secret_key"; 
    $payload = [
        "user_id" => $user_id,
        "email" => $email,
        "exp" => time() + (60 * 60 * 24) 
    ];
    
    $jwt = JWT::encode($payload, $secret_key, "HS256");

    echo json_encode(["success" => "User registered successfully", "token" => $jwt]);
} else {
    echo json_encode(["error" => "Signup failed"]);
}
?>