// Create the tile layer that will be the background of our map.

var Stamen_TerrainBackground = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 18,
	ext: 'png'
});
var streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
// Create the map object with options.
var map = L.map("map", {
    center: [41.9028, -12.4964],
    zoom: 2,
    layers: [Stamen_TerrainBackground]
});
streetmap.addTo(map);

let plates = new L.LayerGroup();

let earthquakes = new L.LayerGroup();
let base={
    'Terrain': Stamen_TerrainBackground,
    'Street': streetmap
}
let toppings = {
    'Earthquakes': earthquakes,
    'Tectonic Plates': plates
}
L.control.layers(base, toppings).addTo(map)

d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson').then(function (data) {
    function styleInfo(feature) {
        return {
            fillColor: getColor(feature.geometry.coordinates[2]),
            radius: getRadius(feature.properties.mag),
            weight: 0.5,
            fillOpacity: 0.5
        }
    }
    function getColor(depth) {
        if (depth > 90) {
            return "#660000"
        }
        else if (depth > 70) {
            return "#990000"
        }
        else if (depth > 50) {
            return "#CC0000"
        }
        else if (depth > 30) {
            return "#FF8000"
        }
        else if (depth > 10) {
            return "#FFFF00"
        }
        else { return "#98ee00" }
    }
    function getRadius(magnitude) {
        if (magnitude === 0) {
            //pass if zero
            return 1;
        }
        return magnitude * 4;
    }
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function (feature, layer) {
            layer.bindPopup("Magnitude: "
                + feature.properties.mag
                + "<br>Depth: "
                + feature.geometry.coordinates[2]
                + "<br>Location: "
                + feature.properties.place);
        }

    }).addTo(earthquakes);

    earthquakes.addTo(map);

    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend'),
            depth = [0, 10, 30, 50, 70, 90],
            colors = ["#98ee00", "#FFFF00", "#FF8000", "#CC0000", "#990000", "#660000"];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < depth.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i> ' +
                depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(map);
    d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json').then(function(data){
        L.geoJson(data).addTo(plates);
        plates.addTo(map);
    })
})