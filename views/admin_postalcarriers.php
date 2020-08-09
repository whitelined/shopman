<?php
$this->AddTemplate('admin_top');
?>

<div id="postal_carriers_form" class="blankout hide">
</div>

<div id="postal_zones_form" class="blankout hide">
</div>

<div id="postal_zone_mapping_table" class="table-container hide">
<table class="datatable">
<thead id="postal_zone_mapping_thead"></thead>
<tbody id="postal_zone_mapping_tbody"></tbody>
<tfoot id="postal_zone_mapping_tfoot"></tfoot>
</table>
</div>

<div id="postal_carrier_table" class="table-container">
<table class="datatable">
<thead id="postal_carriers_thead"></thead>
<tbody id="postal_carriers_tbody"></tbody>
<tfoot id="postal_carriers_tfoot"></tfoot>
</table>
</div>

<script src="/assets/js/admin_postalcarriers.js" type="module" defer></script>

<?php
$this->AddTemplate('admin_bot');
