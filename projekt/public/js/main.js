var app = angular.module('czatApka', []);

app.factory('socket', function () {
    var socket = io.connect('http://' + location.host);
    return socket;
});

app.controller('appCtrlr', ['$scope', 'socket',





    function ($scope, socket) {
        $scope.connected = false;

        var dupa = function() {
        var myUrl = "/loggedIn"
        $.ajax({
            url: myUrl,
            type: 'GET',
            success: function(myJson) {
                $.each(myJson, function() {
                    console.log("user: "+myJson.user);
                    if(myJson.user) {
                        $scope.loggedIn = true;
                        $scope.$digest();
                        console.log("scope: "+$scope.loggedIn);
                    }
                }); 
            } 
        });
        }
        dupa();   

        socket.on('connect', function () {
            $scope.connected = true;
            $scope.$digest();
        });    
    
    }



]);
