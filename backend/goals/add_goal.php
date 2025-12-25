<?php
header("Content-Type: application/json");
session_start();
require('../../config.php');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$user_id    = $_SESSION['user_id'];
$type       = $_POST['goalType'] ?? '';        // harus sesuai enum: semester|academic|career|personal
$title      = $_POST['goalTitle'] ?? '';
$description= $_POST['goalDescription'] ?? ''; // atau goalNotes, tapi disamakan
$deadline   = $_POST['goalDeadline'] ?? null;
$progress   = 0;

$stmt = $conn->prepare("
    INSERT INTO goals (user_id, type, title, description, deadline, progress)
    VALUES (?, ?, ?, ?, ?, ?)
");
$stmt->bind_param("issssi", $user_id, $type, $title, $description, $deadline, $progress);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Target berhasil ditambahkan"]);
} else {
    echo json_encode(["status" => "error", "message" => "Gagal menambahkan target"]);
}
?>
