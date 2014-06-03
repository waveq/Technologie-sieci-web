var app = angular.module('czatApka', []);

app.factory('socket', function () {
    var socket = io.connect('http://' + location.host);
    return socket;
});

app.controller('appCtrlr', ['$scope', 'socket',
    function ($scope, socket) {
        

        $scope.connected = false;
        $scope.username = "";
        $scope.userExist = false;
        $scope.passwordMatch = true;
        $scope.buttonDisabled = false;


        $scope.name = '';
        $scope.place = '';
        $scope.date = '';
        $scope.time = '';

        $scope.signedUsers = [];


        var getUrlParameter = function() {
            var url = window.location.pathname;
            var eventName = url.substr(12);
            return eventName;
        }


 
        function getSingleEvent(eventName){
            var myUrl = "/getSingleEvent/" + eventName;

            console.log("eventName: " + eventName);
            $.ajax({
                url: myUrl,
                type: 'GET',
                success: function(myJson) {
                    $.each(myJson, function() {
                        // console.log(myJson.place);
                        console.log("JSON:");
                        console.log(myJson.event);

                        $scope.name = myJson.event[0];
                        $scope.place = myJson.event[1];
                        $scope.date = myJson.event[2];
                        $scope.time = myJson.event[3];

                        $scope.getSignedUsers();
                        $scope.$digest();
                    });
                }
            });
        }
        getSingleEvent(getUrlParameter());

        $scope.signUp = function () {

            var myUrl="/signUpEvent/"+$scope.name;
            $.ajax({
                url: myUrl,
                type: 'GET',
                success: function(myJson) {
                    $scope.getSignedUsers();
                    $scope.checkIfSigned();
                    socket.emit('signUp', $scope.username);
                }
            });
        }

        $scope.getSignedUsers = function () {
            var myUrl="/getSignedUsers/"+$scope.name;
            console.log("URL:" +myUrl);
            $.ajax({
                url: myUrl,
                type: 'GET',
                success: function(myJson) {
                    $.each(myJson, function() {
                        $scope.signedUsers = myJson.lista;
                        $scope.checkIfSigned();
                        $scope.$digest();
                    });
                }
            });
        }
        
        $scope.checkIfSigned = function() {
            var myUrl="/getSignedUsers/"+$scope.name;
            console.log("URL:" +myUrl);
            $.ajax({
                url: myUrl,
                type: 'GET',
                success: function(myJson) {
                    $.each(myJson, function() {
                        $scope.signedUsers = myJson.lista;
                        for(var i=0;i < $scope.signedUsers.length; i++) {
                            console.log($scope.signedUsers[i] + " : " + $scope.username);
                            if($scope.signedUsers[i] === $scope.username) {
                                $scope.buttonDisabled = true;
                                $scope.$digest();
                            }
                        }
                    });
                }
            });
        }
        

      var checkIfLoggedIn = function() {
            var myUrl = "/loggedIn"
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
        }
        checkIfLoggedIn();  

  




        socket.on('connect', function () {
            $scope.connected = true;
            $scope.$digest();
        });    
        socket.on('signedUp', function (data) {
            console.log("Odebralem: ");
            console.log(data);
            $scope.signedUsers.push(data);
            $scope.$digest();
        });
    
    }



]);

