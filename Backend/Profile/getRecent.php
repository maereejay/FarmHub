<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require "../config.php";
require "../auth.php";

$user_id = getUserIdFromToken(); // assumes token is valid

try {
    $stmt = $pdo->prepare("SELECT data_index, title, image, caption FROM user_recents WHERE user_id = ? ORDER BY data_index ASC");
    $stmt->execute([$user_id]);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "posts" => $posts
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error fetching posts",
        "error" => $e->getMessage()
    ]);
}
