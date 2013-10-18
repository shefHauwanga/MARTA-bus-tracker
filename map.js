var MapObject = {
    atlanta: new google.maps.LatLng(33.775723, -84.388733),
    busCollection: {},
    atlMap: null,
    ticksPerSecond: 1000,
    ticksPerMinutes: 60,
    updateInterval: this.ticksPerSecond,
    cleanseInterval: this.ticksPerSecond * this.ticksPerMinutes * 10,
    maxAcceptableAge: this.ticksPerSecond * this.ticksPerMinutes * 5
};

MapObject.initialize = function () {
    var mapDiv = $("#map-canvas")[0];
    var mapOptions = {
        center: this.atlanta,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.atlMap = new google.maps.Map(mapDiv, mapOptions);

    this.queueBuses();
}

/*
 Creates a new bus object.
 */
MapObject.initBus = function (busData) {
    var busPosition = new google.maps.LatLng(busData.latitude, busData.longitude);
    var image;
    var that = this;

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
        motion: "static",
        position: busPosition,
        nextStop: busData.nextStop, //So a time point isn't just a stop, but
        routeNumber: busData.route,
        trip: busData.trip,
        lateness: busData.adherence,
        busDirection: busData.direction,
        icon: image,
        id: busData.id,
        map: that.atlMap 
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

    that.busCollection[busData.id] = busMarker;
}

MapObject.queueBuses = function (){
    var that = this;

    $.ajax({
        "url": "helper.php",
        "dataType": "json", 
        "type": "GET",
        "success": function (response) {
            $.each(response, function(index, obj) {
                if(that.busCollection[obj.id] === undefined) {
                    that.initBus(obj);
                } else {
                    if(that.busCollection[obj.id].motion === "static"){
                        if((obj.latitude !== that.busCollection[obj.id].getPosition().lat().toString()) ||
                          (obj.longitude !== that.busCollection[obj.id].getPosition().lng().toString())) {
                            that.busCollection[obj.id].moveAnimation(new google.maps.LatLng(obj.latitude, obj.longitude));
                        } 
                    }

                    that.busCollection[obj.id].nextStop = obj.nextStop;
                    that.busCollection[obj.id].routeNumber = obj.route;
                    that.busCollection[obj.id].lateness = obj.adherence;
                    that.busCollection[obj.id].busDirection = obj.direction;
                    that.busCollection[obj.id].modDate = Date.now();
                    that.busCollection[obj.id].icon = 'yellow_bus.png';

                    if(obj.adherence < 0){
                        if(obj.adherence >= -2)
                            that.busCollection[obj.id].icon = 'images/yellow_bus.png';
                        else 
                            that.busCollection[obj.id].icon = 'images/red_bus.png';
                    } else {
                        if(obj.adherence > 0)
                            that.busCollection[obj.id].icon = 'images/blue_bus.png';
                        else
                            that.busCollection[obj.id].icon = 'images/green_bus.png';
                    }
                }
            });
        },
        "error": function(xhr, ajaxOptions, thrownError) {
            $("#about").html("<div id=\"queue_problem\">There is a problem with queueing.<br /><br />" + xhr.status + "</div>");
        }
    });

    setTimeout(function() {
        that.queueBuses();
    }, that.updateInterval);

    setTimeout(function() {
        that.cleanseBuses();
    }, that.cleanseInterval);
}

MapObject.cleanseBuses = function () {
    var age;
    var that = this;

    $.each(that.busCollection, function(key, val) {
        age = Date.now() - val.modDate;

        if(age > this.maxAcceptableAge){
           val.setMap(Null); 
           delete busCollection[key];
        }
    });
}

