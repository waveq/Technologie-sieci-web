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
        $scope.buttonDisabled = true;



        $scope.name = '';
        $scope.city = '';
        $scope.street = '';
        $scope.number = '';



        var getUrlParameter = function() {
            var url = window.location.pathname;
            var placeName = url.substr(12);
            return placeName;
        }
 

       function getSinglePlace (placeName){
            var myUrl = "/getSinglePlace/" + placeName;
            console.log("PLACE NAME" + placeName);
            $.ajax({
                url: myUrl,
                type: 'GET',
                success: function(myJson) {
                    $.each(myJson, function() {
                        $scope.name = myJson.place[0];
                        $scope.city = myJson.place[1];
                        $scope.street = myJson.place[2];
                        $scope.number = myJson.place[3];
                        
                        $scope.$digest();
                    });
                }
            });
        }
        getSinglePlace(getUrlParameter());
        


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
    }



]);

