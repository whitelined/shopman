<?php
$this->AddTemplate('admin_top');
?>

<div id="country_form" class="blankout">
</div>

<div id="country_table">
<table class="datatable">
<thead id="admin_countries_thead"></thead>
<tbody id="admin_countries_tbody"></tbody>
<tfoot id="admin_countries_tfoot"></tfoot>
</table>
</div>

<script src="/assets/js/admin_countries.js" type="module" defer></script>

<?php
$this->AddTemplate('admin_bottom');
