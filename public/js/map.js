
// let mapToken = maptoken;
maptilersdk.config.apiKey = mapToken;
// console.log(coordinates)

const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.STREETS,
    center: listing.geometry.coordinates, // [longitude, latitude] for Pune, India
    zoom: 12                    // Recommended to add a zoom level as well
});

const marker = new maptilersdk.Marker({
    color: "#FF385C",
    draggable: false,
    offset: [0, -30]
})
    .setLngLat(listing.geometry.coordinates)
    // Use .setPopup instead of .setPop
    .setPopup(new maptilersdk.Popup({ offset: 25 })
        // Use ${} to insert the variable value
        .setHTML(`<h4>${listing.location}</h4><p>Exact location will be provided on booking!!</p>`))
    .addTo(map);