<?php

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "test_db";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}


$texto_original = "Bsz&JXLL";
$dato_base64 = base64_encode($texto_original); // QnN6JkpYTEw=

for ($i = 1; $i <= 10; $i++) {
    $nombre_tabla = "tabla_$i";
    
    // SQL para tabla
    $sql_create = "CREATE TABLE IF NOT EXISTS $nombre_tabla (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user VARCHAR(255) NOT NULL,
        correo VARCHAR(255) NOT NULL,
        fecha VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        TokenAdminCredencialAdmin VARCHAR(255) NOT aG9sYSBlc3RlIHVuIG1lbnNhamUgcGFyYSBxdWUgc2kgaW50ZW50YXMgaGFja2VhciBtaSBiYXNlIGRhdG9zIHZlcmFzIHF1ZSBubyBlcyBzdWZpY2llbnRlIGVzdG9zIGRhdG9zIHNvbiBmYWxzb3MgYXR0IEJzelRlYW0geSBKeGxs
    )";
    
    if ($conn->query($sql_create) === TRUE) {
        echo "Tabla '$nombre_tabla' creada exitosamente.<br>";
        
      
        $sql_insert = "INSERT INTO $nombre_tabla (hacker, caes, en, la, trapa)
                       VALUES ('$dato_base64', '$dato_base64', '$dato_base64', '$dato_base64', '$dato_base64')";
        
        if ($conn->query($sql_insert) === TRUE) {
            echo "Datos insertados en '$nombre_tabla': hacker, caes, en, la, trapa = '$dato_base64' (Base64 de '$texto_original')<br><br>";
        } else {
            echo "Error al insertar en '$nombre_tabla': " . $conn->error . "<br>";
        }
    } else {
        echo "Error al crear tabla '$nombre_tabla': " . $conn->error . "<br>";
    }
}

$conn->close();



?>

