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
        
        var prepareMessageWithNick = function(nick, message) {
            return nick + ': ' + message;
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
            $scope.roomChosen = true;
            alert("Przełączyłeś się na pokój " + room);

        };


        $scope.sendMsg = function () {
            if ($scope.msg && $scope.msg.text) {
                socket.emit('send msg', safe_tags_replace(prepareMessageWithNick(getNick(), $scope.msg.text)));
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

        socket.on('show rooms', function(data){
            $scope.rooms = data;
            $scope.$digest();
        });

    }
]);
