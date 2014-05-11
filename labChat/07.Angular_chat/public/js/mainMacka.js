var app = angular.module('czatApka', []);

app.factory('socket', function () {
    var socket = io.connect('http://' + location.host + "/");
    return socket;
});

app.controller('chatCtrlr', ['$scope', 'socket',
    function ($scope, socket) {
        var tagsToReplace = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;'
        };
        var replaceTag = function (tag) {
            return tagsToReplace[tag] || tag;
        };
        var safe_tags_replace = function (str) {
            return str.replace(/[&<>]/g, replaceTag);
        };
        var prepareMessageWithLogin = function(msg, login){
            return login + ": " +  safe_tags_replace($scope.msg.text.substring(0, 20));
        };
        $scope.msgs = [];
        $scope.rooms = [];

        $scope.connected = false;

        $scope.newRoom = function() {
            socket.emit("add new room", $scope.new.room.name);
            console.log("Tworze nowy pokoj o nazwie " + $scope.new.room.name);

        };

        $scope.joinRoom = function()   {
            socket.emit("start");
        };

        $scope.sendMsg = function () {
            if ($scope.msg && $scope.msg.text) {
                socket.emit('send msg', prepareMessageWithLogin($scope.msg.text, $scope.msg.login));
                $scope.msg.text = '';
            }
        };

        $scope.chooseRoom = function(room){
            $scope.msgs = [];
            socket.emit('change room', room );
            alert("PrzeĹÄczyĹeĹ siÄ na pokĂłj " + room);

        };

        socket.on('connect', function () {
            $scope.connected = true;
            $scope.$digest();
        });

        socket.on('history', function (data) {
            console.log("history " + data);
            $scope.msgs = data;
            $scope.$digest();
        });

        socket.on('rooms', function (data){
            console.log("utworzone pokoje: "+ data);
            $scope.rooms = data;
            $scope.$digest();
        });

        socket.on('rec msg', function (data) {
            console.log("rec msg " + data);
            console.log($scope.msgs);

            $scope.msgs.unshift(data);
            $scope.$digest();
        });

        socket.on('show rooms', function(data){
            console.log("Wyswietlam pokoje:" + data);
            $scope.rooms = data;
            $scope.$digest();
        });
    }
]);