<?php
/*
function checkFile($filename) {
  return isset($filename) && file_exists($filename);
}

checkFile($_POST["filename"]);
*/

  if (isset($_POST["filename"])) {
    chdir("images");
    
    if (file_exists($_POST["filename"])) {
      // echo "File found.";
      echo $_POST["filename"];
    } else {
      // echo "File not found.";
      echo "XX.png";
    }
  } else {
    // echo "No filename!";
    echo "XX.png";
  }
?>