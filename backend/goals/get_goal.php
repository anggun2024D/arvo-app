<?php
header("Content-Type: application/json");
session_start();
require('../../config.php');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// ===== TAMBAHKAN: Handle GET single goal by ID =====
if (isset($_GET['id']) && !empty($_GET['id'])) {
    $id = intval($_GET['id']);
    
    $stmt = $conn->prepare("SELECT * FROM goals WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $goal = $result->fetch_assoc();
        echo json_encode([
            "status" => "success",
            "goal" => $goal,
            "message" => "Goal found"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Goal not found or you don't have permission"
        ]);
    }
    exit;
}
// ===== END OF SINGLE GOAL HANDLING =====

// Original code for getting ALL goals (sesuaikan dengan kode Anda)
$stmt = $conn->prepare("SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$goals = [];
while ($row = $result->fetch_assoc()) {
    $goals[] = $row;
}

echo json_encode([
    "status" => "success",
    "goals" => $goals
]);
?>