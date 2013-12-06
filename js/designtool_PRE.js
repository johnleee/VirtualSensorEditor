//hostname = "http://tool.azurewebsites.net/Default.aspx"
//hostname = "http://cmu-sds.herokuapp.com"
//hostname = "http://cmu-sensor-network.herokuapp.com";
hostname = 'http://einstein.sv.cmu.edu';


//latest global sensor data
globalPhysicalSensorData = {};

var templates_counter = 0;
var feederCounter = 0;

//object to store all virtual sensors definition and templates definition
var storageObj = new Object;
storageObj["ROOT"] = new Object;
storageObj["ROOT"]["VIRTUAL_SENSORS"] = new Object;
storageObj["ROOT"]["SETTINGS"] = new Object;
var patternVirtualSensorName = /^[a-z0-9_]{4,}$/i;

//last reading time for each device
last_reading_time_for_all_devices = {};


//global device value
globalDeviceValue = {};

//global sensor information
globalSensorInfo = {};

var globalSensorChartsInfo = new Array();


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
	sourceEndpoint2 = {
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
        anchors:[ "RightMiddle"]
    },
// a source endpoint that sits at BottomCenter
//	bottomSource = jsPlumb.extend( { anchor:"BottomCenter" }, sourceEndpoint),
// the definition of target endpoints (will appear when the user drags a connection)
    targetEndpoint = {
        endpoint:"Dot",
        paintStyle:{ fillStyle:"#2e2aF8", radius:7},
        hoverPaintStyle:endpointHoverStyle,
        maxConnections:2,
        dropOptions:{ hoverClass:"hover", activeClass:"active" },
        isTarget:true,
        anchor:[0.2, 0, 0, -1]

    },
    outputEndpoint = {
        endpoint:"Dot",
        paintStyle:{ fillStyle:"#2e2aF8", radius:7 },
        hoverPaintStyle:endpointHoverStyle,
        maxConnections:2,
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
            [ "Arrow", { location:0.25 } ]
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
        $("#accordion").accordion({autoHeight:true, collapsible:true});

    });

});


function createNewElementInCanvas(type, x, y, data, uuid) {

    if (typeof uuid === 'undefined') {
        var id = createUUID("");
    } else {
        var id = uuid;
    }

    switch (type) {
        case 'algorithm':
            createNewAlgorithmInCanvas(id, data);
            break;
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
		case 'cf_decision':
            createNewControlFlowInCanvas(id, data);
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
    $("#" + id).append("<div id='vsFuncCont_" + id + "'><div class='sensor_value' id='sensor_value_" + id + "'>0</div>");
    $("#" + id).append("<input type='hidden' id='hidden_field_status_sensor_value_" + id + "'  />");
    $("#" + id).append("<input type='hidden' id='hidden_field_status_sensor_value_" + id + "' /></div>");
    $("#" + id).append("<div class='vsChartContainer' id='vsChartCont_" + id  + "' >&nbsp</div>");
    globalSensorInfo[id] = { "category": "physical", "sensorType": data.type, "deviceID":data.device_id };

    globalSensorChartsInfo[id] = dvl();
    setupChart(id, 180, 120);

    globalSensorInfo[id] = { "category":"physical", "sensorType":data.sensorType, "deviceID":data.deviceID, "name":data.name};
    var setIntervalId = setInterval(function () {
        $("#sensor_value_" + id).css("color", readSensorStatus(id));
        var temp = readSensorData(id, true);
        $("#sensor_value_" + id).html(temp);
        if ((typeof temp == 'boolean')){
            globalSensorChartsInfo[id].value(temp);
        }else{
            if (temp > 0){
                globalSensorChartsInfo[id].value(temp);
            }
        }
    }, 3000);
    globalSensorInfo[id]["setIntervalId"] = setIntervalId;
}

function createNewVirtualSensorInCanvas(id, data) {
    $('<div class="window" id="' + id + '" >').appendTo('#design_canvas');
    jsPlumb.addEndpoint($("#" + id), sourceEndpoint);
    $("#" + id).append("<div class='label label-virtual' id='label_" + id + "'>" + data.name + "</div>");
    $("#" + id).append("<div id='vsFuncCont_" + id + "'><div class='sensor_value' id='sensor_value_" + id + "'>0</div></div>");
    $("#" + id).append("<div class='vsChartContainer' id='vsChartCont_" + id  + "' >&nbsp</div>");
    unfoldVirtualSensor(data.name);
    globalSensorInfo[id] = {"category":"virtual", "name":data.name, "source": storageObj["ROOT"]["VIRTUAL_SENSORS"][data.name]["components"][0]["uuid"]};
    globalSensorChartsInfo[id] = dvl();
    setupChart(id, 180, 120);

    var setIntervalId = setInterval(function () {
        $("#sensor_value_" + id).css("color", readSensorStatus(id));
        var temp = readSensorData(id, true);
        $("#sensor_value_" + id).html(temp);
        if ((typeof temp == 'boolean')){
            globalSensorChartsInfo[id].value(temp);
        }else{
            if (temp > 0){
                globalSensorChartsInfo[id].value(temp);
            }
        }
    }, 1000);

    globalSensorInfo[id]["setIntervalId"] = setIntervalId;
}

function createNewTemplateInCanvas(id, data) {
    if (typeof data.expression != 'undefined') {
        var expression = data.expression;
    }else{
        var expression = "";
    }
    $('<div class="window" id="' + id + '" >').appendTo('#design_canvas');
    $("#" + id).append("<span class='label label-template' id='label_" + id + "'>" + data.name + "_" + templates_counter++ + "</span>"+
    "&nbsp; <span class='removeEndPoint' onclick='removeTargetEndpoint(this);'> -</span>(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)<span class='addEndPoint' onclick='addTargetEndpoint(this);'>+</span><br/>" +
    "<div class='vsFunctionContainer' id='vsFuncCont_" + id + "'><textarea class='code_textarea' id=textarea_" + id + " contenteditable='true'>" + expression + "</textarea><br/>"+
    "<input type='button' class='btn' value='Set' name='" + id + "' onclick='setCustomFunction(\"" + id + "\");'  />"+
    "&nbsp; &nbsp; &nbsp; <span class='sensor_value' style='display:inline-block;' id='sensor_value_" + id + "' >0</span>"+
    "<input type='hidden' id='hidden_code_" + id + "' />"+
    "<input type='hidden' id='hidden_field_is_valid_" + id + "' value='false' />"+
    "<input type='hidden' id='hidden_field_status_sensor_value_" + id + "' />"+
    "<input type='hidden' id='hidden_field_uuid_" + id + "' value='" + createUUID("c") + "'/></div>"+
    "<div class='vsChartContainer' no id='vsChartCont_" + id  + "' >&nbsp</div>");
    jsPlumb.addEndpoint($("#" + id), sourceEndpoint);

    if (typeof data.children != 'undefined' && data.children.length > 1) {
        for (var i = 0; i < data.children.length; i++) {
            addTargetEndpoint($("#" + id), true);
        }
    } else {
        addTargetEndpoint($("#" + id), true);

    }

    globalSensorInfo[id] = {"category":"custom", name: data.name};
    globalSensorChartsInfo[id] = dvl();
    setupChart(id, 275, 195);
    var setIntervalId = setInterval(function () {
        if ($("#hidden_field_is_valid_" + id).val() === "false")
            return;
        $("#sensor_value_" + id).css("color", readSensorStatus(id));
        var temp = readSensorData(id, true);
        $("#sensor_value_" + id).html(temp);
        globalSensorChartsInfo[id].value(temp);
    }, 1000);

    globalSensorInfo[id]["setIntervalId"] = setIntervalId;
}

function setDecisionBranches(id, id2) {
	setCustomFunction(id);
	setCustomFunction(id2);
}
function toggleFlag(value){
   var toggle = value ? new Boolean(false) : new Boolean(true);
   return toggle;
}

function createNewControlFlowInCanvas(id, data) {
	var id2 = createUUID("");
    if (typeof data.expression != 'undefined') {
        var expression = data.expression;
    }else{
        var expression = "";
    }
    $('<div class="window" id="' + id + '" >').appendTo('#design_canvas');
    $("#" + id).append("<div class='shape ui-draggable _jsPlumb_endpoint_anchor_'>" +
		"<textarea class='code_cfdecision' id=textarea_" + id + " contenteditable='true'>" + expression + "</textarea><br/>" +
    	"<input type='button' class='btn' value='Set' name='" + id + "' onclick='setDecisionBranches(\"" + id + "\", \"" + id2 + "\");'  />" +
		"&nbsp; &nbsp; &nbsp; <span class='sensor_value' style='display:inline-block;' id='sensor_value_" + id + "' >False</span>"+
		"&nbsp; &nbsp; &nbsp; <span class='sensor_value' style='display:inline-block; float:right;' id='sensor_value_" + id2 + "' >False</span>"+
    	"<input type='hidden' id='hidden_code_" + id + "' />"+
    	"<input type='hidden' id='hidden_field_is_valid_" + id + "' value='false' />"+
	    "<input type='hidden' id='hidden_field_status_sensor_value_" + id + "' />"+
    	"<input type='hidden' id='hidden_field_uuid_" + id + "' value='" + createUUID("c") + 
		"<input type='hidden' id='hidden_code_" + id2 + "' />"+
    	"<input type='hidden' id='hidden_field_is_valid_" + id2 + "' value='false' />"+
	    "<input type='hidden' id='hidden_field_status_sensor_value_" + id2 + "' />"+
    	"<input type='hidden' id='hidden_field_uuid_" + id2 + "' value='" + createUUID("d") + 
		"'/></div>");
	
	jsPlumb.addEndpoint($("#" + id), sourceEndpoint);
	jsPlumb.addEndpoint($("#" + id), sourceEndpoint2);


    if (typeof data.children != 'undefined' && data.children.length > 1) {
        for (var i = 0; i < data.children.length; i++) {
            addTargetEndpoint($("#" + id), true);
        }
    } else {
        addTargetEndpoint($("#" + id), true);		
    }

    globalSensorInfo[id] = {"category":"custom", name: data.name};
    globalSensorChartsInfo[id] = dvl();
    setupChart(id, 275, 195);
	
    var setIntervalId = setInterval(function () {
        if ($("#hidden_field_is_valid_" + id).val() === "false")
            return;
        $("#sensor_value_" + id).css("color", readSensorStatus(id));
		$("#sensor_value_" + id2).css("color", readSensorStatus(id));
        var temp = readSensorData(id, true);
		$("#sensor_value_" + id).html(temp);	
		if (temp == true) {	
			$("#sensor_value_" + id2).html(new Boolean(false));
		}
		else {
			$("#sensor_value_" + id2).html(new Boolean(true));
		}
       
        globalSensorChartsInfo[id].value(temp);
		jsPlumb.repaintEverything();
		
    }, 1000);

    globalSensorInfo[id]["setIntervalId"] = setIntervalId;
}

function createNewAlgorithmInCanvas (id, data) {
  createNewTemplateInCanvas(id, data);
  var $textarea = $('#textarea_' + id);
  var name = data.name;
  var expressions = {
    AVERAGE: function (args) {
      var sum = args.reduce(function (sum, x) {
        return sum + x;
      }, 0);
      return sum / args.length;
    },
    MAX: function (args) {
      return Math.max.apply(Math, args);
    },
    MIN: function (args) {
      return Math.min.apply(Math, args);
    },
    CO2: function (args) {
      /*
      private static double pep;
      private static double transient_pep;
      private static double steady_pep; 
      private static double V; //the space air volume,ft^3
      private static double N; //the space CO2 concentration at the present time step, ppm
      private static double N_back; //the space CO2 concentration one time step back, ppm
      private static double time_step; //the time step, min
      private static double SA; //the supply airflow rate, scfm
      private static double Ci; //the CO2 concentration in the supply air, ppn
      private static double G; // the CO2 generation rate per person, scfm

      public static void inputdata_initial(double air_space, double present_CO2, double timeback_CO2,double time_step_min, double supply_airflow_rate, double supply_air_CO2, double generation_CO2){
        V = air_space;
        N = present_CO2;
        N_back = timeback_CO2;
        time_step = time_step_min;
        SA = supply_airflow_rate;
        Ci = supply_air_CO2;
        G = generation_CO2;
      }
      
      public static void transient_term()
      {
        transient_pep = V * (N - N_back) / (time_step* G * 1000000);
      }
      
      public static void steady_term()
      {
        steady_pep = SA * (N - Ci)/(G * 1000000);
      }
      
      public static void compute_occupancy(){
        //pep = (V * (N - N_back) / time_step + SA * (N - Ci))/(G * 1000000);
        pep = transient_pep + steady_pep;
      }  
      */
      var V = args[0]         ; // air_space
      var N = args[1]         ; // present_CO2
      var N_back = args[2]    ; // timeback_CO2
      var time_step = args[3] ; // time_step_min
      var SA = args[4]        ; // supply_airflow_rate
      var Ci = args[5]        ; // supply_airflow_CO2
      var G = args[6]         ; // genereation_CO2

      return V * (N - N_back) / (time_step* G * 1000000) +
        SA * (N - Ci)/(G * 1000000);
    }
  };
  var expr = 'var args = [].slice.call(arguments); return (' + expressions[name].toString() + ')(args);';
  $textarea.val(expr).hide();
}

function createNewFeederInCanvas(id, data) {
    $('<div class="window" id="' + id + '" >').appendTo('#design_canvas');
    var name = "FEEDER_" + feederCounter++;
    $("#" + id).append("<div class='label' id='label_" + id + "'>" + name + "</div>");
    if (typeof data.inputvalue != 'undefined'){
       var inputvalue = data.inputvalue;
    }else{
       var inputvalue = "0";
    }
    $("#" + id).append("<br/><input type='text' style='width: 80px;margin-bottom: 4px;' value='" + inputvalue + "' id='feeder_value_" + id + "' /> &nbsp;");
    $("#" + id).append("<input type='button' class='btn' style='margin-bottom: 4px;' value='Set' name='" + id + "' onclick='setFeederValue(\"" + id + "\")'  /><br/>");
    $("#" + id).append("<div class='sensor_value'  id='sensor_value_" + id + "' name='" + id + "' onclick='feederLabelClick(\"" + id + "\")'>0</div>");
    $("#" + id).append("<input type='hidden' id='hidden_field_status_sensor_value_" + id + "' value='red' />");

    globalSensorInfo[id] = { "category":"feeder", "status":"red", "inputvalue":inputvalue};
    jsPlumb.addEndpoint($("#" + id), sourceEndpoint);
}

function createNewMonitorInCanvas(id, data) {
    $('<div class="window" id="' + id + '" >').appendTo('#design_canvas');
    var name = "Status Monitor";
    $("#" + id).append("<div class='label' id='label_" + id + "'>" + name + "</div>");
    $("#" + id).append("<div class='siren_image' id='image_" + id + "' hidden='true'><img src='img/red_siren.gif'></div><br/>");
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

$('#temp').html('');
$.each(idReadableMapping, function (key, val) {
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
}, 10000);

setInterval(function () {
    sensorTimer("light");
}, 10000);

setInterval(function () {
    sensorTimer("humidity");
}, 10000);

setInterval(function () {
    sensorTimer("audio_p2p");
}, 10000);

setInterval(function () {
    sensorTimer("motion");
}, 10000);

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
	console.log(str);
	console.log("deviceId: " + deviceID + " category: " + category + " name: " + name);
	
    if (category === "template" || category === "virtual" || category === "feeder" || category==="monitor" ||
        category === 'algorithm' || category === "cf_decision") {
        createNewElementInCanvas(category, ev.clientX, ev.clientY, {name:name});
    } else {
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
        endpointArray[i].anchor.x = 0.32 + ((i + 1) / div) * 0.65;
        endpointArray[i].anchor.y = 0;
    }
}

function addTargetEndpoint(obj, isParent) {
    if (isParent) {
        var parentnode = obj;
    } else {
        var parentnode = obj.parentNode;
    }

    var targetEndpoints = getEndPointsOfElement(parentnode, "target");
    if (targetEndpoints.length < 12) {
        var ep = jsPlumb.addEndpoint(parentnode, targetEndpoint);
        var varName = String.fromCharCode(65 + targetEndpoints.length);
        ep.addOverlay([ "Label", { location:[0.5, 1.8], label:varName, cssClass:"endpointTargetLabel" } ]);
        fixEndpoints(parentnode);
    } else {
        alert("You can not add more than 7 input variables");
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




function setupChart(id, chartWidth, chartHeight){
    var data = dvl.recorder({
        data:globalSensorChartsInfo[id],
        value:'value',
        timestamp:'time',
        max:90
    })

    var getX = dvl.acc('time');
    var getY = dvl.acc('value');
    var margin = { top:5, bottom:20, left:0, right:23 };
    var width = dvl(chartWidth);
    var height = dvl(chartHeight);
    var innerWidth = dvl.op.sub(width, margin.left, margin.right);
    var innerHeight = dvl.op.sub(height, margin.top, margin.bottom);
    var transition = { duration:300 }

    var svg = dvl.bind({
        parent:d3.select('#vsChartCont_'+ id),
        self:'svg',
        attr:{
            width:width,
            height:height
        }
    });

    var offsetGroup = dvl.bind({
        parent:svg,
        self:'g.offset',
        attr:{
            transform:'translate(' + margin.left + ',' + margin.top + ')'
        }
    });

    var clipPathId = dvl.svg.clipPath({
        parent:offsetGroup,
        width:innerWidth,
        height:innerHeight
    });

    var vis = dvl.bind({
        parent:offsetGroup,
        self:'g.vis',
        attr:{
            'clip-path':clipPathId
        }
    });

    var visTicks = dvl.bind({
        parent:offsetGroup,
        self:'g.ticks'
    });

    dvl.bind({
        parent:vis,
        self:'rect.background',
        attr:{
            width:innerWidth,
            height:innerHeight
        }
    });

    var sx = dvl.apply(
        [data, innerWidth, getX],
        function (data, width, fn) {
            if (!data.length) return null
            return d3.time.scale()
                .domain([fn(data[0]), fn(data[data.length - 1])])
                .range([0, width])
        }
    );
    var sxTicks = sx.apply(function (d) {
        //return d.ticks(7)
        return d.ticks(d3.time.minutes, 1)
    });
    var sxTickFormat = sx.apply(function (d) {
        //return d.tickFormat(7)
        return d.tickFormat(d3.time.minutes)
    });

    var sy = dvl.apply(
        [data, innerHeight, getY],
        function (data, height, fn) {
            if (!data.length) return null;
            return d3.scale.linear()
                .domain([d3.min(data, fn)*0.985, d3.max(data, fn)*1.015])
                .range([height, 0])
        }
    );
    var syTicks = sy.apply(function (d) {
        return d.ticks(10)
    });
    var syTickFormat = sy.apply(function (d) {
        return d.tickFormat(10)
    });

    dvl.bind({
        parent:vis,
        self:'line.x-ticks',
        data:sxTicks,
        join:String,
        attr:{
            x1:sx,
            y1:0,
            x2:sx,
            y2:innerHeight
        },
        transition:transition
    });

    dvl.bind({
        parent:visTicks,
        self:'text.x-ticks',
        data:sxTicks,
        join:String,
        attr:{
            x:sx,
            y:innerHeight,
            dy:'1.2em'
        },
        text:sxTickFormat,
        transition:transition
    });

    dvl.bind({
        parent:vis,
        self:'line.y-ticks',
        data:syTicks,
        join:String,
        attr:{
            x1:0,
            y1:sy,
            x2:innerWidth,
            y2:sy
        },
        transition:transition
    });

    dvl.bind({
        parent:visTicks,
        self:'text.y-ticks',
        data:syTicks,
        join:String,
        attr:{
            x:innerWidth,
            y:sy,
            dx:'4px',
            dy:'.35em'
        },
        text:syTickFormat,
        transition:transition
    });

    var lineFn = dvl.apply(
        [sx, getX, sy, getY],
        function (sx, ax, sy, ay) {
            return d3.svg.line()
                .interpolate("basis")
                .x(function (d) {
                    return sx(ax(d));
                })
                .y(function (d) {
                    return sy(ay(d));
                })
        }
    );

    dvl.bind({
        parent:vis,
        self:'path.dvl',
        data:dvl.op.list(data),
        attr:{
            d:lineFn
        },
        transition:transition
    });
}

function codeView(elem, askConfirmation) {
    $('#vsFuncCont_'+elem.id).css('visibility','visible');
    $('#vsFuncCont_'+elem.id).show();
    $('#vsChartCont_'+elem.id).css('visibility','hidden');
    $('#vsChartCont_'+elem.id).hide();
    jsPlumb.repaintEverything();
}

function timeSeriesView(elem, askConfirmation) {
    $('#vsFuncCont_'+elem.id).css('visibility','hidden');
    $('#vsFuncCont_'+elem.id).hide();
    $('#vsChartCont_'+elem.id).css('visibility','visible');
    $('#vsChartCont_'+elem.id).show();
    jsPlumb.repaintEverything();
}

function toggleViewMode(mode){
    for (var id in globalSensorChartsInfo) {
        if (mode == 'code'){
            codeView({id:id}, false);
        }else{
            timeSeriesView({id:id}, false);
        }
    }
}

function startIntro(){
    var intro = introJs().onchange(function(targetElement) {
        $(targetElement).show();
        //alert(targetElement);
    });
    intro.setOptions({
        steps: [
            {
                element: document.querySelector('#temp'),
                intro: "These are physical sensors. You can drag ...",
                position: 'right'
            },
            {
                element: '#design_canvas',
                intro: "&nbsp;&nbsp;&nbsp;&nbsp;and drop them here --> <br>&nbsp;&nbsp;&nbsp;&nbsp;This is the <strong>canvas</strong>",
                position: 'left'
            },
            {
                element: '#virtual_sensors_templates',
                intro: 'These are the building blocks',
                position: 'right'
            },
            {
                element: '#template1',
                intro: "Use FUNCTION to define the virtual sensor logic. You can use Javascript.",
                position: 'bottom'
            },
            {
                element: '#template1',
                intro: "Just drag it to the canvas and <strong>connect</strong> the physical sensors to the FUNCTION <strong>parameters</strong>",
                position: 'bottom'
            },
            {
                element: '#template1',
                intro: "Then write some code like:<br/><br/><strong>return [A, B, C].mean();</strong><br/><br/><small>This will return the mean of the parameters</small>",
                position: 'bottom'
            },
            {
                element: '#help',
                intro: "Here is the list of all statistical functions currently supported",
                position: 'bottom'
            },
            {
                element: '#viewMode',
                intro: 'While editing a virtual sensor, try the graph view!',
                position: 'right'
            },
            {
                element: document.querySelector('#virtual_sensors_instances_title'),
                intro: 'Once you finish ... <br/>All the saved virtual sensors will be here. Enjoy!',
                position: 'right'
            }
        ]
    });

    intro.start();
}

function bindToggleEvent() {
    $('#data-source-toggle').click(function () {
        using_fake_data = !using_fake_data;
        $(this).text(using_fake_data ? 'TEST' : 'PROD');
    });
}

bindToggleEvent();
