<?php
    header("Cache-Control: no-cache, must-revalidate");
    if(isset($_GET['bus'])){
        $json = file_get_contents("http://localhost:8888?bus=".$_GET['bus']);
    } elseif(isset($_GET['trip_id'])){
        $json = file_get_contents("http://localhost:8889?trip_id=".$_GET['trip_id']);
    } elseif(isset($_GET['time_id'])){
        $json = file_get_contents("http://localhost:8890?time_id=".$_GET['time_id']);
    } else {
        $json = file_get_contents("http://localhost:8888");
    }
    echo $json;
?>
