let socket = io("http://shake.kurisubrooks.com:3390")
let sound_alarm = new Audio("./audio/alarm.mp3")
let sound_alert = new Audio("./audio/nhk.mp3")
let map
let marker

let getUrlParams = function(search) {
    let PageURL = decodeURIComponent(window.location.search.substring(1)),
        URLVariables = PageURL.split("&"), ParamName

    for (i = 0; i < URLVariables.length; i++) {
        ParamName = URLVariables[i].split("=")

        if (ParamName[0] === search) return ParamName[1] === undefined ? true : ParamName[1]
    }
}

let epicenter_icon = L.icon({
    iconUrl: "https://i.imgur.com/jFs4ZRf.png",
    iconSize: [28, 28],
    iconAnchor: [14, 14]
})

let initMap = () => {
    map = L.map("map").setView([32.5, 129.2], 6)
    marker = L.marker([32.5, 129.2], { icon: epicenter_icon }).addTo(map)

    let google = L.gridLayer.googleMutant({
        type: "roadmap",
        styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#2a2a2a"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"on"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"visibility":"off"},{"color":"#2a2a2a"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#999999"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#999999"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":15}]}]
    }).addTo(map)
}

let jp_dotw = [ "日", "月", "火", "水", "木", "金", "土" ]

let clock = () => {
    let time = moment().format("h:mm:ss a")

    if ($("#clock #time").text() !== time) {
        $("#clock #day").text(moment().format("dddd"))
        $("#clock #jpd").text(jp_dotw[Number(moment().format("d"))])
        $("#clock #date").text(moment().format("D MMMM YYYY"))
        $("#clock #time").text(time)
    }
}

let weather = () => {
    console.log("GET: Weather")

    let UV = function(index) {
        if (index === 0)
            return "None"
        else if (index === 1 || index === 2)
            return "Low"
        else if (index >= 3 && index <= 5)
            return "Moderate"
        else if (index === 6 || index === 7)
            return "High"
        else if (index >= 8 && index <= 10)
            return "Very High"
        else if (index >= 11)
            return "Extreme"
        else
            return "Unknown"
    }

    $.ajax({
        url: "http://kurisu.pw/api/weather",
        dataType: "json",
        success: function(data) {
            console.log("OK: Weather")

            $("#weather #icon").attr("src", data.weather.image)
            $("#weather #condition").text(data.weather.condition ? data.weather.condition : "Unknown")
            $("#weather #humidity").text(data.weather.humidity)
            $("#weather #UV").text(data.weather.UV + ", " + UV(data.weather.UV))
            $("#weather #temperature").text(Math.round(data.weather.temperature))

            let all = $("<ol></ol>")
            let count = 0

            data.forecast.forEach(function(v) {
                let viewport = $("body").width()

                // < 720p
                if (viewport >= 1060 && viewport < 1730) {
                    if (count >= 6) return
                // 900p - 1080p
                } else if (viewport >= 1730 && viewport < 2065) {
                    if (count >= 8) return
                // 1440p - 4K
                } else if (viewport >= 2065) {
                    if (count >= 10) return
                } else if (count >= 6) {
                    return
                }

                let container = $(`<li></li>`)
                    let temp = $(`<div id="temp"></div>`)
                        let max = $(`<div id="max"></div>`).text(v.high + "°")
                        let min = $(`<div id="min"></div>`).text(v.low + "°")
                    let icon = $(`<div id="icon">`)
                        let image = $(`<img height="50px" />`).attr("title", v.condition).attr("src", v.image)
                    let details = $(`<div id="details"></div>`)
                        let date = $(`<div id="date"></div>`).text(`${moment.unix(v.date.time).format("ddd, Do MMM")}`)
                        let condition = $(`<div id="condition"></div>`).text(`${v.condition}`)

                temp.append(max)
                temp.append(min)
                container.append(temp)

                icon.append(image)
                container.append(icon)

                details.append(date)
                details.append(condition)
                container.append(details)

                all.append(container)

                ++count

                $("#weather #forecast").html(all)
            })
        },
        error: function(data) {
            console.error("ERR: Weather")
            console.error(data)
        }
    })
}

let aqi = () => {
    console.log("GET: AQI")

    $.ajax({
        url: "http://kurisu.pw/api/aqi",
        dataType: "json",
        success: function(data) {
            console.log("OK: AQI")

            //$("#weather #aqi").css("color", data.aqi.color)
            $("#weather #aqi").text(data.aqi.value + ", " + data.aqi.level)
        },
        error: function(data) {
            console.error("ERR: AQI")
            console.error(data)
        }
    })
}

let fire = () => {
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

            let count = 0
            let mfcontainer = $(`<div class="container"></div>`)
            let container = $(`<div class="container"></div>`)

            data.fires.forEach((v) => {
                let box = $(`<div class="box"></div>`)
                    let sidebar = $(`<div class="sidebar"></div>`)
                        let icon = $(`<div class="icon"></div>`)
                            let fire = $(`<i class="material-icons">whatshot</i>`)
                    let content = $(`<div class="content"></div>`)
                        let place = $(`<h2 id="place"></h2>`)
                        let info = $(`<div id="status"></div>`)
                            let type = $(`<span class="value"></span>`)
                            let status = $(`<span class="value"></span>`)

                fire.css("color", colors[v.level])
                place.text(v.title)
                type.text(v.type)
                status.text(v.status)

                if (count > 2) {
                    console.info(true)
                    //sidebar.width("100px")
                    content.css("background", "inherit")
                }

                icon.append(fire)
                sidebar.append(icon)
                box.append(sidebar)

                info.append(type)
                info.append(status)
                content.append(place)
                content.append(info)
                box.append(content)

                if (v.data.level > 1) {
                    mfcontainer.append(box)
                } else {
                    ++count
                    container.append(box)
                }
            })

            $("#majorfires").html(mfcontainer)
            $("#fires").html(container)
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

            $("#text #seismic").text(data.details.seismic.en)
            $("#text #magnitude").text(data.details.magnitude)
            $("#text #depth").text(data.details.geography.depth + "km")
            $("#text #epicenter").text(data.details.epicenter.en)
        },
        error: function(data) {
            console.error("ERR: Shake")
            console.error(data)
        }
    })
}

let eew = function(data) {
    data = typeof data !== "object" ? JSON.parse(data) : data

    $("#text #seismic").text(data.details.seismic.en)
    $("#text #magnitude").text(data.details.magnitude)
    $("#text #depth").text(data.details.geography.depth + "km")
    $("#text #epicenter").text(data.details.epicenter.en)

    $(".overlay").show()
    $(".sidebar").css("background", "#C62E2E")
    $("html").css("background", "#DA3838")

    if (data.alarm)
        sound_alarm.play()
    else
        sound_alert.play()

    let reset = function(time) {
        setTimeout(() => {
            $(".sidebar").css("background", "#2A2A2A")
            $("html").css("background", "#333333")
            $(".overlay").fadeOut("fast")
        }, time ? time : 50)
    }

    if (data.situation !== 0) {
        if (data.situation === 1)
            reset(60 * 1000)
        else if (data.situation === 2)
            reset()
    }

    map.setView([data.details.geography.lat, data.details.geography.long], 6)
    marker.setLatLng([data.details.geography.lat, data.details.geography.long]).update()
    map.invalidateSize()
}

socket.on("connect", () => {
    socket.emit("auth", { version: 2.1 })
})

socket.on("disconnect", () => {
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
    setInterval(() => {
        weather()
        fire()
        aqi()
    }, 2 * 60 * 1000)

    initMap()
    clock()
    weather()
    fire()
    aqi()
    shake()

    /*setTimeout(() => {
        eew({"id":20161228164030,"drill":false,"alarm":false,"situation":0,"revision":4,"details":{"announced":"2016/12/28 16:41:31","occurred":"2016/12/28 16:40:14","magnitude":3.8,"epicenter":{"id":0,"en":"Sanpachikamikita, Aomori Prefecture","ja":"三八上北地方青森県"},"seismic":{"en":"2","ja":"2"},"geography":{"lat":40.8,"long":141.2,"depth":10,"offshore":false}}})
    }, 4000)

    setTimeout(() => {
        eew({"id":20161228164030,"drill":false,"alarm":false,"situation":1,"revision":4,"details":{"announced":"2016/12/28 16:41:31","occurred":"2016/12/28 16:40:14","magnitude":3.8,"epicenter":{"id":189,"en":"Offshore South Eastern Nemuro Peninsula","ja":"根室半島南東沖"},"seismic":{"en":"2","ja":"2"},"geography":{"lat":43,"long":146.6,"depth":10,"offshore":true}}})
    }, 6800)*/
})
