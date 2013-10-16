var atlanta = new google.maps.LatLng(33.775723, -84.388733);
var busCollection = {};
var atlMap;
var ticksPerSecond = 1000;
var ticksPerMinutes = 60;
var updateInterval = ticksPerSecond;
var cleanseInterval = ticksPerSecond * ticksPerMinutes * 10;
var maxAcceptableAge = ticksPerSecond * ticksPerMinutes * 5

function initialize() {
    var mapDiv = $("#map-canvas")[0];
    var mapOptions = {
        center: atlanta,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    atlMap = new google.maps.Map(mapDiv, mapOptions);
    queueBuses();
}

function initBus(busData) {
    var busPosition = new google.maps.LatLng(busData.latitude, busData.longitude);
    var image;
    if(busData.adherence < 0){
        if(busData.adherence >= -2)
            image = 'images/yellow_bus.png';
        else 
            image = 'images/red_bus.png';
    } else {
        if(busData.adherence > 0)
            image = 'images/blue_bus.png';
        else
            image = 'images/green_bus.png';
    }
    var busMarker = new google.maps.Marker({
        position: busPosition,
        nextStop: busData.nextStop, //So a time point isn't just a stop, but
        routeNumber: busData.route,
        trip: busData.trip,
        lateness: busData.adherence,
        busDirection: busData.direction,
        icon: image,
        id: busData.id,
        motion: "static",
        map: atlMap 
    });

    google.maps.event.addListener(busMarker, 'mouseover', function() {
        var text = '<div id=\"bus_data\">';
        text += "This is bus #" + busMarker.id + " on route #" + busMarker.routeNumber + "<br />";
        if(parseInt(busMarker.lateness) < 0){
            if(parseInt(busMarker.lateness) >= -2)
                text += "<span id=\"un_peu_tard\">This bus is running " + Math.abs(parseInt(busMarker.lateness)) + ' minute(s) late.</span><br />';
            else
                text += "<span id=\"trop_tard\">This bus is running " + Math.abs(parseInt(busMarker.lateness)) + ' minutes late.</span><br />';
        } else {
            if(parseInt(busMarker.lateness) > 0) 
                text += '<span id="tres_tot">This bus is running ' + busMarker.lateness + ' minute(s) early</span>.<br />';
            else
                text += '<span id="parfait">This bus is running on time</span>.<br />';
        }
        text += 'Next stop: ' + busMarker.nextStop + '.<br />';
        text += '</div>';
        $("#about").html(text);
    });

    google.maps.event.addListener(busMarker, 'mouseout', function() {
        $("#about").html("This is a live map of the buses for Atlanta's MARTA system.");
    });

    busCollection[busData.id] = busMarker;
}

function queueBuses(){
    $.ajax({
        "url": "helper.php",
        "dataType": "json", 
        "type": "GET",
        "success": function (response) {
            $.each(response, function(index, obj) {
                if(busCollection[obj.id] === null) {
                    initBus(obj);
                } else {
                    if(busCollection[obj.id].motion === "static"){
                        if((obj.latitude !== busCollection[obj.id].getPosition().lat().toString()) ||
                           (obj.longitude !== busCollection[obj.id].getPosition().lng().toString())) {
                            busCollection[obj.id].moveAnimation(new google.maps.LatLng(obj.latitude, obj.longitude));
                        } 
                    }
                    busCollection[obj.id].nextStop = obj.nextStop;
                    busCollection[obj.id].routeNumber = obj.route;
                    busCollection[obj.id].lateness = obj.adherence;
                    busCollection[obj.id].busDirection = obj.direction;
                    busCollection[obj.id].modDate = Date.now();
                    busCollection[obj.id].icon = 'yellow_bus.png';
                    if(obj.adherence < 0){
                        if(obj.adherence >= -2)
                            busCollection[obj.id].icon = 'images/yellow_bus.png';
                        else 
                            busCollection[obj.id].icon = 'images/red_bus.png';
                    } else {
                        if(obj.adherence > 0)
                            busCollection[obj.id].icon = 'images/blue_bus.png';
                        else
                            busCollection[obj.id].icon = 'images/green_bus.png';
                    }
                }
            });
        },
        "error": function(xhr, ajaxOptions, thrownError) {
            $("#about").html("<div id=\"queue_problem\">There is a problem with queueing.<br /><br />" + xhr.status + "</div>");
        }
    });
}

function cleanseBuses() {
    var age;
    $.each(busCollection, function(key, val) {
        age = Date.now() - val.modDate;
        if(age > maxAcceptableAge){
           val.setMap(Null); 
           delete busCollection[key];
        }
    });
}

setInterval(function() {
    queueBuses();
}, updateInterval);

setInterval(function() {
    cleanseBuses();
}, cleanseInterval);
