<?php
/**
 * SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI (SIPADLO)
 * Logout Script
 * File: logout.php
 */
session_start();
session_unset();
session_destroy();
header("Location: index.php");
exit;
?>
