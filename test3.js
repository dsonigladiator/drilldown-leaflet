// -------------------------------------------------------------------------------------------------

// IMPORT DATA

// -------------------------------------------------------------------------------------------------

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

// // display to console
// console.log(wardGeojson);
// console.log(prabhagGeojson);
// console.log(regionGeojson);
// console.log(buildingGeojson);

// console.log(typeof (wardGeojson));

// test whether imports were successful or not
testData();

// =================================================================================================
// =================================================================================================

// -------------------------------------------------------------------------------------------------

// DATA PREPROCESSING

// -------------------------------------------------------------------------------------------------

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

// =================================================================================================
// =================================================================================================

// -------------------------------------------------------------------------------------------------

// LEAFLET MAP INITIALIZATION

// -------------------------------------------------------------------------------------------------

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

// =================================================================================================
// =================================================================================================

// -------------------------------------------------------------------------------------------------

// HELPER FUNCTIONS

// -------------------------------------------------------------------------------------------------

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

var currentGeojson = wardGeojson;
var arrayOfEs = [];

let addedLayer = L.geoJson(wardGeojson, {
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

// control highlighting of features on click and unclick
// Create a variable to store the currently highlighted feature
var highlightedFeature = null;

// // Use the onEachFeature function to bind a click event to each feature
// map.eachLayer(function (feature) {
//     feature.on('click', function (e) {
//         // If a feature is already highlighted, remove the highlight
//         if (highlightedFeature) {
//             highlightedFeature.setStyle({ color: 'blue', weight: 1 });
//         }

//         // If the user clicks the same feature again, un-highlight it
//         if (highlightedFeature === e.target) {
//             highlightedFeature = null;
//             return;
//         }

//         // Highlight the clicked feature
//         e.target.setStyle({ color: 'red', weight: 3 });
//         highlightedFeature = e.target;
//     });
// });

// function to zoom into a feature by getting its bounds
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}



// =================================================================================================
// =================================================================================================

// -------------------------------------------------------------------------------------------------

// MAIN PART OF THE CODE STARTS NOW

// -------------------------------------------------------------------------------------------------

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



// // add the first geoJSON layer and store in a variable
// let addedLayer = L.geoJson(wardGeoJson, {
//     style: style,
//     onEachFeature: onEachFeature,
// }).addTo(map);


// create layer hierarchy - set variables
let l1 = L.geoJSON(wardGeojson);
let l2 = L.geoJSON(prabhagGeojson);
let l3 = L.geoJSON(regionGeojson);
let l4 = L.geoJSON(buildingGeojson);



// initialize the hierarchy hashmap
// this hashmap stores the hierarchy relations that will be used for drill up and drill down
var layerHierarchy = {
    l1: { parent: null, child: l2 },
    l2: { parent: l1, child: l3 },
    l3: { parent: l2, child: l4 },
    l4: { parent: l3, child: null }
};

function testLayerHierarchy() {
    console.log("Testing layers in layerHierarchy hashmap...");
    console.log(l1);
    console.log(l2);
    console.log(l3);
    console.log(l4);
    console.log("Testing finished");
}

testLayerHierarchy();



// Next, create an empty object to store the centroid arrays
var centroids = {};

// Then, loop through the layers and compute the centroids for each layer
Object.keys(layerHierarchy).forEach(function (layer) {
    if (layer !== 'l1') {
        centroids[layer] = layer.features.map(function (feature) {
            return turf.centroid(feature);
        });
    }
});


// Now, create an empty object to store the parent-child relationship hashmaps
var relationships = {};

// Then, loop through the layers and create the relationship hashmaps
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


// Store the relationship hashmaps in the browser local storage for further use
localStorage.setItem('relationships', JSON.stringify(relationships));

// Create the drilldown function
function drillDown(parentFeature) {
    var parentChild = parentFeature.layer.name + '-' + layerHierarchy[parentFeature.layer.name].child.name;
    var children = relationships[parentChild][parentFeature.id];
    if (children.length > 0) {
        // Remove the parent feature from the map and add the children features
        parentFeature.layer.removeLayer(parentFeature);
        layerHierarchy[parentFeature.layer.name].child.addData(children);
    } else {
        alert("Further drill down is not possible");
    }
}



// add click events to the map
// map.on('click', highlightFeature);

// add click event listeners to the buttons
document.getElementById("drill-down").addEventListener("click", drillDown);
document.getElementById("drill-up").addEventListener("click", drillUp);





// add and update info on map
//info update
var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML =
        "<h4>Total Waste</h4>" +
        (props
            ? "<b>" +
            props.totalWaste +
            "</b> tonns<br />" +
            props.ward_id +
            " (" +
            props.ward_name_ +
            ") " +
            props.region +
            " "
            : "Hover over a state");
};

info.addTo(map);


// add a legend to the map
//legend
var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "info legend"),
        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' +
            getColor(grades[i] + 1) +
            '"></i> ' +
            grades[i] +
            (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
};
legend.addTo(map);