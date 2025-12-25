<?php
session_start();
require "../config.php";

$user_id = $_POST['user_id'] ?? 0;

if (!$user_id) {
    echo json_encode(["status" => "error", "message" => "User ID tidak valid"]);
    exit;
}

$q = $conn->prepare("DELETE FROM users WHERE id = ?");
$q->bind_param("i", $user_id);

if ($q->execute()) {
    session_destroy();
    echo json_encode(["status" => "success", "message" => "Akun berhasil dihapus"]);
} else {
    echo json_encode(["status" => "error", "message" => "Gagal menghapus akun"]);
}
?>
