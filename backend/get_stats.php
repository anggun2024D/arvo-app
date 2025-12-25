<?php
header("Content-Type: application/json");
session_start();
require "../config.php";

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$user = [
    "id"       => $_SESSION["user_id"],
    "username" => $_SESSION["username"]
];

$user_id = (int)$_SESSION['user_id'];

// =====================
// Query statistik
// =====================

$stmt = $conn->prepare("SELECT COUNT(*) AS total FROM schedules WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$totalSchedules = $stmt->get_result()->fetch_assoc()['total'] ?? 0;

$stmt = $conn->prepare("SELECT COUNT(*) AS total FROM notes WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$totalNotes = $stmt->get_result()->fetch_assoc()['total'] ?? 0;

$stmt = $conn->prepare("SELECT COUNT(*) AS total FROM goals WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$totalGoals = $stmt->get_result()->fetch_assoc()['total'] ?? 0;

$stmt = $conn->prepare("SELECT COUNT(*) AS total FROM goals WHERE user_id = ? AND progress = 100");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$completedGoals = $stmt->get_result()->fetch_assoc()['total'] ?? 0;

$stmt = $conn->prepare("SELECT AVG(progress) AS avgProgress FROM goals WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$averageGoalProgress = round($stmt->get_result()->fetch_assoc()['avgProgress'] ?? 0);

$stmt = $conn->prepare("SELECT COUNT(*) AS high FROM schedules WHERE user_id = ? AND priority = 'high'");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$highPrioritySchedules = $stmt->get_result()->fetch_assoc()['high'] ?? 0;

$stmt = $conn->prepare("SELECT COUNT(*) AS days FROM user_activity WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$activeDays = $stmt->get_result()->fetch_assoc()['days'] ?? 0;

$stmt = $conn->prepare("SELECT COUNT(*) AS completed FROM schedules WHERE user_id = ? AND completed = 1");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$completedTasks = $stmt->get_result()->fetch_assoc()['completed'] ?? 0;

echo json_encode([
    "status" => "success",
    "user"   => $user,
    "stats"  => [
        "totalSchedules"        => $totalSchedules,
        "totalNotes"            => $totalNotes,
        "totalGoals"            => $totalGoals,
        "completedGoals"        => $completedGoals,
        "highPrioritySchedules" => $highPrioritySchedules,
        "activeDays"            => $activeDays,
        "averageGoalProgress"   => $averageGoalProgress,
        "completedTasks" => $completedTasks
    ]
]);
?>
