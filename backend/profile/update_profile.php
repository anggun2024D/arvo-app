<?php
header("Content-Type: application/json");
session_start();
require('../../config.php');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$username   = trim($_POST['profileName'] ?? '');
$email      = trim($_POST['profileEmail'] ?? '');
$institution= trim($_POST['profileInstitution'] ?? '');
$major      = trim($_POST['profileMajor'] ?? '');
$bio        = trim($_POST['profileBio'] ?? '');

if ($username === '' || $email === '') {
    echo json_encode(["status" => "error", "message" => "Nama dan email wajib diisi"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Email tidak valid"]);
    exit;
}

// Cek email sudah dipakai atau belum
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id <> ?");
$stmt->bind_param("si", $email, $user_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Email sudah digunakan"]);
    exit;
}

// UPDATE
$stmt = $conn->prepare("
    UPDATE users 
    SET username=?, email=?, institution=?, major=?, bio=? 
    WHERE id=?
");
$stmt->bind_param("sssssi", $username, $email, $institution, $major, $bio, $user_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Profil berhasil diperbarui"]);
} else {
    echo json_encode(["status" => "error", "message" => "Gagal update profil"]);
}
?>
