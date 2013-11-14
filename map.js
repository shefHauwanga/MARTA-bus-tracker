var MapObject = {
    atlanta: new google.maps.LatLng(33.775723, -84.388733),
    busCollection: {},
    atlMap: null,
    updateInterval: 1000,
    maxAcceptableAge: 1000 * 60 * 5,
    cleanseInterval: 1000 * 60 * 10
};

MapObject.initialize = function () {
    var that = this;

    if(typeof test_val === 'undefined') {
        that.call_sign = "helper.php";
    } else {
        var bus = that.getURLParameter('bus');
        that.call_sign = "helper.php?bus=" + bus;
    }

    var mapDiv = $("#map-canvas")[0];
    var mapOptions = {
        center: this.atlanta,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.atlMap = new google.maps.Map(mapDiv, mapOptions);

    this.queueBuses();

    $('#search-button').click(function() {
       if($('#bus-search-field').val() in that.busCollection)
           that.populateInfoBar(that.busCollection[$('#bus-search-field').val()]);
    });
}

MapObject.getURLParameter = function (sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');

    for (var i = 0; i < sURLVariables.length; i++){
        var sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] == sParam){
            return sParameterName[1];
        }
    }
}


/*
 Creates a new bus object.
 */
MapObject.initBus = function (busData) {
    var busPosition = new google.maps.LatLng(busData.latitude, busData.longitude);
    var image;
    var color;
    var that = this;

    if(busData.adherence < 0){
        if(busData.adherence >= -2)
            color = 'FFFF00';
        else 
            color = 'FF0000';
    } else {
        if(busData.adherence > 0)
            color = '4097ED';
        else
            color = '00FF00'
    }

    image = 'http://chart.googleapis.com/chart?chst=d_bubble_icon_text_small&chld=bus|bbT|' + busData.id + '|' + color;

    var busMarker = new google.maps.Marker({
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


    google.maps.event.addListener(busMarker, 'click', function() {
        that.populateInfoBar(busMarker);
    });

    that.busCollection[busData.id] = busMarker;
}

MapObject.populateInfoBar = function (busData){
    var text;
    var that = this;

    if($('#info-bar').css('display') === 'none') {
        $('#info-bar').slideToggle("slow");
    }        

    that.atlMap.setZoom(14);
    that.atlMap.setCenter(busData.getPosition());

    text = '<div id="bus-num">Bus# ' + busData.id + '.</div>';
    text += '<div id="bus-route">On route# ' + busData.routeNumber + '.</div>';
    text += '<div id="next-stop">Next stop: ' + busData.nextStop + '.</div>';
    text += '<div id="bus-direction">Heading ' + busData.busDirection + '.</div>';
    text += '<div id="bus-adherence">';

    if(parseInt(busData.lateness) < 0){
        if(parseInt(busData.lateness) >= -2)
            text += "<span id=\"un_peu_tard\">This bus is running " + Math.abs(parseInt(busData.lateness)) + ' minute(s) late.</span><br />';
        else
            text += "<span id=\"trop_tard\">This bus is running " + Math.abs(parseInt(busData.lateness)) + ' minutes late.</span><br />';
    } else {
        if(parseInt(busData.lateness) > 0) 
            text += '<span id="tres_tot">This bus is running ' + busData.lateness + ' minute(s) early</span>.<br />';
        else
            text += '<span id="parfait">This bus is running on time</span>.<br />';
    }

    text += '</div>';

    $("#bus-info").html(text);
}

MapObject.queueBuses = function (){
    var that = this;
    var busNum = []
    var color;

    $.ajax({
        "url": that.call_sign,
        "dataType": "json", 
        "type": "GET",
        "success": function (response) {
            $.each(response, function(index, obj) {
                busNum.push(obj.id);
                if(that.busCollection[obj.id] === undefined) {
                    that.initBus(obj);
                } else {
                    if((obj.latitude !== that.busCollection[obj.id].getPosition().lat().toString()) ||
                       (obj.longitude !== that.busCollection[obj.id].getPosition().lng().toString())) {
                        that.busCollection[obj.id].moveAnimation(new google.maps.LatLng(obj.latitude, obj.longitude));
                    }

                    that.busCollection[obj.id].nextStop = obj.nextStop;
                    that.busCollection[obj.id].routeNumber = obj.route;
                    that.busCollection[obj.id].lateness = obj.adherence;
                    that.busCollection[obj.id].busDirection = obj.direction;
                    that.busCollection[obj.id].modDate = Date.now();

                    color = 'FFFF00';

                    if(obj.adherence < 0){
                        if(obj.adherence >= -2)
                            color = 'FFFF00';
                        else 
                            color = 'FF0000';
                    } else {
                        if(obj.adherence > 0)
                            color = '4097ED';
                        else
                            color = '00FF00'
                    }

                    that.busCollection[obj.id].icon = 'http://chart.googleapis.com/chart?chst=d_bubble_icon_text_small&chld=bus|bbT|' + obj.id + '|' + color;
                }
            });
            $('#bus-search-field').autocomplete({
                source: busNum
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

        if(age >= that.maxAcceptableAge){
           val.setMap(null); 
           delete that.busCollection[key];
        }
    });
}

