<?php
header("Content-Type: application/json");
require "../config.php";

// SESUAIKAN DENGAN contact.html
$name = $_POST['fullName'] ?? '';    // Ubah dari 'name' ke 'fullName'
$email = $_POST['email'] ?? '';
$subject = $_POST['subject'] ?? '';
$message = $_POST['message'] ?? '';

// Validasi
if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(["status" => "error", "message" => "Semua field wajib diisi"]);
    exit;
}

// Filter input
$name = mysqli_real_escape_string($conn, $name);
$email = mysqli_real_escape_string($conn, $email);
$subject = mysqli_real_escape_string($conn, $subject);
$message = mysqli_real_escape_string($conn, $message);

$stmt = $conn->prepare("
    INSERT INTO contact_messages (name, email, subject, message)
    VALUES (?, ?, ?, ?)
");
$stmt->bind_param("ssss", $name, $email, $subject, $message);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Pesan berhasil dikirim"]);
} else {
    echo json_encode(["status" => "error", "message" => "Gagal mengirim pesan: " . $stmt->error]);
}
?>