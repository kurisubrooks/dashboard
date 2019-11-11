/* eslint-disable no-undef */
var sound_emergency = new Audio("./audio/ews.mp3");
var jp_dotw = ["日", "月", "火", "水", "木", "金", "土"];
var storage = { fires: [] };

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
        url: "https://api.kurisubrooks.com/api/weather?location=marayong",
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
        url: "https://api.kurisubrooks.com/api/fire?filter=emergency",
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

// Start
$(function() {
    // Data Providers
    clock();
    setInterval(clock, 200);

    fire();
    setInterval(fire, 1 * 60 * 1000);

    weather();
    setInterval(weather, 5 * 60 * 1000);
});
