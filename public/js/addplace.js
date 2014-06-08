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
        $scope.passwordMatch = true;
        $scope.buttonDisabled = true;

        $scope.length = true;
        $scope.nameLength = 0;
        $scope.cityLength = 0;
        $scope.streetLength = 0;
        $scope.numberLength = 0;


        var isDisabled = function () {
            if($scope.place.name.length > 2 &&
             $scope.place.city.length > 2 && $scope.place.street.length > 2 && $scope.place.number.length > 0) {
                $scope.length = false;
                return false;
            }
            else {
                $scope.length = true;
                return true;
            }
        };

        $scope.change = function () {
            $scope.placeExist = false;
            $scope.buttonDisabled = false;


            var myUrl="/checkIfPlaceExists/"+$scope.place.name;
            $.ajax({
            url: myUrl,
            type: 'GET',
            success: function(myJson) {
                $.each(myJson, function() {
                    if(myJson.exist) {
                        $scope.placeExist = true;
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
                        console.log("user:"+myJson.username);
                        if(myJson.username) {
                            $scope.loggedIn = true;
                            $scope.$digest();
                        }
                    }); 
                } 
            });
        };
        checkIfLoggedIn();  

  
        $scope.addPlace = function(){
            var placeToSend = [];
            placeToSend.unshift($scope.place.number);
            placeToSend.unshift($scope.place.street);
            placeToSend.unshift($scope.place.city);
            placeToSend.unshift($scope.place.name);
            socket.emit('addPlace', placeToSend);
        };

  

        socket.on('connect', function () {
            $scope.connected = true;
            $scope.$digest();
        });    
    
    }



]);

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
                            //$scope.avatar = getRandomInt(1,8);
                            $scope.loggedIn = true;
                            $scope.$digest();
                            getUserAvatar(myJson.username);
                        }
                    });
                }
            });
           
 
           
            //var div = document.getElementById('debug');
            //div.innerHTML = $scope.loggedIn + ' yolo';
          //document.getElementById('login_input').value='textosplayed' ;
        };
        var getUserAvatar = function(username) {
            console.log("PRZED WYSLANIEM1 MYURL2: " + "/getAvatarByUser/:" + $scope.username);
            var myUrl2 = "/getAvatarByUser/:" + $scope.username;
            $.ajax({
                url: myUrl2,
                type: 'GET',
                success: function(myJson) {
                    $.each(myJson, function() {
                        $scope.avatar = myJson.avatar;
                        console.log("avatar:",myJson.avatar);
                        if(myJson.avatar) {
                            //$scope.avatar = getRandomInt(1,8);
                            $scope.avatar = myJson.avatar;
                            $scope.$digest();
                        }
                    });
                }
            });
        };
       
       
        checkIfLoggedIn();