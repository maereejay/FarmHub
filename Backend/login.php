<?php
header("Content-Type: application/json");
require "config.php"; // Ensure this file correctly connects to your DB
require "../vendor/autoload.php"; // Ensure JWT library is installed

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$secret_key = "your_secret_key"; // Change this to a strong secret key

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["email"]) || !isset($data["password"])) {
    echo json_encode(["error" => "Email and password are required"]);
    exit;
}

$email = $data["email"];
$password = $data["password"];

// Check if user exists
$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user["password"])) {
    echo json_encode(["error" => "Invalid email or password"]);
    exit;
}

// Generate JWT Token
$payload = [
    "id" => $user["id"],
    "email" => $user["email"],
    "exp" => time() + 3600 // Token expires in 1 hour
];

$jwt = JWT::encode($payload, $secret_key, "HS256");

// Send response including state
echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "token" => $jwt,
    "first_name" => $user["first_name"],
    "last_name" => $user["last_name"],
    "state" => $user["state"] // Add state here
]);
?>
