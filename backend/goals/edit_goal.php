<?php
header("Content-Type: application/json");
session_start();
require('../../config.php');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$user_id    = $_SESSION['user_id'];
$id         = $_POST['id'] ?? 0;
$type       = $_POST['type'] ?? '';
$title      = $_POST['title'] ?? '';
$description= $_POST['description'] ?? '';
$deadline   = $_POST['deadline'] ?? null;
$progress   = intval($_POST['progress'] ?? 0);

// Jika deadline kosong, set ke NULL
if (empty($deadline)) {
    $deadline = null;
}

$stmt = $conn->prepare("
    UPDATE goals
    SET type=?, title=?, description=?, deadline=?, progress=?
    WHERE id=? AND user_id=?
");

$stmt->bind_param("ssssiii", $type, $title, $description, $deadline, $progress, $id, $user_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Target berhasil diperbarui"]);
} else {
    echo json_encode(["status" => "error", "message" => "Gagal update target: " . $stmt->error]);
}
?>