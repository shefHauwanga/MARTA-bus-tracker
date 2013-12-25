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
    var form_data;
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

    description_text = "Hi, I'm <a href=#>Sheefeni Hauwanga</a>, a web and mobile developer from Atlanta, ";
    description_text += "and I created this map to make Atlanta more navigable without a car. "
    description_text += "If you'd like me to assist you with your next project, send me a line with the form below.";

    form_data = '<div id="description-form-text">' + description_text  + '</div>';
    form_data += '<div id="hire-form-text">Tell me about your project!</div>';
    form_data += '<div id="form-container"><form onsubmit="return MapObject.stopReload()">';
    form_data += '<div id="email-container" class="form-fields"><input type="text" class="form-search-field" id="email-field" placeholder=" Email address" /></div>';
    form_data += '<div id="name-container" class="form-fields"><input type="text" class="form-search-field" id="first-name-field" placeholder=" First name" />';
    form_data += '<input type="text" class="form-search-field" id="last-name-field" placeholder=" Last name" /></div>';
    form_data += '<div id="company-container" class="form-fields"><input type="text" class="form-search-field" id="company-name-field" placeholder=" Company name" /></div>';
    form_data += '<div class="textarea-fields"><textarea placeholder="Enter your project description here." id="project-textfield" cols="33" rows="7"></textarea></div>';
    form_data += '</form></div>';
    form_data += '<a class="normal-link" href="#"><div id="submit-container">Send me a line</div></a>';

    $('#hire-me-button').click(function(e){
        MapObject.mapModal.open({content: form_data});
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
    that.cleanseBuses();

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

        if (sParameterName[0] === sParam){
            return sParameterName[1];
        }
    }
}

/*
 Creates a new bus object.
 */
MapObject.initBus = function (busData) {
    if(busData.trip !== "0") {
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
}

MapObject.mainText = function() {
    var that = this;
    var msg_text = "This is a live map of the buses for Atlanta's MARTA system.";

    if(typeof that.bus_var !== 'undefined')
        msg_text += '<br /><br /><div><a class="return-link" href="/martaBusTracker/">Return to main map.</a></div>';

    return msg_text;
}

MapObject.stopReload = function() {
    return false;
}

MapObject.populateInfoBar = function (busData){
    var text;
    var that = this;

    function getStopData(){
        console.log('helper.php?time_id=' + busData.trip + '&bus_id=' + busData.id);
        $.ajax({
            "url": 'helper.php?time_id=' + busData.trip + '&bus_id=' + busData.id,
            "dataType": "json", 
            "type": "GET",
            "success": function (response) {
                console.log(response);
                console.log(response.name + ' @ ' + response.time);
                $('#next-stop-data').html(response.name + ' @ ' + response.time);
            }
        });
    }

    if($('#info-bar').css('display') === 'none') {
        that.menuDrop();
    }        

    that.atlMap.setZoom(14);
    that.atlMap.setCenter(busData.getPosition());

    text = '<div id="bus-num">Bus# ' + busData.id + '.</div>';
    text += '<div id="bus-route">On route# ' + busData.routeNumber + '.</div>';
    text += '<div id="next-stop">Next stop: <span id="next-stop-data">Loading...</span>.</div>';
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
    getStopData();
}


MapObject.queueRoute = function (){
    MapObject.mapModal.open({content: '<div id="loading-screen">Loading...</div>'});

    var opts = {
        lines: 13, // The number of lines to draw
        length: 20, // The length of each line
        width: 10, // The line thickness
        radius: 30, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // #rgb or #rrggbb or array of colors
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '65', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
    };
    var target = document.getElementById('loading-screen');
    var spinner = new Spinner(opts).spin(target);

    var that = this;
    that.stop_collection = {};

    $.ajax({
        "url": that.trip_call,
        "dataType": "json", 
        "type": "GET",
        "success": function (response) {
            that.routeName = response['name'];
            async.parallel([
                function (callback) {
                    that.drawStops(response['stops'], callback);
                },
                function (callback) {
                    that.drawRoute(response['shape'], callback);
                }
            ], function(err) {
                MapObject.mapModal.close();
            });
        }, "error": function(xhr, ajaxOptions, throwError){
            $("#about").html("<div id=\"queue_problem\">There is a problem with the map drawing.<br /><br />" + xhr.status + "</div>");
        }
    });
}

MapObject.drawRoute = function (shape_data, callback){
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
    callback();
}

MapObject.drawStops = function (stop_data, callback){
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

        stop_text = '<div id="' + selector_name + '"><a class="stop-link" href="#">Stop #' + size + '</a>: <br />Stop name: ' + stopMarker.title;
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
    callback();
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
            busNum = [];

            setTimeout(function setBus(cur_place) {
                cur_place = cur_place || 0;
                var bus = response[cur_place]
                busNum.push(bus.id);
                if(that.busCollection[bus.id] === undefined) {
                    that.initBus(bus);
                } else {
                    if((bus.latitude !== that.busCollection[bus.id].getPosition().lat().toString()) ||
                           (bus.longitude !== that.busCollection[bus.id].getPosition().lng().toString())) {
                            that.busCollection[bus.id].moveAnimation(new google.maps.LatLng(bus.latitude, bus.longitude));
                    }

                    that.busCollection[bus.id].nextStop = bus.nextStop;
                    that.busCollection[bus.id].routeNumber = bus.route;
                    that.busCollection[bus.id].lateness = bus.adherence;
                    that.busCollection[bus.id].busDirection = bus.direction;
                    that.busCollection[bus.id].trip = bus.trip;
                    that.busCollection[bus.id].modDate = Date.now();

                    color = 'FFFF00';

                    if(bus.adherence < 0){
                        if(bus.adherence >= -2)
                            color = 'FFFF00';
                        else 
                            color = 'FF0000';
                    } else {
                        if(bus.adherence > 0)
                            color = '4097ED';
                        else
                            color = '00FF00'
                    }

                    that.busCollection[bus.id].icon = 'http://chart.googleapis.com/chart?chst=d_bubble_icon_text_small&chld=bus|bbT|' + bus.id + '|' + color;

                    that.busCollection[bus.id].busColor = color;
                }
                    
                if(cur_place < response.length -1 ){
                    cur_place++;
                    setTimeout(function() {
                        setBus(cur_place);
                    }, 0);
                } else {
                    setTimeout(function() { 
                        that.queueBuses();
                    }, that.updateInterval);
                }
             }, 0);
            $('#bus-search-field').autocomplete({
                source: busNum
            });
        },
        "error": function(xhr, ajaxOptions, thrownError) {
            $("#about").html("<div id=\"queue_problem\">There is a problem with queueing.<br /><br />" + xhr.status + "</div>");
        }
    });
}

MapObject.mapModal = (function() {
    var method = {};
    var overlay;
    var modal;
    var content;
    var close;

    method.center = function () {
        var left;
        
        left = Math.max($(window).width() - modal.outerWidth(), 0) / 2;

        modal.css({
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

    setTimeout(function() {
        that.cleanseBuses();
    }, that.cleanseInterval);
}

MapObject.removeBus  = function (busId) {
    var that = this;

     that.busCollection[busId].setMap(null);
     delete that.busCollection[busId];
}
