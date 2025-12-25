<?php
header("Content-Type: application/json");
session_start();
require('../../config.php');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$user_id = (int)$_SESSION['user_id'];

$current = $_POST['currentPassword'] ?? '';
$new = $_POST['newPassword'] ?? '';
$confirm = $_POST['confirmPassword'] ?? '';

if (!$current || !$new || !$confirm) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Semua field password wajib diisi"]);
    exit;
}

if ($new !== $confirm) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Konfirmasi password tidak cocok"]);
    exit;
}

if (strlen($new) < 8) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Password baru minimal 8 karakter"]);
    exit;
}

// Ambil hash password saat ini
$stmt = $conn->prepare("SELECT password_hash FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();
if (!$res || $res->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "User tidak ditemukan"]);
    exit;
}
$row = $res->fetch_assoc();
$hash = $row['password_hash'] ?? '';

// Verifikasi current password
if (!password_verify($current, $hash)) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Password saat ini salah"]);
    exit;
}

// Hash dan update
$newHash = password_hash($new, PASSWORD_DEFAULT);
$stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
$stmt->bind_param("si", $newHash, $user_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Password berhasil diubah"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal mengubah password"]);
}
