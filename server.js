var express = require('express'),
    io = require('socket.io'),
    app = express(),
    server = require('http').createServer(app),
    io = io.listen(server),
    uniqueid = require('uniqid'),
    async = require('async'),
    port = process.env.PORT || 3000,
    logged_users = {},
    logged_profs = {},
    get_users_by_ID = {},
    IDs = [];


server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

app.use(express.static(__dirname));

io.on('connection', function (socket) {
    console.log('connected');

    //presenter
    socket.on('createID', function(){
        //generate ID and send back to prof
        var uniqueID = uniqueid.time();
        uniqueID = uniqueID.substring(4,8);

        logged_profs[uniqueID] = socket;

        IDs.push(uniqueID);
        socket.emit('IDcreated',uniqueID);
    });


    socket.on('nextSlideImage',function(slideBitmap){   //slideBitmap consists of 4 char session id, 'Δ', actual base64 coded bitmap string
        var id = slideBitmap.substring(0,4);            //get id
        var pic = slideBitmap.substring(5);             //get bitmap

        //for loop
        async.forEachOf(logged_users, function(sock, username, callback){
            //test if session ID is valid and if user is in this session
            if (IDs.indexOf(id) > -1 && get_users_by_ID[username] === id) {
                sock.emit('nextSlideImage', pic);
            }
        });
    });

    socket.on('singlePic', function(user, bitmap){
        logged_users[user].emit('singlePic', bitmap);
    });

    //user
    socket.on('userLoginWithSessionID', function(ID){
        console.log('userLoginWithSessionID: ' + ID);

        var uniqueID = uniqueid.time();
        uniqueID = uniqueID.substring(4,8);

        if (IDs.indexOf(ID) > -1) {
            //In the array!
            //saving session ID and socket
            get_users_by_ID[uniqueID] = ID;
            logged_users[uniqueID] = socket;

            socket.emit('userID', uniqueID);
            console.log('in IDs');
        } else {
            //Not in the array!
            socket.emit('errorTypingSessionID');
            console.log('not in IDs');
        }
    });

    socket.on('singlePicRequest', function(user, sessionID){
        logged_profs[sessionID].emit('singlePicRequest', user);
    });

    //todo save ips automatically
    socket.on('saveMyIPAndPagesICreated',function(json){
       //save data for proving usage of app to advertisers
    });

    //todo ads
});