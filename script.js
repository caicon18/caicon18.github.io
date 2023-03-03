var apikey = "AIzaSyB8M87kCF3JFQOvLXGqRjcUqnGE9DyJAWs"
var map;

async function handleFormSubmit(event) {
    event.preventDefault(); // prevent the form from submitting normally
    var address = document.getElementById("input-value").value;
    var geocoder = new google.maps.Geocoder();

    /* geocode into coordinates */
    geocoder.geocode({ address: address }, function (results, status) {
        if (status === "OK") {
            var coordinates = results[0].geometry.location;
            console.log(coordinates);

            /* create map */
            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: coordinates.lat(), lng: coordinates.lng() },
                zoom: 15
            });

            /* find grocery stores */
            findPlaces(map, "supermarket");
            findPlaces(map, "subway_station");
            findPlaces(map, "gym");
            findPlaces(map, "movie_theater");
            findPlaces(map, "hindu_temple");
        } else {
            console.log("Geocode was not successful for the following reason: " + status);
        }
    });

}

async function findPlaces(map, type) {
    var finder = new google.maps.places.PlacesService(map)

    var request = {
        location: { lat: map.getCenter().lat(), lng: map.getCenter().lng() },
        // radius: milestometers(10),
        rankBy: google.maps.places.RankBy.DISTANCE,
        type: type
    };

    console.log(request);
    finder.nearbySearch(request, function (places, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            var addresses = [];
            for (var i = 0; i < places.length && i < 5; i++) {
                var place = places[i];
                addresses.push(place.vicinity);
            }


            /* calculate distances */
            calculateDistance(map.getCenter(), addresses, "WALKING").then((distances) => {
                var str = "<br> 5 Nearest " + type + " by walking distance <br>";
                addresses = distances.destinationAddresses;
                console.log(distances.rows[0].elements[0]);

                for (i = 0; i < addresses.length; i++) {
                    var distance = distances.rows[0].elements[i];
    
                    str += places[i].name + ": " + distance.duration.text + "<br>";
                }


                document.getElementById(type).innerHTML = str;

            });


        } else {
            console.log("Search fail: " + status);
        }
    });


}

/*
 * origin is google maps latlng object 
 * destinations is array of addresses
 * travelMode string
 */
async function calculateDistance(origin, destinations, travelMode) {
    const distanceMatrix = new google.maps.DistanceMatrixService();

    return distanceMatrix.getDistanceMatrix({
        origins: [origin],
        destinations: destinations,
        travelMode: travelMode,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
    });

    

}

function milestometers(miles) {
    return miles * 1609.344;
}
