let map = null;
let origin = null;
let destination = null;
let originMarker = null;

let interval = null;

let alarm_id = null;

const mediumIntervals = {
    'road': 120000,
    'rail': 60000,
    'flight': 6000,
}

const mediumCap = {
    'road': 'ROAD',
    'rail': 'RAIL',
    'flight': 'FLIGHT',
}

const setAlarmPanel = document.getElementById("set-alarm");
const startAlarmPanel = document.getElementById("start-alarm");
const playAlarmPanel = document.getElementById("play-alarm");
const destinationDisplay1 = document.getElementById("set-destination1");
const destinationDisplay2 = document.getElementById("set-destination2");
const distanceDisplay = document.getElementById("set-distance");

const audio = document.getElementById("audio");

audio.play().catch(e => {
    window.addEventListener('click', () => {
        audio.play();
        audio.pause();
    }, { once: true })
})

function stopAlarm() {
    audio.pause();
    const stopAlarmBtn = document.getElementById("stop-alarm-btn");
    stopAlarmBtn.style.display = "none";
}

async function setUserLocation() {

    const success = (position) => {
        origin = {
            "lat": position.coords.latitude,
            "lng": position.coords.longitude
        }
    };

    const error = () => {
        const block = document.getElementById("panel-blocker-location");
        block.style.display = "flex";
    }

    navigator.geolocation.getCurrentPosition(success, error);

};

setUserLocation();

function initGoogle() {
    const destInput = document.getElementById("destinationInput");

    const options = {
        componentRestrictions: { country: "in" },
        fields: ["geometry", "name"],
        strictBounds: false,
    };

    const autocomplete = new google.maps.places.Autocomplete(destInput, options);

    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        destination = {
            "lat": place.geometry.location.lat(),
            "lng": place.geometry.location.lng()
        }

        initMap(origin, destination);
    });
};

function findDistance(lat1, lat2, lon1, lon2) {
    let R = 6371e3;

    let lat1radians = toRadians(lat1);
    let lat2radians = toRadians(lat2);

    let latRadians = toRadians(lat2 - lat1);
    let lonRadians = toRadians(lon2 - lon1);

    let a = Math.sin(latRadians / 2) * Math.sin(latRadians / 2) +
        Math.cos(lat1radians) * Math.cos(lat2radians) *
        Math.sin(lonRadians / 2) * Math.sin(lonRadians / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    let d = R * c;

    return d;
}

function toRadians(val) {
    let PI = 3.1415926535;
    return val / 180.0 * PI;
}

async function initMap(origin, destination) {
    const { Map } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("canvas"), {
        center: destination,
        zoom: 8,
    });

    originMarker = new google.maps.Marker({
        map: map,
        position: origin,
        title: "You"
    });

    const destinationMarker = new google.maps.Marker({
        map: map,
        position: destination,
        title: "Destination"
    });
}

function startAlarm() {
    const place = document.getElementById("destinationInput").value;
    const medium = document.querySelector('input[name="medium"]:checked')?.value;
    if (place == ""){
        alert("Select a destinatoin");
        return;
    }
    if (medium === undefined) {
        alert("Select a mode of travel");
        return;
    }
    
    setAlarmPanel.style.display = "none";
    startAlarmPanel.style.display = "block";

    destinationDisplay1.innerText = `${place.slice(0, 20)}...`;
    destinationDisplay2.innerText = `${place.slice(0, 20)}...`;

    $.ajax({
        url: "",
        type: "post",
        data: {
            "origin": origin,
            "destination": destination,
            "place": place,
            "medium": mediumCap[medium]
        },
        success: function (response) {
            alarm_id = response['id'];
            navigator.geolocation.getCurrentPosition(success, error);
        },
        error: function (response) {
            console.log(response);
            return
        }
    })

    const success = (position) => {
        let newPosition = {
            "lat": position.coords.latitude,
            "lng": position.coords.longitude
        }
        originMarker = new google.maps.Marker({
            map: map,
            position: newPosition,
            title: "You"
        });

        let crowDistance = findDistance(newPosition.lat, destination.lat, newPosition.lng, destination.lng);
        let distanceInKMs = crowDistance / 1000;
        distanceDisplay.innerText = `${distanceInKMs.toFixed(2)} KMs`;

        if (crowDistance <= 6000) {
            startAlarmPanel.style.display = "none";
            playAlarmPanel.style.display = "block";

            audio.play();

            $.ajax({
                url: "",
                type: "patch",
                data: {
                    "id": alarm_id,
                },
                error: function (response) {
                    console.log(response);
                }
            })

            return;
        }

        interval = setInterval(checkDistance, mediumIntervals[medium]);
    }

    const error = () => {
        alert("Please enable your Location");
    }
}

function checkDistance() {

    const success = (position) => {
        let newPosition = {
            "lat": position.coords.latitude,
            "lng": position.coords.longitude
        }
        originMarker = new google.maps.Marker({
            map: map,
            position: newPosition,
            title: "You"
        });

        let crowDistance = findDistance(newPosition.lat, destination.lat, newPosition.lng, destination.lng);
        let distanceInKMs = crowDistance / 1000;
        distanceDisplay.innerText = `${distanceInKMs.toFixed(2)} KMs`;

        if (crowDistance <= 6000) {
            clearInterval(interval);

            startAlarmPanel.style.display = "none";
            playAlarmPanel.style.display = "block";

            audio.play();

            $.ajax({
                url: "",
                type: "patch",
                data: {
                    "id": alarm_id,
                },
                error: function (response) {
                    console.log(response);
                }
            })
        }
    };

    const error = () => {
        alert("Please enable your Location");
    }

    navigator.geolocation.getCurrentPosition(success, error);

}