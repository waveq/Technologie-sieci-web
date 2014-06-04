$(document).ready(function() {


var myTimer = setInterval(function () {
    $('#map').goMap({
    address : $( "#street" ).html() + " " + $( "#number" ).html() + ", " + $( "#city" ).html(),
    zoom : 16,
    scaleControl : true,
    maptype : 'SATELLITE'
}); // koniec funkcji goMap


$.goMap.createMarker({  
     address : $( "#street" ).html() + " " + $( "#number" ).html() + ", " + $( "#city" ).html(),
     title : $( "#name" ).html(),
     html : {
       content : '<h3>' + $( "#name" ).html()+ '</h3>',
     popup : true   
     }
}); // koniec funkcji createMarker
    clearInterval(myTimer);   

}, 1000);


}); // koniec funkcji ready