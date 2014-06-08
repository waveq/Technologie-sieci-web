var app = angular.module('czatApka', []);

app.factory('socket', function () {
    var socket = io.connect('http://' + location.host);
    return socket;
});

app.controller('appCtrlr', ['$scope', 'socket',
    function ($scope, socket) {
        

        $scope.connected = false;
        $scope.username = "";




        $scope.events = [];
        $scope.fullEvents = [];
        $scope.fullEvent;

 
        var getAllEvents = function() {
            var myUrl = "/getAllEvents/";
            console.log("dupa");
            $.ajax({
                url: myUrl,
                type: 'GET',
                success: function(myJson) {
                    $.each(myJson, function() {
                        console.log("sukces");
                        console.log(myJson.lista);
                        $scope.events = myJson.lista;
                        $scope.$digest();
                         for(var i = 0;i<$scope.events.length;i++) {
                             console.log(myJson.lista);
                            getSingleEvent($scope.events[i]); 
                         }
                    });
                }
            });
            
        };
       var getSingleEvent = function(eventName){
            var myUrl = "/getSingleEvent/" + eventName;
            $.ajax({
                url: myUrl,
                type: 'GET',
                success: function(myJson) {
                    $.each(myJson, function() {
                        // console.log(myJson.place);
                        $scope.fullEvents.unshift(myJson.event);
                        $scope.fullEvent = myJson.event;
                        
                        $scope.$digest();
                    });
                }
            });
        };
        getAllEvents();
        

        var isDisabled = function () {
            console.log("pass match: "+$scope.passwordMatch);
            console.log("user exist : "+$scope.userExist);

            if($scope.passwordMatch === true && $scope.userExist === false && $scope.user.password.length > 1) {
                return false;
            }
            else 
                return true;
            };

        $scope.change = function () {
            $scope.userExist = false;
            $scope.buttonDisabled = isDisabled();

            console.log($scope.user.username);
            var myUrl="/checkIfUserExists/"+$scope.user.username;
            $.ajax({
            url: myUrl,
            type: 'GET',
            success: function(myJson) {
                $.each(myJson, function() {
                    console.log(myJson.exist);
                    if(myJson.exist) {
                        $scope.userExist = true;
                        $scope.buttonDisabled = isDisabled();
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

        socket.on('connect', function () {
            $scope.connected = true;
            $scope.$digest();
        });    
        socket.on('addedEvent', function (data) {
            console.log("Odebralem: ");
            console.log(data);
            $scope.fullEvents.unshift(data);
            $scope.$digest();
        });
    
    }
]);

