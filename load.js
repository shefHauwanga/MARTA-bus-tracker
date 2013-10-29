$(document).ready(function(){
    $('#info-bar').hide();
    $('#bus-search-form').hide();

    $('#click-bar').click(function () {
        if($('#info-bar').css('display') === 'none') {
            $('#info-bar').slideToggle("slow", function(){
                $('#bus-search-form').slideToggle("slow");
            });
        } else {
            $('#bus-search-form').slideToggle("slow", function(){
                $('#info-bar').slideToggle("slow");
            });
        }
    });
});
