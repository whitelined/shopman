<?php
$this->AddTemplate('admin_top');
?>

<div id="postal_carriers_form" class="blankout">
</div>

<div id="postal_zones_form" class="blankout">
</div>

<div id="postal_zone_mapping_table" class="blankout">
<table class="datatable">
<thead id="admin_postal_zone_mapping_thead"></thead>
<tbody id="admin_postal_zone_mapping_tbody"></tbody>
<tfoot id="admin_postal_zone_mapping_tfoot"></tfoot>
</table>
</div>

<table class="datatable">
<thead id="admin_postal_carriers_thead"></thead>
<tbody id="admin_postal_carriers_tbody"></tbody>
<tfoot id="admin_postal_carriers_tfoot"></tfoot>
</table>

<script src="/assets/js/admin_postalcarriers.js" type="module" defer></script>

<?php
$this->AddTemplate('admin_bottom');
