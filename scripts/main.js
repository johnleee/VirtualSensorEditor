var hostname = 'http://einstein.sv.cmu.edu';
var sn_visualization = sn_visualization || {};
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

sn_visualization.main = (function () {

    var pollingWorker = {},

        pollingSensorStatus = function () {
            pollingWorker = new Worker('scripts/workers/floorViewWorker.js');
            pollingWorker.addEventListener(
                'message', function (e) {

                    if (!IsJsonString(e.data)) {
                        console.log(e.data);
                    }
                    else {
                        var data = JSON.parse(e.data);


                        // Update data in topologicalView and floorView
                        sn_visualization.topologicalView.updateStatus(data);
                        sn_visualization.floorViews.getView("cmusvFloors").updateDeviceStatus(data);

                        // Update data in dashboardView
                        var now = new Date();

                        for (var key in data) {
                            var
                                offset = now.getTime() - data[key] * 1000,
                                targetCard = $('#dashboardView .deviceCard[data-d_uri=' + key + ']');

                            if (targetCard.length == 0) {
                                var cardHTML =
                                    '<div class="deviceCard" data-d_uri="' + key + '">' +
                                        key +
                                        '</div>';
                                $('#dashboardView').append(cardHTML);
                                targetCard = $('#dashboardView .deviceCard[data-d_uri=' + key + ']');
                            }

                            targetCard.removeClass('badBlock avgBlock goodBlock');
                            if (offset > 3 * 60 * 1000) {
                                targetCard.addClass('badBlock');
                            }
                            else if (offset > 15 * 1000) {
                                targetCard.addClass('avgBlock');
                            }
                            else {
                                targetCard.addClass('goodBlock');
                            }
                        }

                        // Log received data into logView
                        $('#logView').append('Update received for device status at ' + (new Date()) + '<br>');
                        var logText = '{';
                        for (var key2 in data) {
                            logText += key2 + ' : ' + data[key2] + ' ';
                        }
                        logText += '}<br>';
                        $('#logView').append(logText);
                    }



                }, false
            );
            pollingWorker.postMessage({
                type: "START",
                url: "http://einstein.sv.cmu.edu/lastest_readings_from_all_devices/"
            });
        },
    //        Build d3 tree root > Gateway (SensorAndrew0 etc.) > Device (B...) > Sensors (temp, light etc.)
        buildSensorsObj = function (callback) {
            var snArch = { id: "root", name: "CMUSV", children: [] };
            var gatewayHash = {};
            var deviceTypeSensorsMap = {};

            $.getJSON(hostname + "/get_devices/json", function (data) {

                /* Parse the data */
                var deviceCount = data.length;
                for (var i = 0; i < deviceCount; ++i) {

                    var gatewayName = data[i].device_agent;
                    if (gatewayName == undefined || !gatewayName.match("^SensorAndrew")) {
                        continue
                    }
                    if (!gatewayHash.hasOwnProperty(gatewayName)) {
                        snArch.children.push({ type: "Gateway", id: "gateway" + String(i), name: gatewayName, data: {}, children: [] });
                        gatewayHash[gatewayName] = snArch.children.length - 1;
                    }

                    var deviceNode = {
                        type: "Device", d_uri: data[i].uri,
                        name: data[i].device_location,
                        data: {}, children: []
                    };

                    var deviceType = data[i].device_type;

                    if (deviceType in deviceTypeSensorsMap) {
                        var allSensors = deviceTypeSensorsMap[deviceType];
                        var sensorArray = allSensors.split(',');
                        $.each(sensorArray, function (index) {
                            deviceNode.children.push({ type: "Sensor", d_uri: deviceNode.d_uri, s_id: 0, d_name: deviceNode.name, name: sensorArray[index], data: {}, children: [] });
                        });

                    }
                    else {
                        $.ajax({
                            url: hostname + "/get_sensor_types/" + deviceType + "/json",
                            dataType: 'json',
                            async: false,
                            success: function (data) {
                                var allSensors = data.sensor_type;
                                var sensorArray = allSensors.split(',');
                                $.each(sensorArray, function (index) {
                                    deviceNode.children.push({ type: "Sensor", d_uri: deviceNode.d_uri, s_id: 0, d_name: deviceNode.name, name: sensorArray[index], data: {}, children: [] });
                                    deviceTypeSensorsMap[deviceType] =  allSensors
                                });
                            }
                        });
                    }


                    snArch.children[ gatewayHash[gatewayName]].children.push(deviceNode);
                }

                // Sort the devices by their names
                for (var key in gatewayHash) {
                    snArch.children[ gatewayHash[key] ].children.sort(
                        function (a, b) {
                            return (a.name < b.name) ? -1 : 1;
                        }
                    );
                }

                if (callback) {
                    callback(snArch);
                }
            });
        };

    return {

        initialize: function () {
            buildSensorsObj(sn_visualization.topologicalView.initialize);
            pollingSensorStatus();
        }
    };

})();


$(document).on('ready', function () {
    sn_visualization.main.initialize();
    var cmusvFloors = new sn_visualization.floorView();
    sn_visualization.floorViews.insertView("cmusvFloors", cmusvFloors);

    //$("#topologicalView").resizable({ handles: "e" });

    $('#geographicalView .hideBar').click(function () {
        $('#topologicalView').toggleClass('hidden');
        if ($(this).html() == '&lt;') {
            $(this).html('&gt;');
        }
        else {
            $(this).html('&lt;');
        }
    });

    $('#geographicalView .floorNode').click(function () {
        var deviceURI = $(this).attr("data-d_uri");
        if ($(this).hasClass("highlighted")) {
            sn_visualization.topologicalView.closeDevice(deviceURI);
        } else {
            sn_visualization.topologicalView.openDevice(deviceURI);
        }
        $(this).toggleClass("highlighted");
    });

    $('body').on('click', '.timeseriesClose', function () {
        var
            deviceURI = $(this).parent().attr('data-d_uri');
        metricId = $(this).parent().attr('data-s_id');
        console.log(deviceURI);
        console.log(metricId);
        sn_visualization.timeseriesView.remove(deviceURI, metricId);
        sn_visualization.topologicalView.closeSensor(deviceURI, metricId);
    });

    $('#dashFilter li').click(function () {
        $('#dashFilter li').removeClass('active');
        $(this).addClass('active');
        switch ($(this).html()) {
            case "all":
                $('.deviceCard').removeClass('hidden');
                break;
            case "good":
                $('.deviceCard').addClass('hidden');
                $('.deviceCard.goodBlock').removeClass('hidden');
                break;
            case "avg":
                $('.deviceCard').addClass('hidden');
                $('.deviceCard.avgBlock').removeClass('hidden');
                break;
            case "bad":
                $('.deviceCard').addClass('hidden');
                $('.deviceCard.badBlock').removeClass('hidden');
                break;
        }
    })


    $('#menuBar nav li').click(function () {
        switch ($(this).html()) {
            case "Dashboard":
                $('#dashboardView').toggleClass('hidden');
                break;
            /*case "FloorView":
             $('.view').hide();
             $('#geographicalView, #geographicalView').show();
             break;*/
            case "Log":
                $('#logView').toggleClass('hidden');
                break;
        }
    })

});
