// We have 4 layers in a hierarchy:
// 1. Ward -> l1
// 2. Prabhag -> l2
// 3. Region -> l3
// 4. Building -> l4

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

var currentGeojson = Object.keys(layerHierarchy)[0];
var arrayOfEs = [];

let addedLayer = L.geoJson(currentGeojson, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

var arrayOfFeature = []

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


// display to console
console.log("After adding random data: ")
console.log(wardGeojson);
console.log(prabhagGeojson);
console.log(regionGeojson);
console.log(buildingGeojson);


// Hierarchy is defined as follows:
let layerHierarchy = {
    l1: { parent: null, child: l2 },
    l2: { parent: l1, child: l3 },
    l3: { parent: l2, child: l4 },
    l4: { parent: l3, child: null }
}


// // find centroids of all layers except topmost (l1)
// let l2Centroids;
// let l3Centroids;
// let l4Centroids;

// // function to calculate centroid of each feature in a given geojson_layer and return an array
// function findCentroids(geojson_layer) {
//     geojson_layer.features.forEach(featr => {
//         centrd = turf.centroid(featr)
//         let arrayOfFeatureCentroids = []
//         arrayOfFeatureCentroids.push(centrd);
//         return arrayOfFeatureCentroids;
//     });
// }

// l2Centroids = findCentroids(l2);
// l3Centroids = findCentroids(l3);
// l4Centroids = findCentroids(l4);


// current geojson


// Initialize the child layer
var childData = layerHierarchy.parentLayer.child; // Replace with your child layer's GeoJSON data
var childLayer = L.geoJSON(childData, {
    onEachFeature: function (feature, layer) {
        // add styling or other functionality to the child layer
    }
});



// Function that checks if a point is within a polygon
function pointInPolygon(point, polygon) {
    return turf.booleanPointInPolygon(point, polygon);
}

// function to find features of child layer that belong to the selected feature of parent layer;
function filterChildLayer(clickedFeature, childLayer) {
    // features of child layer that belong to the bounds of the selected feature in parent layer
    var filteredFeatures = [];
    for (var i = 0; i < childLayer.features.length; i++) {
        var childFeature = childLayer.features[i];
        var childCentroid = turf.centroid(childFeature);
        if (pointInPolygon(childCentroid, clickedFeature)) {
            filteredFeatures.push(childFeature);
        }
    }
    return filteredFeatures;
}


// topmost parent layer must be set here
// var parentLayer = layerHierarchy.l1;

// Drill down function
function drillDown(e) {
    var parentLayer = e.target; // The parent layer
    var childData = layerHierarchy.parentLayer.child; // The child layer data
    var childLayer = L.geoJSON(childData, {
        style: style,
        onEachFeature: onEachFeature
    });
    var clickedFeature = e.sourceTarget.feature; // The clicked feature in the parent layer
    var filteredChildFeatures = filterChildLayer(clickedFeature, childLayer);
    // Create a new layer and add the filtered features to it
    var filteredChildLayer = L.geoJSON(filteredChildFeatures, {
        style: style,
        onEachFeature: onEachFeature
    }
    );
    // add the filteredChildLayer to the map
    filteredChildLayer.addTo(map);
    // zoom the map to the bounds of the filteredChildLayer
    map.fitBounds(filteredChildLayer.getBounds());
}


