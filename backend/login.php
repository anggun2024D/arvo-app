<?php
session_start();
header("Content-Type: application/json");
require "../config.php";

// Ambil data dari form
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

// Cek user berdasarkan username
$stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Username tidak ditemukan"]);
    exit;
}

$user = $result->fetch_assoc();

// Verifikasi password
if (!password_verify($password, $user['password_hash'])) {
    echo json_encode(["status" => "error", "message" => "Password salah"]);
    exit;
}

// SET SESSION
$_SESSION["user_id"] = $user['id'];
$_SESSION["username"] = $user['username'];

// KIRIM DATA LENGKAP KE FRONTEND
echo json_encode([
    "status" => "success",
    "message" => "Login berhasil",
    "user" => [
        "id"          => $user['id'],
        "username"    => $user['username'],
        "email"       => $user['email'],
        "institution" => $user['institution'],
        "major"       => $user['major'],
        "bio"         => $user['bio'],
        "created_at"  => $user['created_at']
    ]
]);
?>
