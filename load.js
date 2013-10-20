$(document).ready(function(){
    //$('#info-bar').hide();
    //$('#bus-search').hide();
    //$('#bus-info-border').hide();

    $('#click-bar').click(function () {
        $('#info-bar').slideToggle("slow");
        $('#bus-search').slideToggle("slow");
        $('#bus-info-border').slideToggle("slow");
    });
});
