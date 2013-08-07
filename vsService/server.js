/*This is just an overnight sample node.js app to run the definition of virtual sensors*/
/*In order to run, this app need the https://github.com/wiredprairie/unofficial_nodejs_nest*/
/*This app should be installed in their own Node.js server (with all their modules)*/

"option strict";
var $ = require('jquery');
var url = require('url');
var http = require('http');
"option strict";
var util = require('util'),
    nest = require('unofficial-nest-api');

eval(require('fs').readFileSync('./psMathStats.min.js', 'utf8'));


hostname = "http://cmu-sensor-network.herokuapp.com";

//latest global sensor data
globalPhysicalSensorData = {};

var virtualSensorValue = new Object();

//object to store all virtual sensors definition and templates definition
var storageObj = new Object;
storageObj["VIRTUAL_SENSORS"] = new Object;
storageObj["SETTINGS"] = new Object;

//last reading time for each device
last_reading_time_for_all_devices = {};


//global device value
globalDeviceValue = {};

//global sensor information
globalSensorInfo = {};

var lastTempCorrection = 0;

//mapping between device id and human readable labels
idReadableMapping = {
    "10170303":"B23_104",
    "10170302":"B23_105B",
    "10170006":"B23_107",
    "10170005":"B23_109",
    "10170004":"B23_110",
    "10170002":"B23_115",
    "10170003":"B23_116",
    "10170308":"B23_120",
    "10170307":"B23_122",
    "10170304":"B23_123",
    "10170306":"B23_124",
    "10170305":"B23_126",
    "10170103":"B23_129",
    "10170102":"B23_129A",
    "10170009":"B23_210",
    "10170007":"B23_211",
    "10170008":"B23_212",
    "10170203":"B23_213",
    "10170204":"B23_214",
    "10170205":"B23_214B",
    "10170207":"B23_215",
    "10170206":"B23_215B",
    "10170202":"B23_216",
    "10170208":"B23_217A",
    "10170209":"B23_217B",
    "10170105":"B23_228",
    "10170106":"B23_229",
    "10170104":"B23_230",
    "235b1952f5cfc4ee": "213_A",
    "23295052f5cfc4ee": "213_B",
    "23703752f5cfc4ee": "213_C",
    "23366552f5cfc4ee": "213_D"
};


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
    //http://cmu-sensor-network.herokuapp.com/lastest_readings_from_all_devices/temp

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

//give globalPhysicalSensor initial value
initPhysicalSensor();

setInterval(function () {
    sensorTimer("digital_temp");
}, 3000);

setInterval(function () {
    sensorTimer("light");
}, 3000);

setInterval(function () {
    sensorTimer("humidity");
}, 3000);

setInterval(function () {
    sensorTimer("audio_p2p");
}, 3000);

setInterval(function () {
    sensorTimer("motion");
}, 3000);


function createUUID(prefix) {
    var s = [];
    var hexDigits = "abcdefghijklmnop";
    for (var i = 0; i < 16; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }

    var uuid = prefix + s.join("");
    return uuid;
}

function unfoldVirtualSensor(virtualSensorName) {
    for (var i = 0; i < storageObj["VIRTUAL_SENSORS"][virtualSensorName]["components"].length; i++) {
        var obj = storageObj["VIRTUAL_SENSORS"][virtualSensorName]["components"][i];
        globalSensorInfo[obj["uuid"]] = obj["value"];
        if (obj["value"]["category"] === "physical") {
            if (typeof globalDeviceValue[obj["value"]["deviceID"]] == "undefined") {
                globalDeviceValue[obj["value"]["deviceID"]] = null;
            }
        }
        if (obj["value"]["category"] == "virtual") {
            unfoldVirtualSensor(obj["value"]["name"]);
        }
    }
}

function readSensorData(uuid, isInitialCall) {
    var result = 0;

    switch (globalSensorInfo[uuid]["category"]) {
        case "feeder":
            result = globalSensorInfo[uuid]["inputvalue"];
            break;
        case "virtual":
            result = readSensorData(globalSensorInfo[uuid]["source"]);
            break;
        case "custom":
        {
            var argLabel = [];
            for (var i = 0; i < globalSensorInfo[uuid]["children"].length; i++) {
                var value = readSensorData(globalSensorInfo[uuid]["children"][i]);
                argLabel.push(String.fromCharCode(65 + i));
            }

            var functionDeclaration = "var new_func=function(" + argLabel.join(",") + "){" + globalSensorInfo[uuid]["expression"]
                + "}";

            eval(functionDeclaration);
            var temp;
            var functionCallWithParams = "temp = new_func(" + getParameterValues(uuid) + ");";
            eval(functionCallWithParams);

            if (typeof temp == "boolean")
                result = new Boolean(temp);
            result = temp;
            break;
        }
        case "physical":
            var deviceID = globalSensorInfo[uuid]["deviceID"];
            var sensorType = globalSensorInfo[uuid]["sensorType"];
            result = 0;
            if (globalPhysicalSensorData[deviceID] != undefined) {
                if (globalPhysicalSensorData[deviceID][sensorType]["value"] == undefined)
                    result = 0;
                else
                    result = globalPhysicalSensorData[deviceID][sensorType]["value"];
            }
            if (result != 0 && sensorType == "digital_temp") {
                result = (result * 9 / 50 + 32);
            }
            break;
    }

    if (typeof temp == "boolean")
        result = new Boolean(temp);

    if (isInitialCall) {
        switch (typeof result) {
            case "number":
                result = result.toFixed(3);
                break;
        }
    }
    return result;
}

/**
 * Returns a string contains parameters values list for the user defined function.
 * When the parameter is a string, its value need to add double quote. And when the
 * parameter is a boolean, its value need to transfer as a Boolean class.
 *
 * @param  uuid unique universal ID of the sensor
 * @return the string contains parameters values list
 */
function getParameterValues(uuid) {
    var values = [];
    for (var i = 0; i < globalSensorInfo[uuid]["children"].length; i++) {
        var childUUID = globalSensorInfo[uuid]["children"][i];
        var value = readSensorData(childUUID, false);
        switch (typeof value) {
            case "string": {
                if (globalSensorInfo[childUUID]["category"] == "physical")
                    values.push(value);
                else
                    values.push("\"" + value + "\"");
                break;
            }
            case "boolean": {
                values.push("new Boolean(" + value + ")");
                break;
            }
            default:
                values.push(value);
        }
    }
    return values.join(",");
}

function readSensorStatus(uuid) {
    var status = "red";
    switch (globalSensorInfo[uuid]["category"]) {
        case "physical":
            var deviceID = globalSensorInfo[uuid]["deviceID"];
            var sensorType = globalSensorInfo[uuid]["sensorType"];
            if (globalPhysicalSensorData[deviceID] != undefined) {
                var lastTime = globalPhysicalSensorData[deviceID][sensorType]["timestamp"];
                if (new Date().getTime() / 1000 - parseFloat(lastTime) < 15.0) {
                    status = "black";
                };

            }
            break;
        case "virtual":
            status = readSensorStatus(globalSensorInfo[uuid]["source"]);
            break;
        case "custom":
            status = "black";
            for (var i = 0; i < globalSensorInfo[uuid]["children"].length; i++) {
                var value = readSensorStatus(globalSensorInfo[uuid]["children"][i]);
                if (value == "red") {
                    status = "red";
                    break;
                }
            }
            break;
        case "feeder":
            status = globalSensorInfo[uuid]["status"];
            break;
    }
    return status;
}


function flushSetIntervalCalls() {
    for (var uuid in globalSensorInfo) {
        clearInterval(globalSensorInfo[uuid]["setIntervalId"]);
    }
}

function loadVirtualSensorsDefinition(strVirtualSensorsDefinitionJSON){
    flushSetIntervalCalls();
    storageObj = new Object;
    virtualSensorValue = new Object();
    globalSensorInfo = {};
    storageObj = JSON.parse(strVirtualSensorsDefinitionJSON);

    Object.keys(storageObj["VIRTUAL_SENSORS"]).forEach(function(vsName){
        var id = createUUID();
        unfoldVirtualSensor(vsName);
        globalSensorInfo[id] = {"category":"virtual", "name":vsName, "source": storageObj["VIRTUAL_SENSORS"][vsName]["components"][0]["uuid"]};
        //globalSensorInfo[id] = {"category":"virtual", "name":vsName, "source": storageObj["VIRTUAL_SENSORS"][vsName]["source"]};

        var setIntervalId = setInterval(function () {
            virtualSensorValue[vsName] = new Object();
            virtualSensorValue[vsName]["value"] = readSensorData(id, true);
            virtualSensorValue[vsName]["status"] = readSensorStatus(id);
            virtualSensorValue[vsName]["version"] = storageObj["VIRTUAL_SENSORS"][vsName]["version"];

            //add a timestamp verification of the last setup of temperature, so we dont setup the temp every second
            if ((typeof virtualSensorValue['RM213_OUT_OF_RANGE'] != 'undefined') &&
                (vsName == 'RM213_OUT_OF_RANGE' && virtualSensorValue['RM213_OUT_OF_RANGE']["value"] == true) &&
                (virtualSensorValue['RM213_OCCUPANCY']["value"] == true) &&
                ((Date.now() - lastTempCorrection) > 10000)){
                lastTempCorrection = Date.now();
                nest.login('username', 'password', function (err, data) {
                    if (err) {
                        console.log(err.message);
                        process.exit(1);
                        return;
                    }
                    //console.log('Logged in.');
                    nest.fetchStatus(function (data) {
                        for (var deviceId in data.device) {
                            if (data.device.hasOwnProperty(deviceId)) {
                                var device = data.shared[deviceId];
                                var targetTemp = nest.ctof(device.target_temperature);
                                var currentTemp = nest.ctof(device.current_temperature);
                                /*
                                console.log(util.format("%s [%s], Current temperature = %d F target=%d",
                                    device.name, deviceId,
                                    currentTemp,
                                    targetTemp));*/
                            }
                        }
                        var ids = nest.getDeviceIds();
                        var newTargetTemp = Math.round(virtualSensorValue['MEAN_TEMP_2ND_FLOOR']["value"]);
                        if (newTargetTemp != targetTemp){
                            nest.setTemperature(ids[0], newTargetTemp);
                            console.log("CORRECTING TEMPERATURE TO: " + newTargetTemp + "°F");
                        }
                    });
                });
            }



        }, 1000);



        globalSensorInfo[id]["setIntervalId"] = setIntervalId;
    });
}

http.createServer(function (request, res) {
  var queryData = url.parse(request.url, true).query;

  switch (queryData.op){
      case "def":
          loadVirtualSensorsDefinition(queryData.vsDef);
          break;
      default:
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end(JSON.stringify(virtualSensorValue[queryData.vsID]));
          break;
  }

}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
