/* 
 * A variable that keeps track of if the 
 * move helper function is currently running.
 */ 
google.maps.Marker.prototype.motion = "static";

// Based on Tina CG Hoehr's marker
// movement hack: http://stackoverflow.com/a/10906464
google.maps.Marker.prototype.moveAnimation = function(toLocation) {
    // Checks to see if the bus has moved
    // more than a minimum distance.
    var lessThanMinimumDist = function (from, to) {
        var checkFun = function(start, finish){
            return (parseFloat(Math.abs(start - finish)) < 0.001);
        }
        return (checkFun(from.getPosition().lat(), to.lat()) &&
                checkFun(from.getPosition().lng(), to.lng()));
    }


    // Checks if the new coordinates are farther
    // than a minimum distance.
    if(lessThanMinimumDist(this, toLocation))
        return;

    // Makes sure that the marker is ready
    // to take new coordinates.
    if(this.motion === "moving")
        return;

    // Stores each position of animation for the marker.
    var animationPositions = [];
    // The marker's current lattitude and longitude.
    var fromLat = this.getPosition().lat();
    var fromLng = this.getPosition().lng();
    // The lat/lng where we wish to move the marker.
    var toLat = toLocation.lat();
    var toLng = toLocation.lng();

    // Creates the position array for the
    // path the marker is going to take.
    for(var percent = 0; percent < 1; percent += 0.002) {
        currentLat = fromLat + percent * (toLat - fromLat);
        currentLng = fromLng + percent * (toLng - fromLng);
        animationPositions.push(new google.maps.LatLng(currentLat, currentLng));
    }

    // Set the flag so the marker knows it's moving 
    this.motion = "moving";
    // Recursivly moves the bus through
    // the LatLng in the animationPositions
    // array.
    move = function(marker, latLngs, index, delay) {
        marker.setPosition(latLngs[index]);
        if(index !== latLngs.length - 1) {
            // Next position on the map for
            // the markers
            setTimeout(function() {
                move(marker, latLngs, index + 1, delay);
            }, delay);
        } else {
            // Set the flag so the marker knows it's can take new coordinates 
            marker.motion = "static";
        }
    };
    // Stars the bus marker moving.
    move(this, animationPositions, 0, 20);
}
