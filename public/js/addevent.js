var app = angular.module('czatApka', []);

app.factory('socket', function () {
    var socket = io.connect('http://' + location.host);
    return socket;
});

app.controller('appCtrlr', ['$scope', 'socket',
    function ($scope, socket) {
        

        $scope.connected = false;
        $scope.username = "";
        $scope.placeExist = false;
        $scope.buttonDisabled = true;



        $scope.places = [];
        $scope.fullPlaces = [];


 
        var getAllPlaces = function() {
            var myUrl = "/getAllPlaces/";
            $.ajax({
                url: myUrl,
                type: 'GET',
                success: function(myJson) {
                    $.each(myJson, function() {
                        $scope.places = myJson.lista;
                        $scope.$digest();
                        for(var i = 0;i<$scope.places.length;i++) {
                            console.log(myJson.lista);
                           getSinglePlace($scope.places[i]); 
                        }
                    });
                }
            });
            
        };
       var getSinglePlace = function(placeName){
            var myUrl = "/getSinglePlace/" + placeName;
            $.ajax({
                url: myUrl,
                type: 'GET',
                success: function(myJson) {
                    $.each(myJson, function() {
                        // console.log(myJson.place);
                        $scope.fullPlaces.unshift(myJson.place);
                        $scope.fullPlace = myJson.place;
                        
                        $scope.$digest();
                    });
                }
            });
        };
        getAllPlaces();
        

        $scope.change = function () {
            $scope.eventExist = false;
            $scope.buttonDisabled = false;

            var myUrl="/checkIfEventExists/"+$scope.event.name;
            $.ajax({
            url: myUrl,
            type: 'GET',
            success: function(myJson) {
                $.each(myJson, function() {
                    console.log(myJson.exist);
                    if(myJson.exist) {
                        $scope.eventExist = true;
                        $scope.buttonDisabled = true;
                        $scope.$digest();
                    }
                }); 
            }});
                
        };

      var checkIfLoggedIn = function() {
            var myUrl = "/loggedIn";
            $.ajax({
                url: myUrl,
                type: 'GET',
                success: function(myJson) {
                    $.each(myJson, function() {
                        $scope.username = myJson.username;
                        console.log("user:",myJson.username);
                        if(myJson.username) {
                            $scope.loggedIn = true;
                            $scope.$digest();
                        }
                    }); 
                } 
            });
        };
        checkIfLoggedIn();  

  
      $scope.addEvent = function(){
            var eventToSend = [];
            eventToSend.unshift($scope.event.time);
            eventToSend.unshift($scope.event.date);
            eventToSend.unshift($scope.event.place);
            eventToSend.unshift($scope.event.name);
            socket.emit('addEvent', eventToSend);
    };
    socket.on('connect', function () {
            $scope.connected = true;
            $scope.$digest();
        });    
    }



]);

