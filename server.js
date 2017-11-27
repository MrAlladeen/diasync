var express = require('express'),
    io = require('socket.io'),
    app = express(),
    server = require('http').createServer(app),
    io = io.listen(server),
    uniqueid = require('uniqid'),
    async = require('async'),
    port = process.env.PORT || 3000,
    logged_users = {},
    IDs = [];


server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

app.use(express.static(__dirname));

io.on('connection', function (socket) {
    console.log('connected');

    //presenter client
    socket.on('createID', function(){
        //generate ID and send back to prof
        var uniqueID = uniqueid.time();
        uniqueID = uniqueID.substring(4,8);

        IDs.push(uniqueID);
        socket.emit('IDcreated',uniqueID);
    });

    socket.on('nextSlideImage',function(slideBitmap){
        /*send off to clients
        async.forEachOf(logged_users, function(value, key, callback){
            //send off http link to selected users within group
            if(logged_users[key] in IDs){
                key.emit('nextSlideImage', slideBitmap);
            }
        });*/
        socket.broadcast.emit('nextSlideImage', slideBitmap);
        console.log('nextSlideImage: ' + slideBitmap );
    });

    //user client
    socket.on('userLoginWithSessionID', function(ID){
        console.log('userLoginWithSessionID: ' + ID);

        if (IDs.indexOf(ID) > -1) {
            //In the array!
            //saving socket
            logged_users[socket] = ID;

            socket.emit('successSessionID');
        } else {
            //Not in the array!
            socket.emit('errorTypingSessionID');
        }
    });

    //todo save ips automatically
    socket.on('saveMyIPAndPagesICreated',function(json){
       //save data for proving usage of app to advertisers
    });

    socket.on('singlePicRequest', function(slideBitmap){
        //send user
    });

    //todo tell client software to attach ad to image collection, save collection to pdf and disconnect from server
});