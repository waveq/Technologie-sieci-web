var app = angular.module('czatApka', []);

app.factory('socket', function () {
    var socket = io.connect('http://' + location.host);
    return socket;
});

app.controller('appCtrlr', ['$scope', 'socket',
    function ($scope, socket) {
        

        $scope.connected = false;
        $scope.username = "";

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
    
    }



]);

