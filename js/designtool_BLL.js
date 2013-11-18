
/**
 * Returns data of a specific sensor.
 * 
 * @param  uuid          unique universal ID of the sensor
 * @param  isInitialCall only called when it is the first time call this recursive function
 * @return the           data of a specific sensor.
*/
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
                result = parseFloat(result.toFixed(3));
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

function createUUID(prefix) {
    var strings = [];
    strings[0] = generateRandomHexString(8);
    strings[1] = generateRandomHexString(4);
    strings[2] = generateRandomHexString(4);
    strings[3] = generateRandomHexString(4);
    strings[4] = generateRandomHexString(12);
    return prefix + strings.join("-");
}


function generateRandomHexString(numDigitsToOutput) {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < numDigitsToOutput; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    
    return s.join("");
}

function saveVirtualSensor(editingMode) {
    var outputConnections = jsPlumb.getConnections({ target: 'output' });
    var virtualSensorName = $('#name_virtual_sensor').val().toUpperCase().replace(/[^a-z0-9_]/gi, "_");

    //check pre-conditions: is connected,  there is a valid name in the inbox and doesn't already exists
    if (!(outputConnections.length > 0 && patternVirtualSensorName.test(virtualSensorName))) {
        alert("The output should be connected and a name specified")
        return false;
    }

    if (editingMode == false && typeof storageObj["ROOT"]["VIRTUAL_SENSORS"][virtualSensorName] != 'undefined') {
        alert("There is already a virtual sensor called " + virtualSensorName);
        return false;
    }

    if (editingMode) {
        var version = parseFloat(storageObj["ROOT"]["VIRTUAL_SENSORS"][virtualSensorName]["version"]) + 1;
    } else {
        var version = 1;
    }

    storageObj["ROOT"]["VIRTUAL_SENSORS"][virtualSensorName] = new Object();
    storageObj["ROOT"]["VIRTUAL_SENSORS"][virtualSensorName]["components"] = saveElementAndChildren(outputConnections[0].sourceId);
    storageObj["ROOT"]["VIRTUAL_SENSORS"][virtualSensorName]["source"] = outputConnections[0].sourceId;
    storageObj["ROOT"]["VIRTUAL_SENSORS"][virtualSensorName]["version"] = version;
    storageObj["ROOT"]["VIRTUAL_SENSORS"][virtualSensorName]["name"] = virtualSensorName;

    persistToLocalStorage();
    populateVirtualSensorList();
    alert(virtualSensorName + " saved successfully!");
    clearCanvas();
}

function saveElementAndChildren(id) {
    var counter = 0;
    var storage = [id];
    var result = [];
    while (storage.length > 0) {
        var uuid = storage.pop();
        switch (globalSensorInfo[uuid]["category"]) {
            case "custom":
                setCustomFunction(uuid);
                break;
            case "feeder":
                setFeederValue(uuid);
                break;
        }

        globalSensorInfo[uuid]["top"] = $("#" + uuid).offset().top;
        globalSensorInfo[uuid]["left"] = $("#" + uuid).offset().left;

        result[counter++] = { "uuid": uuid, "value": globalSensorInfo[uuid] };
        if (typeof globalSensorInfo[uuid]["children"] != "undefined") {
            for (var i = 0; i < globalSensorInfo[uuid]["children"].length; i++) {
                storage.push(globalSensorInfo[uuid]["children"][i]);
            }
        }
    }
    return result;
}

function persistToLocalStorage() {
    if (Modernizr.localstorage) {
        localStorage["storageObj"] = JSON.stringify(storageObj);
        var x2js = new X2JS();
        localStorage["storageObjXml"] = x2js.json2xml_str(storageObj);
        localStorage["storageObjXmlTaverna"] = convertXml2Taverna(localStorage["storageObjXml"]);
    }

    //send to node.js
    //$.get('http://127.0.0.1:1337/?op=def&vsDef=' + encodeURIComponent(JSON.stringify(storageObj)));
}

function convertXml2Taverna(xmlString) {
    xsl=loadXMLDoc("Taverna.xsl");
    if (window.DOMParser) {
        parser=new DOMParser();
        xml=parser.parseFromString(xmlString,"text/xml");
        xsltProcessor=new XSLTProcessor();
        xsltProcessor.importStylesheet(xsl);
        resultDocument = xsltProcessor.transformToFragment(xml,document);
    } else { // Internet Explorer
        xml=new ActiveXObject("Microsoft.XMLDOM");
        xml.async=false;
        xml.loadXML(xmlString);
        resultDocument=xml.transformNode(xsl);
    }
    console.log(resultDocument);
    return getXmlString(resultDocument);
}

function getXmlString(xml) {
  if (window.ActiveXObject) { return xml.xml; }
  return new XMLSerializer().serializeToString(xml);
}

function loadXMLDoc(dname) {
    if (window.ActiveXObject) {
        xhttp=new ActiveXObject("Msxml2.XMLHTTP.3.0");
    } else {
        xhttp=new XMLHttpRequest();
    }
    xhttp.open("GET",dname,false);
    xhttp.send("");
    return xhttp.responseXML;
}

function recoverFromLocalStorage() {
    if (Modernizr.localstorage) {
        storageObj = JSON.parse(localStorage["storageObj"]);
    }
}

function closeEditingCanvas() {
    clearCanvas();
}
function populateVirtualSensorList() {
    var name;
    $('#virtual_sensors_instances').html('');
    for (name in storageObj["ROOT"]["VIRTUAL_SENSORS"]) {
        $('#virtual_sensors_instances').append("<div draggable='true' ondragstart='drag(event)' rel='virtual' id='" + name + "' name='" + name + "'><header>" + name + "</header></div><br/>");
    }

}


function editVirtualSensor(objVirtualSensor) {
    //verify that the object about to edit is a virtual sensor
    var windowID = objVirtualSensor["id"];
    var nameVirtualSensor = $("#label_" + windowID)[0].innerHTML;
    var vsComponents = storageObj["ROOT"]["VIRTUAL_SENSORS"][nameVirtualSensor]["components"];

    //clean up the canvas: visually and the timer calls
    clearCanvas();

    //reconstruct the elements
    vsComponents.forEach(function (component, index, array) {
        var data = {
            sensorType: component.value["sensorType"],
            deviceID: component.value["deviceID"],
            name: component.value["name"],
            expression: component.value["expression"],
            children: component.value["children"],
            source: component.value["source"],
            inputvalue: component.value["inputvalue"]
        };

        if ($("#" + component.uuid).length == 0) {
            createNewElementInCanvas(component.value["category"], component.value["left"], component.value["top"], data, component.uuid);
        }
    });

    //reconnect the elements
    vsComponents.forEach(function (component, index, array) {
        if (typeof component.value["children"] != 'undefined' && component.value["children"].length > 0) {
            var targetEndPoints = getEndPointsOfElement($("#" + component.uuid), "target");
            for (var i = 0; i < component.value["children"].length; i++) {
                var sourceEndPoint = getEndPointsOfElement($("#" + component.value["children"][i]), "source");
                jsPlumb.connect({ source: sourceEndPoint[0], target: targetEndPoints[i] });
            }
        }
    });

    //call the setCustomFunction
    vsComponents.forEach(function (component) {
        switch (component.value["category"]) {
            case "custom":
                setCustomFunction(component.uuid);
                break;
            case "feeder":
                setFeederValue(component.uuid);
                break;
        }
    });

    //connect with output box
    var outputTargetEndPoint = getEndPointsOfElement($("#output"), "target");
    var firstChildSourceEndPoint = getEndPointsOfElement($("#" + vsComponents[0].uuid), "source");
    jsPlumb.connect({ source: firstChildSourceEndPoint[0], target: outputTargetEndPoint[0] });

    //fill the name (non-editable) in the output box
    $("#name_virtual_sensor").val(nameVirtualSensor);

}

function clearCanvas() {
    for (var id in globalSensorInfo) {
        //verify if the visual element exist in the canvas
        if (typeof $("#" + id)[0] != 'undefined') {
            deleteElement($("#" + id)[0], false);
        } else {
            removeFromGlobalSensorInfo(id);
        }
    }
    templates_counter = 0;
}

function removeFromGlobalSensorInfo(uuid) {
    clearInterval(globalSensorInfo[uuid]["setIntervalId"]);
    delete globalSensorInfo[uuid];
}

function deleteVirtualSensor() {
    var virtualSensorName = $('#name_virtual_sensor').val().toUpperCase();
    if (confirm("Are you sure you want to delete " + virtualSensorName + "?")) {
        clearCanvas();
        delete storageObj["ROOT"]["VIRTUAL_SENSORS"][virtualSensorName];
        persistToLocalStorage();
        populateVirtualSensorList();
    }
}

function unfoldVirtualSensor(virtualSensorName) {
    for (var i = 0; i < storageObj["ROOT"]["VIRTUAL_SENSORS"][virtualSensorName]["components"].length; i++) {
        var obj = storageObj["ROOT"]["VIRTUAL_SENSORS"][virtualSensorName]["components"][i];
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
