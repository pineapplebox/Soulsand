var express = require('express');
var fs = require('fs');
var path = require('path');
var jf = require('jsonfile');
var copy = require('copy');
var app = express();
var serv = require('http').createServer(app);
var mysql = require('mysql');
var configReader = require('../../configReader')
var userManager = require('../userControllers/userManager')
//var db = require('./db.js');
var startQueue = {};
var config = configReader.readConfig();

serv.listen(8081);
console.log("Servercreator initialized");
var mysqlSettings = {
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
}

var connection = mysql.createConnection(mysqlSettings);
connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('Success. Connected to MySQL as id ' + connection.threadId);
});
connection.end();

var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    socket.on('register', function (username, email, password) {
        userManager.register(username, email, password, function (allFine) {
            if (allFine == true) {
                socket.emit("register", true)
                createServer(username)
            } else {
                socket.emit("register", false)
            }
        })
    });
    socket.on('login', function (username, password) {
        userManager.login(username, password, function (allFine) {
            if (allFine == true) {
                socket.emit("loginSucess");
            } else {
                socket.emit("loginFail");
            }
        });
    });
    socket.on('isRegisterOpened', function () {
        var config = configReader.readConfig();
        socket.emit('isRegisterOpened', config.enableRegister)
    });
});
function createServer(username) {
    if (!fs.existsSync(configReader.rootPath() + "/servers/serverInfo.json")) {
        var serverInfoComplete = {
            port: 25590
        }
        jf.writeFile(configReader.rootPath() + "/servers/serverInfo.json", serverInfoComplete, function (err) {
            var serverInfoFile = configReader.rootPath() + '/servers/serverInfo.json'
            jf.readFile(serverInfoFile, function (err, currentServerInfo) {
                var serverInfo = currentServerInfo;
                var port = serverInfo.port;
                serverInfo.port = port + 1;
                jf.writeFile(serverInfoFile, serverInfo, function (err) {
                    var properties = "#Minecraft server properties \n" +
                        "#Thu Mar 23 20:49:11 CET 2017 \n" +
                        "generator-settings= \n" +
                        "force-gamemode=false \n" +
                        "allow-nether=true \n" +
                        "gamemode=0 \n" +
                        "enable-query=false \n" +
                        "player-idle-timeout=0 \n" +
                        "difficulty=1 \n" +
                        "spawn-monsters=true \n" +
                        "op-permission-level=4 \n" +
                        "announce-player-achievements=true \n" +
                        "pvp=true \n" +
                        "snooper-enabled=true \n" +
                        "level-type=DEFAULT \n" +
                        "hardcore=false \n" +
                        "enable-command-block=false \n" +
                        "max-players=20 \n" +
                        "network-compression-threshold=256 \n" +
                        "resource-pack-sha1= \n" +
                        "max-world-size=29999984 \n" +
                        'server-port=' + port + "\n" +
                        "debug=false \n" +
                        "server-ip= \n" +
                        "spawn-npcs=true";

                    fs.writeFile(configReader.rootPath() + "/server.properties", properties, function (err) {
                        if (err) {
                            return console.log(err);
                        }
                        var dir = configReader.rootPath() + "/servers/" + username;
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir);
                            //Copying all the files to the user server folder
                            var serverFolder = path.join(configReader.rootPath() + '/servers/' + username);
                            var copyServer = fs.createReadStream(configReader.rootPath() + '/serverVersions/server.jar').pipe(fs.createWriteStream(serverFolder + '/server.jar'));
                            copyServer.on('finish', function () {
                                var copyProperties = fs.createReadStream(configReader.rootPath() + '/server.properties').pipe(fs.createWriteStream(serverFolder + '/server.properties'));
                                copyProperties.on('finish', function () {
                                    var copyInfo = fs.createReadStream(configReader.rootPath() + '/servers/serverInfo.json').pipe(fs.createWriteStream(serverFolder + '/serverInfo.json'));
                                    copyInfo.on('finish', function () {
                                        fs.unlinkSync(configReader.rootPath() + "/server.properties");
                                    })
                                });
                            });

                        }
                    });
                })
            })
        });
    } else {
        var serverInfoFile = configReader.rootPath() + '/servers/serverInfo.json'
        jf.readFile(serverInfoFile, function (err, currentServerInfo) {
            var serverInfo = currentServerInfo;
            var port = serverInfo.port;
            serverInfo.port = port + 1;
            jf.writeFile(serverInfoFile, serverInfo, function (err) {
                var properties = "#Minecraft server properties \n" +
                    "#Thu Mar 23 20:49:11 CET 2017 \n" +
                    "generator-settings= \n" +
                    "force-gamemode=false \n" +
                    "allow-nether=true \n" +
                    "gamemode=0 \n" +
                    "enable-query=false \n" +
                    "player-idle-timeout=0 \n" +
                    "difficulty=1 \n" +
                    "spawn-monsters=true \n" +
                    "op-permission-level=4 \n" +
                    "announce-player-achievements=true \n" +
                    "pvp=true \n" +
                    "snooper-enabled=true \n" +
                    "level-type=DEFAULT \n" +
                    "hardcore=false \n" +
                    "enable-command-block=false \n" +
                    "max-players=20 \n" +
                    "network-compression-threshold=256 \n" +
                    "resource-pack-sha1= \n" +
                    "max-world-size=29999984 \n" +
                    'server-port=' + port + "\n" +
                    "debug=false \n" +
                    "server-ip= \n" +
                    "spawn-npcs=true";

                fs.writeFile(configReader.rootPath() + "/server.properties", properties, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    var dir = configReader.rootPath() + "/servers/" + username;
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                        //Copying all the files to the user server folder
                        var serverFolder = path.join(configReader.rootPath() + '/servers/' + username);
                        /*copy.one(configReader.rootPath() + '/serverVersions/server.jar', serverFolder, function (err, file) {
                        });
                        copy.one(configReader.rootPath() + '/server.properties', serverFolder, function (err, file) {
                        });
                        copy.one(configReader.rootPath() + '/servers/serverInfo.json', serverFolder, function (err, file) {
                        });*/
                        var copyServer = fs.createReadStream(configReader.rootPath() + '/serverVersions/server.jar').pipe(fs.createWriteStream(serverFolder + '/server.jar'));
                        copyServer.on('finish', function () {
                            var copyProperties = fs.createReadStream(configReader.rootPath() + '/server.properties').pipe(fs.createWriteStream(serverFolder + '/server.properties'));
                            copyProperties.on('finish', function () {
                                var copyInfo = fs.createReadStream(configReader.rootPath() + '/servers/serverInfo.json').pipe(fs.createWriteStream(serverFolder + '/serverInfo.json'));
                                copyInfo.on('finish', function () {
                                    fs.unlinkSync(configReader.rootPath() + "/server.properties");
                                })
                            });
                        });
                    }
                });
            })
        })
    }
}