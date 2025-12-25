<?php
header("Content-Type: application/json");
session_start();
require('../../config.php');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// ===== TAMBAHKAN: Handle GET single note by ID =====
if (isset($_GET['id']) && !empty($_GET['id'])) {
    $id = intval($_GET['id']);
    
    $stmt = $conn->prepare("
        SELECT id, title, category, content, created_at 
        FROM notes
        WHERE id = ? AND user_id = ?
    ");
    $stmt->bind_param("ii", $id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $note = $result->fetch_assoc();
        echo json_encode([
            "status" => "success",
            "note" => $note,
            "message" => "Note found"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Note not found or you don't have permission"
        ]);
    }
    exit;
}
// ===== END OF SINGLE NOTE HANDLING =====

// Original code for getting ALL notes
$stmt = $conn->prepare("
    SELECT id, title, category, content, created_at 
    FROM notes
    WHERE user_id = ?
    ORDER BY created_at DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$notes = [];
while ($row = $result->fetch_assoc()) {
    $notes[] = $row;
}

echo json_encode([
    "status" => "success",
    "notes"  => $notes
]);
?>