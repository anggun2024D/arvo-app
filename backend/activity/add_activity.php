<?php
header("Content-Type: application/json");
session_start();

// Debug: Cek session
error_log("DEBUG add_activity.php: Session user_id = " . ($_SESSION['user_id'] ?? 'NOT SET'));

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized - No session"]);
    exit;
}

require '../../config.php';  
$user_id = (int)$_SESSION['user_id'];
$today = date("Y-m-d");

error_log("DEBUG: user_id=$user_id, today=$today");

try {
    // Insert IF NOT EXISTS
    $stmt = $conn->prepare("
        INSERT IGNORE INTO user_activity (user_id, activity_date)
        VALUES (?, ?)
    ");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("is", $user_id, $today);
    
    if ($stmt->execute()) {
        $affected_rows = $stmt->affected_rows;
        error_log("DEBUG: Inserted/ignored. Affected rows: $affected_rows");
        echo json_encode([
            "status" => "success", 
            "message" => "Activity logged",
            "affected_rows" => $affected_rows
        ]);
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    error_log("ERROR add_activity.php: " . $e->getMessage());
    echo json_encode([
        "status" => "error", 
        "message" => "Database error: " . $e->getMessage()
    ]);
}

$conn->close();
?>