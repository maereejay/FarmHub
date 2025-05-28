<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require "../config.php";
require "../auth.php";

$user_id = getUserIdFromToken(); // Authenticated user
$data = json_decode(file_get_contents("php://input"), true);

// Extract all possible fields
$fields = [
    'name' => $data['name'] ?? null,
    'location' => $data['location'] ?? null,
    'email' => $data['email'] ?? null,
    'phone_number' => $data['phone'] ?? null,
    'instagram' => $data['instagram'] ?? null,
    'facebook' => $data['facebook'] ?? null,
    'about_me' => $data['about_me'] ?? null,
    'profile_picture' => $data['profile_picture'] ?? null,
];

// Generate slug if name is present
if (!empty($fields['name'])) {
    $slugBase = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $fields['name']), '-'));
    $fields['slug'] = $user_id . "-" . $slugBase;
}

// Remove null fields
$fieldsToUpdate = array_filter($fields, fn($v) => !is_null($v));

// If nothing to update, return
if (empty($fieldsToUpdate)) {
    echo json_encode(['success' => false, 'message' => 'No valid data provided.']);
    exit;
}

try {
    // Check if the user profile already exists
    $checkStmt = $pdo->prepare("SELECT id FROM user_profiles WHERE user_id = ?");
    $checkStmt->execute([$user_id]);
    $exists = $checkStmt->fetch();

    if ($exists) {
        // UPDATE
        $setClause = implode(", ", array_map(fn($key) => "$key = ?", array_keys($fieldsToUpdate)));
        $sql = "UPDATE user_profiles SET $setClause, updated_at = NOW() WHERE user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([...array_values($fieldsToUpdate), $user_id]);
    } else {
        // INSERT
        $columns = implode(", ", array_keys($fieldsToUpdate));
        $placeholders = implode(", ", array_fill(0, count($fieldsToUpdate), '?'));
        $sql = "INSERT INTO user_profiles (user_id, $columns) VALUES (?, $placeholders)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id, ...array_values($fieldsToUpdate)]);
    }

    echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
