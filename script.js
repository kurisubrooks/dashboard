// Config
let config = {
    overscan: false,
    apikey: null,
    location: null,
    playsound: true
}

// Get URL Params
let getUrlParameter = function getUrlParameter(sParam) {
    let sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split("&"), sParameterName

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split("=")

        if (sParameterName[0] === sParam)
            return sParameterName[1] === undefined ? true : sParameterName[1]
    }
}

// Clock
let clock = function() {
    $("#time").text(moment().format("h:mm:ss a"))
}

// Weather
let weather = function() {
    let url = "http://kurisu.pw/api/weather"

    console.log("GET: Weather - " + moment().format("DD/MM/YY h:mm:ss a"))

    $.ajax({
        url: url,
        dataType: "json",
        success: function(data) {
            console.log("OK: Weather")

            // Current
            $("#icon").attr("src", data.weather.image)
            $("#temperature").text(data.weather.temperature)
            $("#condition").text(data.weather.condition)
            $("#humidity").text(data.weather.humidity)
            $("#uv").text(data.weather.UV)
            $("#checked").text(moment().format("h:mm a"))

            // Forecast
            let all = $("<div></div>")
            let count = 0

            data.forecast.forEach(function(v) {
                console.log(v)
                console.log(count)

                if (count >= 8) return

                let container = $("<div class='item'></div>")
                let day = $("<p></p>").text(moment.unix(v.date.time).format("ddd"))
                let icon = $("<img title='" + v.condition + "' height='48px' />").attr("src", v.image)
                let max = $("<p id='max'></p>").text(v.high)
                let min = $("<p id='min'></p>").text(v.low)

                container.append(day)
                container.append(icon)
                container.append(max)
                container.append(min)
                all.append(container)

                ++count
            })

            $("#forecast").html(all)
        },
        error: function(data) {
            console.error("ERR: Weather")
            console.error(data)
        }
    })
}

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
    if (data.ok)
        console.log("OK: Shake")
    else
        console.log("ERR: Shake - bad auth")
})

let eew = function(data, type) {
    data = (typeof data !== "object") ? JSON.parse(data) : data

    $("#epicenter").text(data.details.epicenter.en)
    $("#seismic").text(data.details.seismic.en)
    $("#magnitude").text(data.details.magnitude)
    $("#depth").text(data.details.geography.depth)

    if (type === 1) {
        $(".sidebar").css("background", "#C42E2E")
        $(".content").css("background", "#E44242")
    }

    if (config.playsound) {
        if (data.alarm)
            sound_alarm.play()
        else if (type === 1)
            sound_alert.play()
    }

    let timeout = function(time, change) {
        setTimeout(function() {
            $(".sidebar").css("background", "#222")
            $(".content").css("background", "#333")
        }, time)
    }

    if (data.situation !== 0) {
        if (type === 0)
            timeout(0, true)
        else if (data.situation === 1)
            timeout(60000, true)
        else if (data.situation === 2)
            timeout(50, false)
    }
}

let start = function() {
    if (config.overscan === true) $("body").css("padding", "6px 17px")

    // Shake
    socket.on("quake.eew", function(data) {
        eew(data, 1)
    })

    // Previous Quake
    $.getJSON("http://shake.kurisubrooks.com:3390/api/quake.last", function(data) {
        eew(data, 0)
    })

    // Clock
    setInterval(clock, 100)
    clock()

    // Weather
    setInterval(weather, 2 * 60 * 1000)
    weather()
}

// Start
$(function() {
    // Initialise
    if (getUrlParameter("overscan") === "true")
        config.overscan = true
    if (getUrlParameter("sound") === "false")
        config.playsound = false

    start()
})
