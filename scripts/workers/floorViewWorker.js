
function pollSensorData(url, interval, sensorType) {
    url += sensorType + "/json"
    try {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200 || xhr.status == 0) {
                    postMessage(xhr.responseText);
                }
                else {
                    throw  xhr.status + xhr.responseText;
                }
//                setTimeout("pollTempData()", interval);
            }
        };
        xhr.open("GET", url, true);
        xhr.send();
    } catch (e) {
        postMessage("ERROR:" + e.message);
    }
}

self.addEventListener('message', function (e) {
    var interval = 9000
    switch (e.data.type) {
        case "START":
            url = e.data.url;
//            var timestamp = new Date()
//            timestamp.setMinutes(timestamp.getMinutes()-1)
//            url += timestamp.getTime()
//            var sensorTypes = new Array("temp","digital_temp","light", "pressure", "humidity", "motion", "audio_p2p", "acc_x", "acc_y", "acc_z");
            var sensorTypes = new Array("light");
            for (var i in sensorTypes) {
                pollSensorData(url, interval, sensorTypes[i])
            }
            break;
        case "STOP":
            self.close();
            break;
    }
}, false);
