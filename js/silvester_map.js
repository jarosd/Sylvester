var map = L.map('map');

var baseLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: Open Street Map',
  subdomains: 'abc',
  minZoom: 1,
}).addTo(map);

map.setView({
  lat: 0,
  lng: 0
}, 2);