// layer hierarchy
let layerHierarchy = {
    l1: { parent: null, child: l2 },
    l2: { parent: l1, child: l3 },
    l3: { parent: l2, child: l4 },
    l4: { parent: l3, child: null }
}

// get first key "l1" from hashmap
currentGeojson = Object.keys(layerHierarchy)[0];


function drilldown(e) {
    // ward -> Prabhag -> region -> building clusters
    let nextGeojson = layerHierarchy[currentGeojson.child];
    let selectedJsonIDs;
    if (e.sourceTarget.feature.properties.layerNo == "0") {

        nextGeojson = prabhagGeojson
        let selectedWardID = e.sourceTarget.feature.properties.ward_id;
        selectedJsonIDs = nextGeojson.features.filter(d => (d.properties.Ward_Id == selectedWardID));

    }
    else if (e.sourceTarget.feature.properties.layerNo == "1") {
        nextGeojson = regionGeojson
        let selectedRegionID = e.sourceTarget.feature.properties.ward;
        selectedJsonIDs = nextGeojson.features.filter(d => (d.properties.ward == "ward61"));


    }
    else if (e.sourceTarget.feature.properties.layerNo == "2") {
        nextGeojson = buildingGeojson;
        let buildingClusterID = e.sourceTarget.feature.properties.region;
        selectedJsonIDs = nextGeojson.features.filter(d => (d.properties.name == buildingClusterID));

    }

    //filtered Values
    let selectedJson = {
        "type": "FeatureCollection",
        "features": selectedJsonIDs
    }
    map.fitBounds([e.sourceTarget._bounds]);
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });
    selectedArea = selectedJson;
    currentGeojson = nextGeojson;
    arrayOfEs.push(e);

    tiles = new L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    map.addLayer(tiles);

    L.geoJson(selectedArea, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
    // console.log(arrayOfEs);

}



function drilldown(e) {
    // ward -> Prabhag -> region -> building clusters
    let nextGeojson = layerHierarchy[currentGeojson.child];
    let selectedJsonIDs;
    if (e.sourceTarget.feature.properties.layerNo == "0") {

        nextGeojson = prabhagGeojson
        let selectedWardID = e.sourceTarget.feature.properties.ward_id;
        selectedJsonIDs = nextGeojson.features.filter(d => (d.properties.Ward_Id == selectedWardID));

    }
    else if (e.sourceTarget.feature.properties.layerNo == "1") {
        nextGeojson = regionGeojson
        let selectedRegionID = e.sourceTarget.feature.properties.ward;
        selectedJsonIDs = nextGeojson.features.filter(d => (d.properties.ward == "ward61"));


    }
    else if (e.sourceTarget.feature.properties.layerNo == "2") {
        nextGeojson = buildingGeojson;
        let buildingClusterID = e.sourceTarget.feature.properties.region;
        selectedJsonIDs = nextGeojson.features.filter(d => (d.properties.name == buildingClusterID));

    }

    selec

    //filtered Values
    let selectedJson = {
        "type": "FeatureCollection",
        "features": selectedJsonIDs
    }
    map.fitBounds([e.sourceTarget._bounds]);
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });
    selectedArea = selectedJson;
    currentGeojson = nextGeojson;
    arrayOfEs.push(e);

    tiles = new L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    map.addLayer(tiles);

    L.geoJson(selectedArea, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
    // console.log(arrayOfEs);

}