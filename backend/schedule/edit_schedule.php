<?php
header("Content-Type: application/json");
session_start();
require('../../config.php');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$id         = $_POST['id'] ?? '';
$title      = $_POST['title'] ?? '';
$date       = $_POST['date'] ?? '';
$time       = $_POST['time'] ?? '';
$type       = $_POST['type'] ?? '';
$priority   = $_POST['priority'] ?? '';
$desc       = $_POST['description'] ?? '';
$completed  = isset($_POST['completed']) ? 1 : 0;

$stmt = $conn->prepare("
    UPDATE schedules
    SET title=?, date=?, time=?, type=?, priority=?, description=?, completed=?
    WHERE id=? AND user_id=?
");
$stmt->bind_param("ssssssiii", $title, $date, $time, $type, $priority, $desc, $completed, $id, $user_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Jadwal berhasil di-update"]);
} else {
    // TAMBAHKAN error detail untuk debugging
    echo json_encode(["status" => "error", "message" => "Gagal update jadwal: " . $stmt->error]);
}
?>