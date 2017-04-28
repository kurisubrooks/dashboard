/* eslint-disable no-undef */
var socket = io("http://shake.kurisubrooks.com:3390");
var sound_alarm = new Audio("./audio/alarm.mp3");
var sound_alert = new Audio("./audio/nhk.mp3");
var sound_emergency = new Audio("./audio/ews.mp3");
var jp_dotw = ["日", "月", "火", "水", "木", "金", "土"];
var storage = { fires: [] };
var map, marker;

// Define Epicenter Icon for Map
var epicenter_icon = L.icon({
    iconUrl: "https://i.imgur.com/jFs4ZRf.png",
    iconSize: [28, 28],
    iconAnchor: [14, 14]
});

// Initialise Leaflet
function initMap() {
    map = L.map("map").setView([32.5, 129.2], 6);
    marker = L.marker([32.5, 129.2], { icon: epicenter_icon }).addTo(map);

    L.gridLayer.googleMutant({
        type: "roadmap",
        styles: [
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [
                    { "saturation": 36 },
                    { "color": "#2A2A2A" },
                    { "lightness": 40 }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [
                    { "visibility": "on" },
                    { "color": "#000000" },
                    { "lightness": 16 }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.icon",
                "stylers": [
                    { "visibility": "on" }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.fill",
                "stylers": [
                    { "color": "#000000" },
                    { "lightness": 20 }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [
                    { "visibility": "off" },
                    { "color": "#2A2A2A" },
                    { "lightness": 17 },
                    { "weight": 1.2 }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [
                    { "color": "#000000" },
                    { "lightness": 20 }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    { "color": "#000000" },
                    { "lightness": 21 }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [
                    { "color": "#000000" },
                    { "lightness": 17 }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                    { "color": "#000000" },
                    { "lightness": 29 },
                    { "weight": 0.2 }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                    { "color": "#999999" },
                    { "lightness": 18 }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [
                    { "color": "#999999" },
                    { "lightness": 16 }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [
                    { "color": "#000000" },
                    { "lightness": 19 }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    { "color": "#000000" },
                    { "lightness": 15 }
                ]
            }
        ]
    }).addTo(map);
}

// Clock
function clock() {
    var time = moment().format("h:mm:ss a");

    if ($("#clock #time").text() !== time) {
        $("#clock #day").text(moment().format("dddd"));
        $("#clock #jpd").text(jp_dotw[Number(moment().format("d"))]);
        $("#clock #date").text(moment().format("D MMMM YYYY"));
        $("#clock #time").text(time);
    }
}

// Weather
function weather() {
    console.log("GET: Weather");

    function rads(index) {
        if (index === 0) {
            return "None";
        } else if (index === 1 || index === 2) {
            return "Low";
        } else if (index >= 3 && index <= 5) {
            return "Moderate";
        } else if (index === 6 || index === 7) {
            return "High";
        } else if (index >= 8 && index <= 10) {
            return "Very High";
        } else if (index >= 11) {
            return "Extreme";
        } else {
            return "Unknown";
        }
    }

    $.ajax({
        url: "https://api.kurisubrooks.com/api/weather",
        dataType: "json",
        success: function(data) {
            console.log("OK: Weather");

            $("#weather #icon").attr("src", data.weather.image);
            $("#weather #condition").text(data.weather.condition ? data.weather.condition : "Unknown");
            $("#weather #humidity").text(data.weather.humidity);
            $("#weather #UV").text(data.weather.UV + ", " + rads(data.weather.UV));
            $("#weather #temperature").text(Math.round(data.weather.temperature));

            var all = $("<ol></ol>");
            var count = 0;

            data.forecast.forEach(function(value) {
                var viewport = $("body").width();

                // < 720p
                if (viewport >= 1060 && viewport < 1730) {
                    if (count >= 6) return;
                // 900p - 1080p
                } else if (viewport >= 1730 && viewport < 2065) {
                    if (count >= 8) return;
                // 1440p - 4K
                } else if (viewport >= 2065) {
                    if (count >= 10) return;
                } else if (count >= 6) {
                    return;
                }

                var container = $(`<li></li>`);
                var temp = $(`<div id="temp"></div>`);
                var max = $(`<div id="max"></div>`).text(value.high + "°");
                var min = $(`<div id="min"></div>`).text(value.low + "°");
                var icon = $(`<div id="icon">`);
                var image = $(`<img height="50px" />`).attr("title", value.condition).attr("src", value.image);
                var details = $(`<div id="details"></div>`);
                var date = $(`<div id="date"></div>`).text(`${moment.unix(value.date.time).format("ddd, Do MMM")}`);
                var condition = $(`<div id="condition"></div>`).text(`${value.condition}`);

                temp.append(max);
                temp.append(min);
                container.append(temp);

                icon.append(image);
                container.append(icon);

                details.append(date);
                details.append(condition);
                container.append(details);

                all.append(container);

                ++count;

                $("#weather #forecast").html(all);
            });
        },
        error: function(data) {
            console.error("ERR: Weather");
            console.error(data);
        }
    });
}

// Fires (RFS)
function fire() {
    console.log("GET: Fire");

    var colors = {
        "0": "#FFFFFF",
        "1": "#58ACFA",
        "2": "#F7D358",
        "3": "#FA5858"
    };

    $.ajax({
        url: "https://api.kurisubrooks.com/api/fire",
        dataType: "json",
        success: function(data) {
            console.log("OK: Fire");

            var count = 0;
            var mfcontainer = $(`<div class="container"></div>`);
            var container = $(`<div class="container"></div>`);

            data.fires.forEach(function(value) {
                var box = $(`<div class="box"></div>`);
                var sidebar = $(`<div class="sidebar"></div>`);
                var icon = $(`<div class="icon"></div>`);
                var fire = $(`<i class="material-icons">whatshot</i>`);
                var content = $(`<div class="content"></div>`);
                var place = $(`<h2 id="place"></h2>`);
                var info = $(`<div id="status"></div>`);
                var type = $(`<span class="value"></span>`);
                var status = $(`<span class="value"></span>`);

                fire.css("color", colors[value.level]);
                place.text(value.title);
                type.text(value.type);
                status.text(value.status);

                if (count > 2) {
                    console.info(true);
                    // sidebar.width("100px")
                    content.css("background", "inherit");
                }

                icon.append(fire);
                sidebar.append(icon);
                box.append(sidebar);

                info.append(type);
                info.append(status);
                content.append(place);
                content.append(info);
                box.append(content);

                if (value.level > 1) {
                    mfcontainer.append(box);

                    if (storage.fires.indexOf(value.guid) === -1) {
                        sound_emergency.play();
                        storage.fires.push(value.guid);
                    }
                } else {
                    ++count;
                    container.append(box);
                }
            });

            $("#majorfires").html(mfcontainer);
            $("#fires").html(container);
        },
        error: function(data) {
            console.error("ERR: Fire");
            console.error(data);
        }
    });
}

function eew(data) {
    data = typeof data !== "object" ? JSON.parse(data) : data;

    $("#text #seismic").text(data.details.seismic.en);
    $("#text #magnitude").text(data.details.magnitude);
    $("#text #depth").text(data.details.geography.depth + "km");
    $("#text #epicenter").text(data.details.epicenter.en);

    $(".overlay").show();
    $(".sidebar").css("background", "#C62E2E");
    $("html").css("background", "#DA3838");

    if (data.alarm) {
        sound_alarm.play();
    } else {
        sound_alert.play();
    }

    function reset(time) {
        setTimeout(function() {
            $(".sidebar").css("background", "#2A2A2A");
            $("html").css("background", "#333333");
            $(".overlay").fadeOut("fast");
        }, time ? time : 50);
    }

    if (data.situation !== 0) {
        if (data.situation === 1) {
            reset(60 * 1000);
        } else if (data.situation === 2) {
            reset();
        }
    }

    map.setView([data.details.geography.lat, data.details.geography.long], 6);
    marker.setLatLng([data.details.geography.lat, data.details.geography.long]).update();
    map.invalidateSize();
}

socket.on("connect", function() {
    socket.emit("auth", { version: 2.1 });
});

socket.on("disconnect", function() {
    console.error("DC: Socket");
});

socket.on("auth", function(data) {
    if (data.ok) {
        console.log("OK: Socket");
    } else {
        console.log("ERR: Socket - bad auth");
    }
});

socket.on("quake.eew", function(data) {
    eew(data);
});

// Start
$(function() {
    initMap();

    // Data Providers
    clock();
    setInterval(clock, 200);

    fire();
    setInterval(fire, 1 * 60 * 1000);

    weather();
    setInterval(weather, 5 * 60 * 1000);

    // Shake Test
    /* setTimeout(function() {
        eew({"id":20161228164030,"drill":false,"alarm":true,"situation":0,"revision":4,"details":{"announced":"2016/12/28 16:41:31","occurred":"2016/12/28 16:40:14","magnitude":3.8,"epicenter":{"id":0,"en":"Sanpachikamikita, Aomori Prefecture","ja":"三八上北地方青森県"},"seismic":{"en":"2","ja":"2"},"geography":{"lat":40.8,"long":141.2,"depth":10,"offshore":false}}})
    }, 4000);

    setTimeout(function() {
        eew({"id":20161228164030,"drill":false,"alarm":false,"situation":1,"revision":4,"details":{"announced":"2016/12/28 16:41:31","occurred":"2016/12/28 16:40:14","magnitude":3.8,"epicenter":{"id":189,"en":"Offshore South Eastern Nemuro Peninsula","ja":"根室半島南東沖"},"seismic":{"en":"2","ja":"2"},"geography":{"lat":43,"long":146.6,"depth":10,"offshore":true}}})
    }, 6800); */
});
