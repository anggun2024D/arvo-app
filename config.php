<?php

$host = "localhost";      // host server
$user = "root";           // username default XAMPP
$pass = "";               // password (kosong di XAMPP)
$db   = "arvo_db";        // nama database

// Membuat koneksi
$conn = new mysqli($host, $user, $pass, $db);

// Cek koneksi
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// Set timezone Indonesia
date_default_timezone_set("Asia/Jakarta");

// Aktifkan error (hanya untuk development)
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
?>
