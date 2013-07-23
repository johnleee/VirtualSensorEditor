
function setupAjaxTimer(deviceId) {
    var lastTime = last_reading_time_for_all_devices[deviceId];

    var query_string = hostname + "/sensor_readings/" + deviceId + "?start_time=" + lastTime + "000&end_time=" + lastTime + "000";
    $.get(query_string, function (newData) {
        globalDeviceValue[deviceId] = newData;
    });
}

function calcGlobalControlDeviceValue() {
    for (var deviceID in globalDeviceValue) {
        if (!globalDeviceValue[deviceID]) {
            globalDeviceValue[deviceID] = {};
            setInterval(function () {
                setupAjaxTimer(deviceID);
            }, 3000);
            break;
        }
    }
}

function initPhysicalSensor() {
    $.get(hostname + "/last_readings_from_all_devices/1374158197000/digital_temp/json", function (data) {
        globalPhysicalSensorData['digital_temp'] = JSON.parse(data);
    });

    $.get(hostname + "/last_readings_from_all_devices/1374158197000/light/json", function (data) {
        globalPhysicalSensorData['light'] = JSON.parse(data);
    });

    $.get(hostname + "/last_readings_from_all_devices/1374158197000/humidity/json", function (data) {
        globalPhysicalSensorData['humidity'] = JSON.parse(data);
    });

    $.get(hostname + "/last_readings_from_all_devices/1374158197000/audio_p2p/json", function (data) {
        globalPhysicalSensorData['audio_p2p'] = JSON.parse(data);
    });

    $.get(hostname + "/last_readings_from_all_devices/1374158197000/motion/json", function (data) {
        globalPhysicalSensorData['motion'] = JSON.parse(data);
    });
}

function sensorTimer(sensorType) {
    var urlString = hostname + "/last_readings_from_all_devices/" + new Date().getTime() + "/" + sensorType + "/json";
    $.get(urlString, function (newData) {
        if (newData == "no reading found")
            return;
        globalPhysicalSensorData[sensorType] = JSON.parse(newData);
    });
}

