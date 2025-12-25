<?php
header("Content-Type: application/json");
session_start();
require('../../config.php');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$user_id  = $_SESSION['user_id'];
$title    = $_POST['scheduleTitle'] ?? '';
$date     = $_POST['scheduleDate'] ?? '';
$time     = $_POST['scheduleTime'] ?? '';
$type     = $_POST['scheduleType'] ?? '';
$priority = $_POST['schedulePriority'] ?? '';
$desc     = $_POST['scheduleDescription'] ?? '';

$stmt = $conn->prepare("
    INSERT INTO schedules (user_id, title, date, time, type, priority, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");
$stmt->bind_param("issssss", $user_id, $title, $date, $time, $type, $priority, $desc);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Jadwal berhasil ditambahkan",
        "schedule" => [
            "id" => $stmt->insert_id,
            "title" => $title,
            "date" => $date,
            "time" => $time,
            "type" => $type,
            "priority" => $priority,
            "description" => $desc
        ]
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Gagal menambahkan jadwal"]);
}
?>
