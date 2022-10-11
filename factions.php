<?php

require_once 'boot.php';

$factions = json_decode(file_get_contents('data/factions.json'), true);

foreach($factions as $f) {
    echo '<label class="check" for="custom_f_' . $f['id'] . '"><input value="' . $f['name'] . '" type="checkbox" id="custom_f_' . $f['id'] . '" name="custom_factions[]" /><img src="' . url('img/factions/ti_' . $f['id'] . '.png') . '" /> ' . $f['name'] . '</label>';
}

?>