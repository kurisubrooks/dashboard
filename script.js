// Config
let config = {
    overscan: true,
    apikey: "fe8093fa020affe377f1f2cca0c60460",
    location: "-33.75,150.7",
    playsound: true
}

// Init
let getUrlParameter = function getUrlParameter(sParam) {
    let sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split("&"), sParameterName

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split("=")

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1]
        }
    }
}

if (getUrlParameter("overscan") === "false") config.overscan = false
if (getUrlParameter("key")) config.apikey = getUrlParameter("key")
if (getUrlParameter("location")) config.location = getUrlParameter("location")
if (getUrlParameter("sound") === "false") config.playsound = false

setInterval(function() {
    if (!navigator.onLine) {
        $(".sidebar").css("background", "#FDD835")
    } else if (navigator.onLine) {
        $(".sidebar").css("background", "#222")
    }
}, 200)

$(function() {
    console.log("CONFIG: ", config)

    if (config.overscan) $("body").css("padding", "6px 17px")
})

// Clock
$(function() {
    let clock = function() {
        $("#time").text(moment().format("h:mm:ss a"))
    }

    setInterval(clock, 100)
    clock()
})

// Weather
$(function() {
    let url = "https://api.forecast.io/forecast/" + config.apikey + "/" + config.location + "?units=si"

    let weather = function() {
        console.log("GET: Weather - " + moment().format("DD/MM/YY h:mm:ss a"))
        $.ajax({
            url: url,
            dataType: "jsonp",
            success: function(data) {
                console.log("OK: Weather")

                // Current
                $("#icon").attr("src", "./icons/" + data.currently.icon + ".png")
                $("#temperature").text(Math.round(data.currently.temperature * 10) / 10)
                $("#condition").text(data.currently.summary)
                $("#humidity").text((Math.round(data.currently.humidity * 100)) + "%")
                $("#rainchance").text((Math.round((data.currently.precipProbability * 100) / 5) * 5) + "%")
                $("#checked").text(moment().format("h:mm a"))

                // Forecast

                let all = $("<div></div>")

                data.daily.data.forEach(function(v) {
                    console.log(v)

                    let container = $("<div class='item'></div>")
                    let day = $("<p></p>").text(moment.unix(v.time).format("ddd"))
                    let icon = $("<img height='48px' />").attr("src", "./icons/" + v.icon + ".png")
                    let max = $("<p id='max'></p>").text(Math.round(v.temperatureMin))
                    let min = $("<p id='min'></p>").text(Math.round(v.temperatureMax))

                    container.append(day)
                    container.append(icon)
                    container.append(max)
                    container.append(min)
                    all.append(container)
                })

                $("#forecast").html(all)
            },
            error: function(data) {
                console.error("ERR: Weather")
                console.error(data)
            }
        })
    }

    setInterval(weather, 300000)
    weather()
})

// Shake
let socket = io("http://shake.kurisubrooks.com:3390")
let sound_alarm = new Audio("./audio/alarm.mp3")
let sound_alert = new Audio("./audio/nhk.mp3")
let sound_info = new Audio("./audio/info.mp3")

socket.on("connect", function() {
    socket.emit("auth", { version: 2.1 })
})

socket.on("disconnect", function() {
    console.error("DISCON: Shake")
})

socket.on("auth", function(data) {
    if (data.ok) console.log("OK: Shake")
    else console.log("ERR: Shake - bad auth")
})

let eew = function(data, type) {
    data = (typeof data !== "object") ? JSON.parse(data) : data

    $("#epicenter").text(data.details.epicenter.en)
    $("#seismic").text(data.details.seismic.en)
    $("#magnitude").text(data.details.magnitude)
    $("#depth").text(data.details.geography.depth)

    if (type === 1) {
        $(".content").css("background", "#E44242")
    }

    if (config.playsound) {
        if (data.alarm) {
            sound_alarm.play()
        } else if (type === 1) {
            sound_alert.play()
        }
    }

    if (data.situation !== 0) {
        if (type === 0) {
            timeout(0, true)
        } else {
            if (data.situation === 1) {
                timeout(60000, true)
            } else if (data.situation === 2) {
                timeout(50, false)
            }
        }
    }
}

let timeout = function(time, change) {
    setTimeout(function() {
        $(".content").css("background", "#333")
    }, time)
}

$(function() {
    socket.on("quake.eew", function(data) {
        eew(data, 1)
    })

    $.getJSON("http://shake.kurisubrooks.com:3390/api/quake.last", function(data) {
        eew(data, 0)
    })
})
