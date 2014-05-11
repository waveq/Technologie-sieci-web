var app = angular.module('czatApka', []);

app.factory('socket', function () {
    var socket = io.connect('http://' + location.host);
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

        var getNick = function () {
            console.log($scope.nick);
            return $scope.nick;
        }
        

        $scope.nick = "Nick";
        $scope.rooms = [];
        $scope.msgs = [];
        $scope.connected = false;
        $scope.createRoom = function() {
            socket.emit('create room', $scope.room.name);
            console.log("Tworze pokój o nazwie: " + $scope.room.name);
            $scope.room.name = '';
        }

        $scope.changeRoom = function(room){
            $scope.msgs = [];
            socket.emit('change room', room );
            alert("Przełączyłeś się na pokój " + room);

        };


        $scope.sendMsg = function () {
            if ($scope.msg && $scope.msg.text) {
                socket.emit('send msg', safe_tags_replace(getNick() +': '+ $scope.msg.text.substring(0, 30)));
                $scope.msg.text = '';
            }
        };
        socket.on('connect', function () {
            $scope.connected = true;
            $scope.$digest();
        });
        socket.on('history', function (data) {
            $scope.msgs = data;
            $scope.$digest();
        });
        socket.on('roomHistory', function (data) {
            $scope.rooms = data;
            $scope.$digest();
        });
        socket.on('rec msg', function (data) {
            $scope.msgs.unshift(data);
            $scope.$digest();
        });
        socket.on('rec room', function (data) {
            $scope.rooms.unshift(data);
            $scope.$digest();
        });
    }
]);
