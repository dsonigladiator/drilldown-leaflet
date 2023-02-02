// Concept:
// We want to create a generic drill down functionality for a leaflet map using four geoJSON objects (l1, l2, l3, l4) and a layerHierarchy hashmap that shows the hierarchy of layers. The first step is to compute the centroids of each layer except the first one (l1) using the turf.centroid() function and store them in corresponding arrays. Then, create an empty hashmap for each parent-child layer pair that will store the relations between each feature in the parent layer and its corresponding children in the child layer. Use the turf.BooleanPointInPolygon() function to check whether the centroid of each child feature lies within the parent feature. Once the computation is complete, store all the relationship hashmaps in the browser local storage for further use. Finally, create a drilldown function that allows users to click on a feature in the parent layer and search for its corresponding children in the relationship hashmap, and display them on the map. If a selected parent feature is not present in a relation hashmap, give a js alert to the user saying further drill down is not possible.


// Import json data
import { wardGeojson } from './data/ward.js'
import { prabhagGeojson } from './data/prabhag.js'
import { regionGeojson } from './data/region.js'
import { buildingGeojson } from './data/building.js'

// function to check if imports are successful or not
const testData = () => {
    if (wardGeojson && prabhagGeojson && regionGeojson && buildingGeojson) {
        console.log("All data loaded successfully");
    } else {
        console.log("Data loading failed!");
    }
}

// display to console
console.log(wardGeojson);
console.log(prabhagGeojson);
console.log(regionGeojson);
console.log(buildingGeojson);

// console.log(typeof (wardGeojson));

// test whether imports were successful or not
testData();


// helper function to generate random data
function addRandomData(geojson_layer) {
    // some initial manipulations:
    geojson_layer.features.forEach(function (arrayItem) {
        arrayItem.properties.wetWaste = parseInt(Math.random() * 50 + 1);
        arrayItem.properties.solidWaste = parseInt(Math.random() * 300 + 1);
        arrayItem.properties.totalWaste =
            arrayItem.properties.wetWaste + arrayItem.properties.solidWaste;
        arrayItem.properties.isHighlighted = false;
    })
};

addRandomData(wardGeojson);
addRandomData(prabhagGeojson);
addRandomData(regionGeojson);
addRandomData(buildingGeojson);


// To create a layer hierarchy we first set the corresponding variables
let l1 = L.geoJSON(wardGeojson);
let l2 = L.geoJSON(prabhagGeojson);
let l3 = L.geoJSON(regionGeojson);
let l4 = L.geoJSON(buildingGeojson);

// create leaflet map
let mapOptions = {
    center: [19.07609, 72.877426],
    zoom: 11,
};

// create base map and disable double click zoom
let map = L.map("map", mapOptions);
map.doubleClickZoom.disable();


// define OSM layer to be added on map
let tiles = new L.tileLayer(
    "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
    }
);

map.addLayer(tiles);


// Color each feature based on values
function getColor(d) {
    return d > 1000
        ? "#800026"
        : d > 500
            ? "#BD0026"
            : d > 200
                ? "#E31A1C"
                : d > 100
                    ? "#FC4E2A"
                    : d > 50
                        ? "#FD8D3C"
                        : d > 20
                            ? "#FEB24C"
                            : d > 10
                                ? "#FED976"
                                : "#FFEDA0";
}



// set initial style of each feature
function style(feature) {
    return {
        fillColor: getColor(feature.properties.totalWaste),
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 1,
    };
}

function highlightFeatureSudo(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 4,
        color: '#f9fafc',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function highlightFeature(e) {
    var layer = e.target;
    arrayOfEs.push(e);
    layer.setStyle({
        weight: 7,
        color: '#f9fafc',
        dashArray: '',
        fillOpacity: 0.7
    });
    e.sourceTarget.feature.properties.isHighlighted = true;

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}


function resetHighlightSudo(e) {
    if (e.sourceTarget.feature.properties.isHighlighted == false) {
        addedLayer.resetStyle(e.target);
    }

}

function resetHighlight(e) {
    addedLayer.resetStyle(e.target);
    info.update();
    e.sourceTarget.feature.properties.isHighlighted = false;
    arrayOfFeature.pop();
}

let addedLayer = L.geoJson(wardGeojson, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);


// make sure the map is clean and no old layer is still there on the map
map.eachLayer(function (layer) {
    map.removeLayer(layer);
});


// add tile layer again
tiles = new L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
});

map.addLayer(tiles);

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeatureSudo,
        mouseout: resetHighlightSudo,

        click: function (e) {
            if (e.sourceTarget.feature.properties.isHighlighted == false) {
                highlightFeature(e);
                e.preventDefault;
            }
            else {
                resetHighlight(e);
                e.preventDefault;
            }
            // console.log(arrayOfFeature)
        }
    });
}





// Hierarchy is defined as follows:
let layerHierarchy = {
    l1: { parent: null, child: l2 },
    l2: { parent: l1, child: l3 },
    l3: { parent: l2, child: l4 },
    l4: { parent: l3, child: null }
}

// Create an empty object to store the centroid arrays of each layer
var centroids = {};


// Compute centroids of each layer in layer hierarchy and store them in arrays inside centroids object:
Object.keys(layerHierarchy).forEach(function (layer) {
    if (layer !== 'l1') {
        centroids[layer] = layer.features.map(function (feature) {
            return turf.centroid(feature);
        });
    }
});

console.log(centroids);

// Create an empty object to store the parent-child relationship hashmaps for each parent-child layer combination
var relationships = {};

// Now we create relationship hashmaps
Object.keys(layerHierarchy).forEach(function (layer) {
    var parent = layerHierarchy[layer].parent;
    var child = layerHierarchy[layer].child;
    if (parent && child) {
        relationships[parent.name + '-' + child.name] = {};
        parent.features.forEach(function (feature) {
            relationships[parent.name + '-' + child.name][feature.id] = [];
            centroids[child.name].forEach(function (centroid) {
                if (turf.booleanPointInPolygon(centroid, feature)) {
                    relationships[parent.name + '-' + child.name][feature.id].push(centroid);
                }
            });
        });
    }
});

console.log(relationships);



