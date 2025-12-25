<?php
header("Content-Type: application/json");
require "../config.php"; // sesuaikan path

// Ambil data dari form
$username = $_POST['regUsername'] ?? '';
$email    = $_POST['regEmail'] ?? '';
$password = $_POST['regPassword'] ?? '';
$confirm  = $_POST['regConfirmPassword'] ?? '';

// Cek password & konfirmasi
if ($password !== $confirm) {
    echo json_encode(["status" => "error", "message" => "Password tidak cocok!"]);
    exit;
}

// Cek apakah username sudah ada
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Username sudah digunakan!"]);
    exit;
}

// Cek apakah email sudah ada
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Email sudah digunakan!"]);
    exit;
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Simpan ke database
$stmt = $conn->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $username, $email, $hashedPassword);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Registrasi berhasil!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Gagal mendaftar."]);
}
?>
