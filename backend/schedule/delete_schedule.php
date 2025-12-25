<?php
header("Content-Type: application/json");
session_start();
require('../../config.php');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$id = $_POST['id'] ?? '';

$stmt = $conn->prepare("DELETE FROM schedules WHERE id=? AND user_id=?");
$stmt->bind_param("ii", $id, $user_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Jadwal berhasil dihapus"]);
} else {
    echo json_encode(["status" => "error", "message" => "Gagal menghapus jadwal"]);
}
?>
