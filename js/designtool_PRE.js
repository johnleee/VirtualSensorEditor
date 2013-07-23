//hostname = "http://tool.azurewebsites.net/Default.aspx"
//hostname = "http://cmu-sds.herokuapp.com"
hostname = "http://cmu-sensor-network.herokuapp.com";

//latest global sensor data
globalPhysicalSensorData = {};

var templates_counter = 0;
var feederCounter = 0;

//object to store all virtual sensors definition and templates definition
var storageObj = new Object;
storageObj["VIRTUAL_SENSORS"] = new Object;
storageObj["SETTINGS"] = new Object;
var patternVirtualSensorName = /^[a-z0-9_]{4,}$/i;

//last reading time for each device
last_reading_time_for_all_devices = {};


//global device value
globalDeviceValue = {};

//global sensor information
globalSensorInfo = {};



//mapping between device id and human readable labels
id_readable_mapping = {
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
    "10170104":"B23_230"
};


// this is the paint style for the connecting lines..
var connectorPaintStyle = {
        lineWidth:4,
        strokeStyle:"#2e2aF8",
        joinstyle:"round"
    },
// .. and this is the hover style.
    connectorHoverStyle = {
        lineWidth:4,
        strokeStyle:"#FF0000"
    },
    endpointHoverStyle = {fillStyle:"#2e2aF8"},
// the definition of source endpoints (the small blue ones)
    sourceEndpoint = {
        endpoint:"Dot",
        paintStyle:{
            strokeStyle:"#2e2aF8",
            fillStyle:"transparent",
            radius:7,
            lineWidth:2
        },
        isSource:true,
        maxConnections:-1,
        connector:[ "Bezier", { curviness:100 } ],
        connectorStyle:connectorPaintStyle,
        hoverPaintStyle:endpointHoverStyle,
        connectorHoverStyle:connectorHoverStyle,
        dragOptions:{},
        anchors:[ "BottomCenter"]
    },
// a source endpoint that sits at BottomCenter
//	bottomSource = jsPlumb.extend( { anchor:"BottomCenter" }, sourceEndpoint),
// the definition of target endpoints (will appear when the user drags a connection)
    targetEndpoint = {
        endpoint:"Dot",
        paintStyle:{ fillStyle:"#2e2aF8", radius:7},
        hoverPaintStyle:endpointHoverStyle,
        maxConnections:1,
        dropOptions:{ hoverClass:"hover", activeClass:"active" },
        isTarget:true,
        anchor:[0.2, 0, 0, -1]

    },
    outputEndpoint = {
        endpoint:"Dot",
        paintStyle:{ fillStyle:"#2e2aF8", radius:7 },
        hoverPaintStyle:endpointHoverStyle,
        maxConnections:1,
        dropOptions:{ hoverClass:"hover", activeClass:"active" },
        isTarget:true,
        anchors:["TopCenter"],
        overlays:[
            [ "Label", { location:[0.5, -0.5], label:"Output", cssClass:"endpointTargetLabel" } ]
        ]
    },
    init = function (connection) {
        connection.bind("editCompleted", function (o) {
        });
    };


jsPlumb.bind("ready", function () {

    jsPlumb.importDefaults({
        // default drag options
        DragOptions:{ cursor:'pointer', zIndex:2000 },
        // default to blue
        EndpointStyles:[
            { fillStyle:'#225588' },
            { fillStyle:'#558822' }
        ],
        // blue endpoints 7 px
        Endpoints:[
            [ "Dot", {radius:7} ],
            [ "Dot", { radius:7 } ]
        ],
        // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
        // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
        ConnectionOverlays:[
            [ "Arrow", { location:0.5 } ]
        ]
    });

    if (Modernizr.localstorage && localStorage.getItem("storageObj") != null) {
        recoverFromLocalStorage();
        populateVirtualSensorList();
    }

    // listen for clicks on connections, and offer to delete connections on click.
    jsPlumb.bind("dblclick", function (conn, originalEvent) {
        if (confirm("Delete connection?"))
            jsPlumb.detach(conn);
    });

    //jQuery UI for the accordion
    $(function () {
        $("#accordion").accordion({autoHeight:true, collapsible:false});

    });

});


function createNewElementInCanvas(type, x, y, data, uuid) {

    if (typeof uuid === 'undefined') {
        var id = createUUID("");
    } else {
        var id = uuid;
    }

    switch (type) {
        case 'custom':
            createNewTemplateInCanvas(id, data);
            break;
        case 'virtual':
            createNewVirtualSensorInCanvas(id, data);
            break;
        case 'feeder':
            createNewFeederInCanvas(id, data);
            break;
        case 'monitor':
            createNewMonitorInCanvas(id, data);
            break;
        default:
            createNewPhysicalSensorInCanvas(id, data);
            break;
    }

    //create new window and add it to the canvas
    jsPlumb.draggable($('#' + id));

    if (navigator.appVersion.indexOf("MSIE 10") != -1) {
        $('#' + id).show(2000).css({ top:y + 'px', left:x + 'px' });
    } else {
        $('#' + id).show(2000).offset({ left:x, top:y });
    }

    //create 'output' element if it doesnt exist
    if ($('#output').length == 0) {
        if (typeof uuid != 'undefined'){
            createOutputElement(true);
        }else{
            createOutputElement(false);
        }
    }

    jsPlumb.repaintEverything();
}

function deleteElement(elem, askConfirmation) {
    //var labelClass = $("#" + elem.id + " .label").attr('class');
    if (askConfirmation && !confirm("Delete element?")) {
        return false;
    }

    //clear setInterval call and array
    removeFromGlobalSensorInfo(elem.id);

    jsPlumb.detachAllConnections(elem);
    jsPlumb.removeAllEndpoints(elem);
    $("#" + elem.id).remove();

    //if no elements in canvas, remove "output" element
    if ($(".window").length == 0 && $('#output').length > 0) {
        jsPlumb.removeAllEndpoints($('#output'));
        $("#output").remove();
    }
}

function createOutputElement(editingMode) {
    var readOnlyTag = "";
    if (typeof editingMode != 'undefined' && editingMode == true){
        readOnlyTag = "readonly='true'";
    }else{
        editingMode = false;
    }

    $('<div class="window_output" id="output" >').appendTo('#design_canvas');
    $('#output').append('<div><input id="name_virtual_sensor" type="text" placeholder="Name of virtual sensor" pattern="[A-z0-9_]{4,}" title="Only alphanumeric characters accepted" '+ readOnlyTag +'></div>');
    $('#output').append('<div class="sensor_value" id="output_value"></div>');

    if (editingMode == true){
        $('#output').append('<div class="text-center">'+
            '<button class="btn btn-info" onclick="saveVirtualSensor(true);">Save</button>'+
            ' <button class="btn btn-info" onclick="closeEditingCanvas();">Close</button> '+
            '<button class="btn btn-danger" onclick="deleteVirtualSensor();">Delete</button>'+
            '</div>');
    }else{
        $('#output').append('<div class="text-center">'+
            '<button class="btn btn-info" onclick="saveVirtualSensor(false);">Save</button>'+
            ' <button class="btn btn-info" onclick="closeEditingCanvas();">Clear</button> '+
            '</div>');
    }


    jsPlumb.addEndpoint($("#output"), outputEndpoint);
    $('#output').show(2000).offset({ left:700, top:520 }); //todo: compatibility
    jsPlumb.draggable($('#' + "output"));
}

//note: id==uuid
function createNewPhysicalSensorInCanvas(id, data) {
    $('<div class="window" id="' + id + '" >').appendTo('#design_canvas');
    jsPlumb.addEndpoint($("#" + id), sourceEndpoint);
    $("#" + id).append("<div class='label label-physical' id='label_" + id + "'>" + data.name + "</div>");
    $("#" + id).append("<div class='sensor_value' id='sensor_value_" + id + "'>0</div>");
    $("#" + id).append("<input type='hidden' id='hidden_field_status_sensor_value_" + id + "'  />");
    globalSensorInfo[id] = { "category": "physical", "sensorType": data.type, "deviceID":data.device_id };

    $("#" + id).append("<input type='hidden' id='hidden_field_status_sensor_value_" + id + "' />");

    globalSensorInfo[id] = { "category":"physical", "sensorType":data.sensorType, "deviceID":data.deviceID, "name":data.name};
    var setIntervalId = setInterval(function () {
        $("#sensor_value_" + id).css("color", readSensorStatus(id));
        $("#sensor_value_" + id).html(readSensorData(id, true));
    }, 3000);
    globalSensorInfo[id]["setIntervalId"] = setIntervalId;
}

function createNewVirtualSensorInCanvas(id, data) {
    $('<div class="window" id="' + id + '" >').appendTo('#design_canvas');
    jsPlumb.addEndpoint($("#" + id), sourceEndpoint);
    $("#" + id).append("<div class='label label-virtual' id='label_" + id + "'>" + data.name + "</div>");
    $("#" + id).append("<div class='sensor_value' id='sensor_value_" + id + "'>0</div>");
    unfoldVirtualSensor(data.name);
    globalSensorInfo[id] = {"category":"virtual", "name":data.name, "source": storageObj["VIRTUAL_SENSORS"][data.name]["components"][0]["uuid"]};


    var setIntervalId = setInterval(function () {
        $("#sensor_value_" + id).css("color", readSensorStatus(id));
        $("#sensor_value_" + id).html(readSensorData(id, true));
    }, 1000);

    globalSensorInfo[id]["setIntervalId"] = setIntervalId;
}

function createNewTemplateInCanvas(id, data) {
    $('<div class="window" id="' + id + '" >').appendTo('#design_canvas');
    $("#" + id).append("<span class='label label-template' id='label_" + id + "'>" + data.name + "_" + templates_counter++ + "</span><br/>");
    if (typeof data.expression != 'undefined'){
        var expression = data.expression;
    }else{
        var expression = "";
    }

    $("#" + id).append("function &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span class='removeEndPoint' onclick='removeTargetEndpoint(this);'>  - </span>(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)<span class='addEndPoint' onclick='addTargetEndpoint(this);'> + </span>{<br/><textarea class='code_textarea' id=textarea_" + id + " contenteditable='true'>" + expression + "</textarea><br/>}<br/>");
    $("#" + id).append("<input type='button' value='Submit' name='" + id + "' onclick='setCustomFunction(\"" + id + "\");'  />");
    $("#" + id).append("<div class='sensor_value' id='sensor_value_" + id + "' >0</div>");
    $("#" + id).append("<input type='hidden' id='hidden_code_" + id + "' />");
    $("#" + id).append("<input type='hidden' id='hidden_field_is_valid_" + id + "' value='false' />");
    $("#" + id).append("<input type='hidden' id='hidden_field_status_sensor_value_" + id + "' />");
    $("#" + id).append("<input type='hidden' id='hidden_field_uuid_" + id + "' value='" + createUUID("c") + "'/>");
    jsPlumb.addEndpoint($("#" + id), sourceEndpoint);

    if (typeof data.children != 'undefined' && data.children.length > 1) {
        for (var i = 0; i < data.children.length; i++) {
            addTargetEndpoint($("#" + id), true);
        }
    } else {
        addTargetEndpoint($("#" + id), true);
    }

    globalSensorInfo[id] = {"category":"custom", name: data.name};
    var setIntervalId = setInterval(function () {
        if ($("#hidden_field_is_valid_" + id).val() === "false")
            return;
        $("#sensor_value_" + id).css("color", readSensorStatus(id));
        $("#sensor_value_" + id).html(readSensorData(id, true));
    }, 1000);

    globalSensorInfo[id]["setIntervalId"] = setIntervalId;
}

function createNewFeederInCanvas(id, data) {
    $('<div class="window" id="' + id + '" >').appendTo('#design_canvas');
    var name = "FEEDER_" + feederCounter++;
    $("#" + id).append("<div class='label' id='label_" + id + "'>" + name + "</div><br/>");
    if (typeof data.inputvalue != 'undefined'){
       var inputvalue = data.inputvalue;
    }else{
       var inputvalue = "0";
    }
    $("#" + id).append("<input type='text' value='" + inputvalue + "' id='feeder_value_" + id + "' />");
    $("#" + id).append("<input type='button' value='Submit' name='" + id + "' onclick='setFeederValue(\"" + id + "\")'  />");
    $("#" + id).append("<div class='sensor_value' id='sensor_value_" + id + "' name='" + id + "' onclick='feederLabelClick(\"" + id + "\")'>0</div>");
    $("#" + id).append("<input type='hidden' id='hidden_field_status_sensor_value_" + id + "' value='red' />");

    globalSensorInfo[id] = { "category":"feeder", "status":"red", "inputvalue":inputvalue};
    jsPlumb.addEndpoint($("#" + id), sourceEndpoint);
}

function createNewMonitorInCanvas(id, data) {
    $('<div class="window" id="' + id + '" >').appendTo('#design_canvas');
    var name = "Status Monitor";
    $("#" + id).append("<div class='label' id='label_" + id + "'>" + name + "</div><br/>");
    $("#" + id).append("<div class='siren_image' id='image_" + id + "' hidden='true'><img src='img/red_siren.gif'></img></div>");

    $("#" + id).append("<input type='button' value='Enabled' id='monitor_button_" + id + "' onclick='monitorClick(\"" + id + "\");'  />");
    $("#" + id).append("<input type='hidden' id='hidden_field_status_" + id + "' value='on' />");
    $("#" + id).append("<audio src='audio/siren.mp3' id='audio_" + id + "' loop='loop'></audio>");
    $("#image_" + id).hide();
    jsPlumb.addEndpoint($("#" + id), targetEndpoint);

    setInterval(function () {
        if ($("#hidden_field_status_" + id).val() == "off")
            return;
        var connections = jsPlumb.getConnections();
        for (var i = 0; i < connections.length; i++) {
         
            if (connections[i].targetId == id) {
                //console.log(readSensorData(connections[i].sourceId));
                var result = readSensorData(connections[i].sourceId);
                var audio_obj = document.getElementById("audio_" + id);
                var image_obj = $("#image_" + id);
                if (result == true) {
                    image_obj.show();
                    audio_obj.play();
                } else {
                    image_obj.hide();
                    audio_obj.pause();
                }
            }
        }
    }, 1000);
}

function monitorClick(id) {
    if ($("#hidden_field_status_" + id).val() == "off") {
        $("#hidden_field_status_" + id).val("on");
        $("#monitor_button_" + id).val("Enabled");

    } else {
        $("#hidden_field_status_" + id).val("off");
        $("#monitor_button_" + id).val("Disabled");
        var audio_obj = document.getElementById("audio_" + id);
        audio_obj.pause();
        $("#image_" + id).hide();
    }
}

//function for the 'Submit' button to submit the function code
function setCustomFunction(id) {
    var text_value = $("#textarea_" + id).val();
    $("#hidden_code_" + id).val(text_value);

    var expression = $("#hidden_code_" + id).val();
    var children = [];
    var targetEndpoints = getEndPointsOfElement($("#" + id), "target");

    for (var epIndex = 0; epIndex < targetEndpoints.length; epIndex++) {
        var endpointConnections = targetEndpoints[epIndex].connections;
        if (endpointConnections.length > 0) {
            for (var conIndex = 0; conIndex < endpointConnections.length; conIndex++) {
                children.push(endpointConnections[conIndex].sourceId);
            }
        } else {
            alert("All the arguments have to be connected!");
            $("#hidden_field_is_valid_" + id).val("false");
            return false;
        }
    }

    var sensorValue = [];
    var argLabel = [];
    for (var i = 0; i < children.length; i++) {
        sensorValue.push(0);
        argLabel.push(String.fromCharCode(65 + i));
    }

    var functionDeclaration = "var new_func=function(" + argLabel.join(",") + "){" + expression + "}";
    eval(functionDeclaration);
    var temp;
    var functionCallWithParams = "temp = new_func(" + sensorValue.join(",") + ");";
    try {
        eval(functionCallWithParams);
    } catch (e) {
        alert("invalid statement: " + e.message);
        $("#hidden_field_is_valid_" + id).val("false");
        return;
    }

    globalSensorInfo[id]["expression"] = expression;
    globalSensorInfo[id]["children"] = children;
    $("#hidden_field_is_valid_" + id).val("true");
}

//give globalPhysicalSensor initial value
initPhysicalSensor();

$.get(hostname + "/last_readings_from_all_devices/1374158197000/digital_temp/json", function (data) {
    $('#temp').html('');
    $.each(id_readable_mapping, function (key, val) {
        var tmp = val.split("_");
        var str_name = tmp[0] + "RM" + tmp[1];
        var str_temp = "<div draggable='true' ondragstart='drag(event)' rel='digital_temp' id=" + key + " name='" + str_name + "TEMP'><header>" + val + "</header></div>";
        $('#temp').append(str_temp + '<br/>');

        var str_light = "<div draggable='true' ondragstart='drag(event)' rel='light' id=" + key + " name='" + str_name + "LHT'><header>" + val + "</header></div>";
        $('#light').append(str_light + '<br/>');

        var str_humidity = "<div draggable='true' ondragstart='drag(event)' rel='humidity' id=" + key + " name='" + str_name + "HUM'><header>" + val + "</header></div>";
        $('#humidity').append(str_humidity + '<br/>');

        var str_audio_p2p = "<div draggable='true' ondragstart='drag(event)' rel='audio_p2p' id=" + key + " name='" + str_name + "SND'><header>" + val + "</header></div>";
        $('#sound_level').append(str_audio_p2p + '<br/>');

        var str_motion = "<div draggable='true' ondragstart='drag(event)' rel='motion' id=" + key + " name='" + str_name + "MOT'><header>" + val + "</header></div>";
        $('#motion').append(str_motion + '<br/>');
    });

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

});

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    var dt = ev.dataTransfer;
    var TEXT = ev.target.id + " " + $(ev.target).attr('rel') + " " + $(ev.target).attr('name');
    dt.setData("TEXT", TEXT);
}

function drop_window(ev) {
    ev.preventDefault();
    var dt = ev.dataTransfer;
    if (!dt) {
        return;
    }
    var str = dt.getData("TEXT").split(" ");
    var category = str[1];
    var name = str[2];
    var deviceID = str[0];

    if (category === "template" || category === "virtual" || category === "feeder" || category==="monitor") {
        createNewElementInCanvas(category, ev.clientX, ev.clientY, {name:name});
    }
    else {
        if (deviceID) {
            createNewElementInCanvas(category, ev.clientX, ev.clientY, { deviceID:deviceID, sensorType:category, name:name });
        }
    }

}

//Fixes endpoints for specified target
function fixEndpoints(parentnode) {
    //get list of current endpoints
    var targetEndpoints = getEndPointsOfElement(parentnode, "target");
    calculateEndpointPosition(targetEndpoints, true);
    jsPlumb.repaintEverything();
}

//recalculate endpoint anchor position manually
function calculateEndpointPosition(endpointArray) {
    var div = (endpointArray.length + 1);

    for (var i = 0; i < endpointArray.length; i++) {
        endpointArray[i].anchor.x = 0.23 + ((i + 1) / div) * 0.7;
        endpointArray[i].anchor.y = 0.10;
    }
}

function addTargetEndpoint(obj, isParent) {
    if (isParent) {
        var parentnode = obj;
    } else {
        var parentnode = obj.parentNode;
    }

    var targetEndpoints = getEndPointsOfElement(parentnode, "target");
    if (targetEndpoints.length < 7) {
        var ep = jsPlumb.addEndpoint(parentnode, targetEndpoint);
        var varName = String.fromCharCode(65 + targetEndpoints.length);
        ep.addOverlay([ "Label", { location:[0.5, 1.5], label:varName, cssClass:"endpointTargetLabel" } ]);
        fixEndpoints(parentnode);
    } else {
        alert("You can not add more than 10 input variables");
    }
}

function removeTargetEndpoint(obj) {
    var parentnode = obj.parentNode;
    var endpoints = jsPlumb.getEndpoints(parentnode);
    if (endpoints.length > 2) {
        jsPlumb.deleteEndpoint(endpoints[endpoints.length - 1]);
        fixEndpoints(parentnode);
    }
}


function feederLabelClick(id) {
    if (globalSensorInfo[id]["status"] == "red") {
        globalSensorInfo[id]["status"] = "black";
        $("#sensor_value_" + id).css("color", "black");
    } else {
        globalSensorInfo[id]["status"] = "red";
        $("#sensor_value_" + id).css("color", "red");
    }
}


function setFeederValue(id){
    var inputValue = $("#feeder_value_" + id).val();
    if(inputValue=="true" || inputValue=="false"){
        inputValue = inputValue == "true" ? true : false;
    }
    else{
         var temp = parseFloat(inputValue);
         if (!isNaN(temp)) {
             inputValue = temp;
         }
    }
    $("#sensor_value_" + id).text(inputValue);
    globalSensorInfo[id]["inputvalue"] = inputValue;
}

function getEndPointsOfElement(element, typeEndPoint) {
    var endPoints = jsPlumb.getEndpoints(element);
    switch (typeEndPoint) {
        case "source":
            var sourceEnpPoints = $.grep(endPoints, function (elementOfArray, indexInArray) {
                return elementOfArray.isSource;
            });
            return sourceEnpPoints;
            break;
        case "target":
            var targetEnpPoints = $.grep(endPoints, function (elementOfArray, indexInArray) {
                return elementOfArray.isTarget;
            });
            return targetEnpPoints;
            break;
        default:
            return endPoints;
            break
    }
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



