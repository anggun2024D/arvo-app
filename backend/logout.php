<?php
session_start();
session_unset();   // hapus semua session
session_destroy(); // hancurkan session sepenuhnya

header("Content-Type: application/json");

echo json_encode([
    "status" => "success",
    "message" => "Logout berhasil"
]);
?>
