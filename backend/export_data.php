<?php
require "../config.php";

$user_id = $_GET['user_id'] ?? 0;

$data = [];

// USERS
$q = $conn->prepare("SELECT id, username, email, institution, major, bio FROM users WHERE id = ?");
$q->bind_param("i", $user_id);
$q->execute();
$data['user'] = $q->get_result()->fetch_assoc();

// SCHEDULES
$q = $conn->prepare("SELECT * FROM schedules WHERE user_id = ?");
$q->bind_param("i", $user_id);
$q->execute();
$data['schedules'] = $q->get_result()->fetch_all(MYSQLI_ASSOC);

// NOTES
$q = $conn->prepare("SELECT * FROM notes WHERE user_id = ?");
$q->bind_param("i", $user_id);
$q->execute();
$data['notes'] = $q->get_result()->fetch_all(MYSQLI_ASSOC);

// GOALS
$q = $conn->prepare("SELECT * FROM goals WHERE user_id = ?");
$q->bind_param("i", $user_id);
$q->execute();
$data['goals'] = $q->get_result()->fetch_all(MYSQLI_ASSOC);

header('Content-Type: application/json');
header('Content-Disposition: attachment; filename="arvo-export-'.$user_id.'.json"');

echo json_encode($data, JSON_PRETTY_PRINT);
?>
