<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");

// Nonaktifkan error reporting untuk production
// error_reporting(0);

// Cek session
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

require('../../config.php');

$user_id = $_SESSION['user_id'];

// Ambil data langsung dari $_POST
$id = $_POST['id'] ?? '';
$title = $_POST['title'] ?? '';
$category = $_POST['category'] ?? '';
$content = $_POST['content'] ?? '';

// Validasi sederhana
if (empty($id) || empty($title) || empty($category) || empty($content)) {
    echo json_encode(["status" => "error", "message" => "Semua field wajib diisi"]);
    exit;
}

$id = intval($id);

// Update database
$stmt = $conn->prepare("UPDATE notes SET title=?, category=?, content=? WHERE id=? AND user_id=?");
$stmt->bind_param("sssii", $title, $category, $content, $id, $user_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Notulensi berhasil diupdate"]);
} else {
    echo json_encode(["status" => "error", "message" => "Gagal: " . $stmt->error]);
}

$stmt->close();
exit;
?>