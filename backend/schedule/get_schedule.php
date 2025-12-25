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

$user_id = $_SESSION['user_id'];

// ===== TAMBAHKAN: Handle GET single schedule by ID =====
if (isset($_GET['id']) && !empty($_GET['id'])) {
    $id = intval($_GET['id']);
    
    $stmt = $conn->prepare("SELECT * FROM schedules WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $schedule = $result->fetch_assoc();
        echo json_encode([
            "status" => "success",
            "schedule" => $schedule,
            "message" => "Schedule found"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Schedule not found or you don't have permission"
        ]);
    }
    exit;
}
// ===== END OF SINGLE SCHEDULE HANDLING =====

// Original code for getting ALL schedules
$stmt = $conn->prepare("SELECT * FROM schedules WHERE user_id = ? ORDER BY date, time");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$schedules = [];
while ($row = $result->fetch_assoc()) {
    $schedules[] = $row;
}

echo json_encode([
    "status" => "success",
    "user" => [
        "id" => $_SESSION['user_id'],
        "username" => $_SESSION['username']
    ],
    "schedules" => $schedules
]);
?>