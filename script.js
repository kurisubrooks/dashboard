let socket = io("http://shake.kurisubrooks.com:3390")
let sound_alarm = new Audio("./audio/alarm.mp3")
let sound_alert = new Audio("./audio/nhk.mp3")

let getUrlParams = function(sParam) {
    let PageURL = decodeURIComponent(window.location.search.substring(1)),
        URLVariables = PageURL.split("&"), ParamName

    for (i = 0; i < URLVariables.length; i++) {
        ParamName = URLVariables[i].split("=")

        if (ParamName[0] === sParam) return ParamName[1] === undefined ? true : ParamName[1]
    }
}

let clock = function() {
    $("#clock #date").text(moment().format("dddd, D MMMM"))
    $("#clock #time").text(moment().format("h:mm:ss a"))
}

let weather = function() {
    console.log("GET: Weather")

    $.ajax({
        url: "http://kurisu.pw/api/weather",
        dataType: "json",
        success: function(data) {
            console.log("OK: Weather")

            let UV

            if (data.weather.UV === 0)
                UV = "None"
            else if (data.weather.UV === 1 || data.weather.UV === 2)
                UV = "Low"
            else if (data.weather.UV >= 3 && data.weather.UV <= 5)
                UV = "Moderate"
            else if (data.weather.UV === 6 && data.weather.UV === 7)
                UV = "High"
            else if (data.weather.UV >= 8 && data.weather.UV <= 10)
                UV = "Very High"
            else if (data.weather.UV >= 11)
                UV = "Extreme"
            else
                UV = "Unknown"

            $("#weather #high").text(data.forecast[0].high + "°")
            $("#weather #low").text(data.forecast[0].low + "°")
            $("#weather #icon").attr("src", data.weather.image)
            $("#weather #condition").text(data.weather.condition)
            $("#weather #humidity").text(data.weather.humidity)
            $("#weather #UV").text(UV)
            $("#weather #temperature").text(data.weather.temperature + "°")
        },
        error: function(data) {
            console.error("ERR: Weather")
            console.error(data)
        }
    })
}

let fire = function() {
    console.log("GET: Fire")

    let colors = {
        0: "#FFFFFF",
        1: "#58ACFA",
        2: "#F7D358",
        3: "#FA5858"
    }

    $.ajax({
        url: "http://kurisu.pw/api/fire",
        dataType: "json",
        success: function(data) {
            console.log("OK: Fire")

            if (data.search >= 1) {
                $("#fire #indicator").css("color", colors[data.fires[0].data.level])
                $("#fire #location").text(data.fires[0].title)
                $("#fire #status").text(data.fires[0].data.status)
                $("#fire #level").text(data.fires[0].category)
            } else {
                $("#fire #indicator").css("color", "#FFFFFF")
                $("#fire #location").text("Penrith, NSW")
                $("#fire #status").text("")
                $("#fire #level").text("No Fires")
            }
        },
        error: function(data) {
            console.error("ERR: Fire")
            console.error(data)
        }
    })
}

let shake = function () {
    console.log("GET: Shake")

    $.ajax({
        url: "http://shake.kurisubrooks.com:3390/api/quake.last",
        dataType: "json",
        success: function(data) {
            console.log("OK: Shake")

            $("#shake #seismic").text(data.details.seismic.en)
            $("#shake #magnitude").text(data.details.magnitude)
            $("#shake #depth").text(data.details.geography.depth + "km")
            $("#shake #epicenter").text(data.details.epicenter.en)
        },
        error: function(data) {
            console.error("ERR: Shake")
            console.error(data)
        }
    })
}
let eew = function(data) {
    data = typeof data !== "object" ? JSON.parse(data) : data

    $("#shake #seismic").text(data.details.seismic.en)
    $("#shake #magnitude").text(data.details.magnitude)
    $("#shake #depth").text(data.details.geography.depth + "km")
    $("#shake #epicenter").text(data.details.epicenter.en)

    $(".sidebar").css("background", "#C62E2E")
    $("html").css("background", "#DA3838")

    if (data.alarm)
        sound_alarm.play()
    else
        sound_alert.play()

    let reset = function(time) {
        setTimeout(function() {
            $(".sidebar").css("background", "#2A2A2A")
            $("html").css("background", "#333333")
        }, time ? time : 50)
    }

    if (data.situation !== 0) {
        if (data.situation === 1)
            reset(60 * 1000)
        else if (data.situation === 2)
            reset()
    }
}

socket.on("connect", function() {
    socket.emit("auth", { version: 2.1 })
})

socket.on("disconnect", function() {
    console.error("DC: Socket")
})

socket.on("auth", function(data) {
    if (data.ok)
        console.log("OK: Socket")
    else
        console.log("ERR: Socket - bad auth")
})

socket.on("quake.eew", function(data) {
    eew(data)
})

$(function() {
    setInterval(clock, 200)
    setInterval(weather, 2 * 60 * 1000)
    setInterval(fire, 2 * 60 * 1000)

    clock()
    weather()
    fire()
    shake()
})