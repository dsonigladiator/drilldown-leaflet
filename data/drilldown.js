function drilldown(e) {
    // ward -> Prabhag -> region -> building clusters
    let currentGeojson;
    let nextGeojson;
    let addedLayer;



    // console.log(e.sourceTarget.feature.properties.layerNo);
    if (e.sourceTarget.feature.properties.layerNo == "0") {
        nextGeojson = prabhagGeojson;
        let selectedWardID = e.sourceTarget.feature.properties.ward_id;
        let selectedPrabhagIDs = nextGeojson.features.filter(
            (d) => d.properties.Ward_Id == selectedWardID
        );
        let selectedPrabhags = {
            type: "FeatureCollection",
            features: selectedPrabhagIDs,
        };
        map.fitBounds([e.sourceTarget._bounds]);
        map.removeLayer(addedLayer);
        selectedArea = selectedPrabhags;
    }

    //quick fix needed
    else if (e.sourceTarget.feature.properties.layerNo == "1") {
        nextGeojson = regionGeojson;
        let selectedRegionID = e.sourceTarget.feature.properties.ward;
        let selectedRegionIDs = nextGeojson.features.filter(
            (d) => d.properties.ward == "ward61"
        );
        let selectedRegions = {
            type: "FeatureCollection",
            features: selectedRegionIDs,
        };
        map.fitBounds([e.sourceTarget._bounds]);
        // map.removeLayer(addedLayer2);
        map.eachLayer(function (layer) {
            map.removeLayer(layer);
        });
        selectedArea = selectedRegions;
    } else if (e.sourceTarget.feature.properties.layerNo == "2") {
        nextGeojson = buildingGeojson;
        let buildingClusterID = e.sourceTarget.feature.properties.region;
        let selectedRegionIDs = nextGeojson.features.filter(
            (d) => d.properties.name == buildingClusterID
        );
        let selectedRegions = {
            type: "FeatureCollection",
            features: selectedRegionIDs,
        };
        map.fitBounds([e.sourceTarget._bounds]);
        // map.removeLayer(addedLayer2);
        map.eachLayer(function (layer) {
            map.removeLayer(layer);
        });
        selectedArea = selectedRegions;
    }

    tiles = new L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
    });

    map.addLayer(tiles);

    L.geoJson(selectedArea, {
        style: style,
        onEachFeature: onEachFeature,
    }).addTo(map);
}