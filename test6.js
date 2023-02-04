
// IMPORT DATA

// -------------------------------------------------------------------------------------------------

// Import json data
import { wardGeojson } from './data/ward.js'
import { prabhagGeojson } from './data/prabhag.js'
import { regionGeojson } from './data/region.js'
import { buildingGeojson } from './data/building.js'

// function to check if imports are successful or not
const testData = () => {
    try {
        if (wardGeojson && prabhagGeojson && regionGeojson && buildingGeojson) {
            console.log("All data loaded successfully");
        } else {
            console.log("Data loading failed!");
        }
    }
    catch (err) {
        console.log("Error occured in loading data! Error: ", err)
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

// display to console
// console.log("After adding random data: ")
// console.log(wardGeojson);
// console.log(prabhagGeojson);
// console.log(regionGeojson);
// console.log(buildingGeojson);


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
    // arrayOfEs.push(e);
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
    // arrayOfFeature.pop();
}



var current_event_object;

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeatureSudo,
        mouseout: resetHighlightSudo,

        click: function (e) {
            if (e.sourceTarget.feature.properties.isHighlighted == false) {
                selectedFeature = e.sourceTarget.feature;
                // console.log(selectedFeature);
                highlightFeature(e);
                e.preventDefault;
                current_event_object = e
                console.log("Selected Feature: ");
                console.log(selectedFeature);
                console.log("Current Event Object: ")
                console.log(current_event_object);
            }
            else {
                resetHighlight(e);
                e.preventDefault;
                selectedFeature = null;
                current_event_object = null;
                console.log("Selected Feature: ");
                console.log(selectedFeature);
                console.log("Current Event Object: ")
                console.log(current_event_object);
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

// create layer hierarchy - set variables
// ward -> prabhag -> region -> building
let l1 = wardGeojson;
let l2 = prabhagGeojson;
let l3 = regionGeojson;
let l4 = buildingGeojson;

var csvData = [
    { layer_no: 1, layer_name: wardGeojson, layer_id: "ward_id", parent_id: null },
    { layer_no: 2, layer_name: prabhagGeojson, layer_id: "prabhag_no", parent_id: "Ward_Id" },
    { layer_no: 3, layer_name: regionGeojson, layer_id: "region", parent_id: "prabhag" },
    { layer_no: 4, layer_name: buildingGeojson, layer_id: "osm_id", parent_id: "name" }
];

// set min and max layer_no values to set limits for drill up and drill down respectively
// you cannot drill up beyond min_layer_no
// you cannot drill down beyond max_layer_no
var min_layer_no = csvData[0].layer_no;
var max_layer_no = csvData[csvData.length - 1].layer_no;


try {
    console.log("Testing if CSV data has been imported successfully: ")
    console.log(csvData);
    console.log("Testing finished!")
}
catch (err) {
    console.log("Error importing CSV! Error details: ", err);
}


// filter function

let layerNumber = csvData[0]['layer_no'];
console.log("Initial Layer No: ", layerNumber);

// array of Es will store the event objects that were involved in drill down
// this array can be thought of as an array storing the state of drill down and drill up
// this array will be used in drilling up
var arrayOfEs = [];

let selectedFeature;

// add initial layer
let addedLayer = L.geoJson(csvData[0].layer_name, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

//================================================================================================
//================================================================================================
//================================================================================================
//================================================================================================
//================================================================================================

function drillDown(e) {
    // Step 1
    // let current_event_object = e // assume this is the selected feature event object
    let current_layer_no = selectedFeature.properties.layer_no;

    // Step 2
    let current_layer = csvData.find(layer => layer.layer_no === current_layer_no).layer_name;
    console.log("Current layer: ");
    console.log(current_layer);

    // Step 3
    let next_layer_no = current_layer_no + 1;

    // Step 4
    let next_layer = csvData.find(layer => layer.layer_no === next_layer_no).layer_name;
    console.log("Next layer: ");
    console.log(next_layer);

    console.log("Next Layer features: ");
    console.log(next_layer.features);

    // Step 5
    let selectedFeatureID = current_event_object.sourceTarget.feature.properties[csvData.find(layer => layer.layer_no === current_layer_no).layer_id];
    console.log("Selected Feature primary key: ");
    console.log(selectedFeatureID);

    let next_layer_parent_id = csvData.find(layer => layer.layer_no === next_layer_no).parent_id;
    console.log("Next Layer foreign key: ");
    console.log(next_layer_parent_id);

    // Step 6
    let selectedChildIDs = next_layer.features.filter(
        (d) => d.properties[next_layer_parent_id] === selectedFeatureID
    );

    // create feature collection from filtered out features
    let selectedChildFeatures = {
        type: "FeatureCollection",
        features: selectedChildIDs,
    };

    console.log("SelectedChildFeatures contains: ");
    console.log(selectedChildFeatures);


    map.fitBounds([current_event_object.sourceTarget._bounds]);
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });
    tiles = new L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
    });

    map.addLayer(tiles);

    L.geoJson(selectedChildFeatures, {
        style: style,
        onEachFeature: onEachFeature,
    }).addTo(map);

    resetHighlight(current_event_object);


    arrayOfEs.push(current_event_object);
    console.log("Current array of Es: ");
    console.log(arrayOfEs);
}


function drillUp(e) {
    // step 1
    // find the last E
    var latest_E = arrayOfEs[arrayOfEs.length - 1];
    console.log("Latest e: ")
    console.log(latest_E);

    // step 2: find the previous layer name based on the current layer number
    let current_layer_no = latest_E.sourceTarget.feature.properties.layer_no + 1
    let current_layer = csvData.find(layer => layer.layer_no === current_layer_no).layer_name;


    // step 3: find the next layer name based on the next layer number
    let next_layer_no = current_layer_no - 1;
    let next_layer = csvData.find(layer => layer.layer_no === next_layer_no).layer_name;

    map.fitBounds(arrayOfEs[arrayOfEs.length - 1].sourceTarget._bounds);

    // step 7: remove the current layer from the map and add the previous layer to the map
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });

    tiles = new L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    map.addLayer(tiles);

    L.geoJson(next_layer, {
        style: style,
        onEachFeature: onEachFeature,
    }).addTo(map);


    selectedFeature = null;
    current_event_object = null;

    arrayOfEs.pop();
    console.log("Current array of Es: ");
    console.log(arrayOfEs);
}



//================================================================================================
//================================================================================================
//================================================================================================
//================================================================================================
//================================================================================================



// add click event listeners to the buttons
document.getElementById('drill-down').addEventListener("click", () => {
    drillDown();
    selectedFeature = null;
    current_event_object = null;
});

document.getElementById('drill-up').addEventListener("click", () => {
    drillUp();
    selectedFeature = null;
    current_event_object = null;
});




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