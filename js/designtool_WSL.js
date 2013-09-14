/// <reference path="designtool_PRE.js" />

var USE_FAKE_DATA = true;

function setupAjaxTimer_quarentine(deviceId) {
    var lastTime = last_reading_time_for_all_devices[deviceId];

    var query_string = hostname + "/sensor_readings/" + deviceId + "?start_time=" + lastTime + "000&end_time=" + lastTime + "000";
    $.get(query_string, function (newData) {
        globalDeviceValue[deviceId] = newData;
    });
}

function calcGlobalControlDeviceValue_quarentine() {
    for (var deviceID in globalDeviceValue) {
        if (!globalDeviceValue[deviceID]) {
            globalDeviceValue[deviceID] = {};
            setInterval(function () {
                setupAjaxTimer(deviceID);
            }, 2000);
            break;
        }
    }
}

function initPhysicalSensor() {
    for (var key in idReadableMapping) {
        globalPhysicalSensorData[key] = {};
        globalPhysicalSensorData[key]["digital_temp"] = {};
        globalPhysicalSensorData[key]["light"] = {};
        globalPhysicalSensorData[key]["humidity"] = {};
        globalPhysicalSensorData[key]["audio_p2p"] = {};
        globalPhysicalSensorData[key]["motion"] = {};
    }
}

function sensorTimer(sensorType) {

    if (USE_FAKE_DATA) {
      for (var deviceID in globalPhysicalSensorData) {
        globalPhysicalSensorData[deviceID][sensorType]["value"] = Math.random() * 100;
        globalPhysicalSensorData[deviceID][sensorType]["timestamp"] = '' + Date.now();
      }
      return;
    }

    var urlString = hostname + "/lastest_readings_from_all_devices/" + sensorType + "/json";
    $.get(urlString, function (newData) {
        //if (newData == "no reading found")
        //    return;
        //globalPhysicalSensorData[sensorType] = JSON.parse(newData);
        var jsonData = JSON.parse(newData);
        for (var i = 0; i < jsonData.length; i++) {
            var deviceID = jsonData[i]["device_id"];
            if (globalPhysicalSensorData[deviceID] == undefined)
                continue;
            globalPhysicalSensorData[deviceID][sensorType]["value"] = jsonData[i]["value"];
            globalPhysicalSensorData[deviceID][sensorType]["timestamp"] = jsonData[i]["timestamp"];
        }
    });
}

