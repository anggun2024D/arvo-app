<?php
header("Content-Type: application/json");
session_start();
require('../../config.php');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized"
    ]);
    exit;
}

$user_id  = $_SESSION['user_id'];
$title    = $_POST['noteTitle'] ?? '';
$category = $_POST['noteCategory'] ?? '';
$content  = $_POST['noteContent'] ?? '';

$stmt = $conn->prepare("
    INSERT INTO notes (user_id, title, category, content)
    VALUES (?, ?, ?, ?)
");

$stmt->bind_param("isss", $user_id, $title, $category, $content);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Notulensi berhasil ditambahkan"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Gagal menambahkan notulensi"
    ]);
}
?>
