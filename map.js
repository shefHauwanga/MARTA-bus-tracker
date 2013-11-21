$(document).ready(function(){
    $('#info-bar').hide();
});

var MapObject = {
    atlanta: new google.maps.LatLng(33.775723, -84.388733),
    busCollection: {},
    atlMap: null,
    updateInterval: 1000,
    maxAcceptableAge: 1000 * 60 * 5,
    cleanseInterval: 1000 * 60 * 10,
    up: 0
};

MapObject.initialize = function () {
    var that = this;
    that.bus_var = that.getURLParameter('bus');
    that.trip_var = that.getURLParameter('trip');

    var mapDiv = $("#map-canvas")[0];
    var mapOptions = {
        panControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
        },
        center: this.atlanta,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.atlMap = new google.maps.Map(mapDiv, mapOptions);

    $("#about").html(this.mainText());

    $('#hire-me-button').click(function(e){
        MapObject.mapModal.open({content: "Hows it going?"});
	e.preventDefault();
    });


    if(typeof that.bus_var === 'undefined') {
        that.call_sign = "helper.php";

        $('#stop_list').remove();
        $('#stop_head').remove();
    } else {
        $('#click-bar').remove();
        $('#info-bar').remove();

        that.call_sign = "helper.php?bus=" + that.bus_var;

        if(typeof that.trip_var !== 'undefined')
            that.trip_call = "helper.php?trip_id=" + that.trip_var;

        MapObject.queueRoute();
    }

    that.queueBuses();

    $('#click-bar').click(function() {
        MapObject.menuDrop()
    });

    $('#search-button').click(function() {
       if($('#bus-search-field').val() in that.busCollection)
           that.populateInfoBar(that.busCollection[$('#bus-search-field').val()]);
    });

    $('#bus-search-field').keypress(function(event) {
        if(event.which === 13)
           that.populateInfoBar(that.busCollection[$('#bus-search-field').val()]);
    });
}


MapObject.menuDrop = function () {
    var change;
    var that = this;
      
    if (that.up % 2 === 0) {
        change = "+=90px";
    } else {
        change = "-=90px";
    }   
  
    $('#info-bar').slideToggle("slow");
    $('#hire-me-button').animate({top: change}, 550);
    that.up++;
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
        busColor: color,
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
        $("#about").html(that.mainText());
    });

    google.maps.event.addListener(busMarker, 'click', function() {
        that.populateInfoBar(busMarker);
    });

    that.busCollection[busData.id] = busMarker;
}

MapObject.mainText = function() {
    var that = this;
    var msg_text = "This is a live map of the buses for Atlanta's MARTA system.";

    if(typeof that.bus_var !== 'undefined')
        msg_text += '<br /><br /><div><a href="/martaBusTracker/">Return to main map.</a></div>';

    return msg_text;
}

MapObject.stopReload = function() {
    return false;
}

MapObject.populateInfoBar = function (busData){
    var text;
    var that = this;

    if($('#info-bar').css('display') === 'none') {
        that.menuDrop();
        /*$('#info-bar').slideToggle("slow");*/
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
    if(typeof that.bus_var === 'undefined') {
        if(busData.trip !== "0")
            text += '<div id="bus-link"><a href="?bus=' + busData.id + '&trip=' + busData.trip + '">Click here to see a route map for this bus.</a><div>';
    } else {
        text += '<div id="bus-link"><a href="/martaBusTracker">Click here to return to main map.</a><div>';
    }

    $("#bus-info").html(text);
}


MapObject.queueRoute = function (){
    var that = this;
    that.stop_collection = {};

    $.ajax({
        "url": that.trip_call,
        "dataType": "json", 
        "type": "GET",
        "success": function (response) {
            that.routeName = response['name'];
            that.drawStops(response['stops']);
            that.drawRoute(response['shape']);
        }, "error": function(xhr, ajaxOptions, throwError){
            $("#about").html("<div id=\"queue_problem\">There is a problem with the map drawing.<br /><br />" + xhr.status + "</div>");
        }
    });
}

MapObject.drawRoute = function (shape_data){
    var that = this;
    var shape_array = [];
    var color = that.busCollection[that.bus_var].busColor;

    $.each(shape_data, function (index, obj) {
        var pos = new google.maps.LatLng(obj.shape_pt_lat, obj.shape_pt_lon);
        shape_array.push(pos);
    });

    var routePath = new google.maps.Polyline({
        path: shape_array,
        strokeColor: '#' + color,
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    routePath.setMap(that.atlMap);
}

MapObject.drawStops = function (stop_data){
    var that = this;
    var color = that.busCollection[that.bus_var].busColor;
    var route = that.busCollection[that.bus_var].routeNumber;
    var size = 0;
    
    $("#stop_head").html('<div id="stop_head_text">Stops for bus #' + that.bus_var + '<br/> on route #' + route +  '</div>');

    $("#about").css({"top": "40px"});
    $("#stop_head_text").css({"color": "#" + color});

    $.each(stop_data, function(index, obj) {
        size += 1;
        var pos = new google.maps.LatLng(obj.lat, obj.lon);
        var stop_text;

        var stopMarker = new google.maps.Marker({
            position: pos,
            title: obj.name,
            animation: google.maps.Animation.DROP,
            count: index,
            stop_name:obj.name,
            icon: "/martaBusTracker/images/stop.png",
            arrival_time: obj.arrival_time,
            departure_time: obj.departure_time,
            map: that.atlMap
        });

        var selector_name = 'stop-' + size;

        stop_text = '<div id="' + selector_name + '"><a href="#">Stop #' + size + '</a>: <br />Stop name: ' + stopMarker.title;
        stop_text += '<div>Arrival time : ' + stopMarker.arrival_time + '.</div></div>';

        $("#stop_list").append(stop_text);
 
        $("#" + selector_name).click(function(){
            that.atlMap.setZoom(18);
            
            that.atlMap.setCenter(stopMarker.getPosition());
        });

        $("#" + selector_name).css({"border-bottom": "2px solid #e8930c", "margin-bottom" : "10px", "padding-bottom" : "10px"});

        google.maps.event.addListener(stopMarker, 'mouseout', function() {
            $("#about").html(that.mainText());
        });

        google.maps.event.addListener(stopMarker, 'mouseover', function() {
            var text = '<div id=\"stop_data\">';
            text += "This is stop is " + stopMarker.title + ".<br /><br />";
            text += "The arrival time is " + stopMarker.arrival_time + ".<br />";
            text += '</div>';

            $("#about").html(text);
        });

        that.stop_collection[index] = stopMarker;
    });

    that.atlMap.setZoom(14);
    that.atlMap.setCenter(that.stop_collection[Math.floor(size/2)].getPosition());
    
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
                    that.busCollection[obj.id].trip = obj.trip;
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

                    that.busCollection[obj.id].busColor = color;
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

MapObject.mapModal = (function() {
    var method = {};
    var overlay;
    var modal;
    var content;
    var close;

    method.center = function () {
        var tipTop, left;
        
        tipTop = Math.max($(window).height() - modal.outerHeight(), 0) / 2;
        left = Math.max($(window).width() - modal.outerWidth(), 0) / 2;

        modal.css({
            tipTop: tipTop + $(window).scrollTop(),
            left: left + $(window).scrollLeft()
        });
    };

    method.open = function (settings) {
        content.empty().append(settings.content);

        modal.css({
            width: settings.width || 'auto', 
            height: settings.height || 'auto'
        });

        method.center();

        $(window).bind('resize.modal', method.center);

        modal.show();
        overlay.show();
    };

    method.close = function () {
        modal.hide();
        overlay.hide();
        content.empty();
        $(window).unbind('resize.modal');
    };

    overlay = $('<div id="overlay"></div>');
    modal = $('<div id="modal"></div>');
    content = $('<div id="content"></div>');
    close = $('<a id="close" href="#">close</a>');

    modal.hide();
    overlay.hide();
    modal.append(content, close);

    $(document).ready(function(){
        $('body').append(overlay, modal);
    });

    close.click(function(e){
        e.preventDefault();
        method.close();
    });
    
    return method;
}());

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

