var express = require('express'),
    io = require('socket.io'),
    app = express(),
    server = require('http').createServer(app),
    io = io.listen(server),
    uniqueid = require('uniqid'),
    async = require('async'),
    fs = require('fs'),
    port = process.env.PORT || 3000,
    logged_users = {},
    logged_profs = {},
    get_users_by_ID = {},
    IDs = [],
    file,
    ad_image,
    logger = fs.createWriteStream('ads_log.txt',{
        flags: 'a'  //a means appending
    });


server.listen(port, function () {
    console.log('Server listening at port %d', port);

    //file = fs.readFileSync('./HIERDERNAMEDERDATEI.jpg');//todo enetr right path and uncomment both lines!
    //ad_image = new Buffer(file).toString('base64');

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
        logged_users[user].emit('singlePic', bitmap);   //send client his requested image
    });

    //user
    socket.on('userLoginWithSessionID', function(ID){
        var uniqueID = uniqueid.time();
        uniqueID = uniqueID.substring(4,8);

        //check if such session exists
        if (IDs.indexOf(ID) > -1) {
            //saving session ID and socket
            get_users_by_ID[uniqueID] = ID;
            logged_users[uniqueID] = socket;

            socket.emit('userID', uniqueID);    //send off username, login
            socket.emit('adImage', ad_image);   //send off add

            logger.write('1');                  //simply an ad access counter that adds '1' every time a user 'gets' ad
        }
        else {
            socket.emit('errorTypingSessionID');
        }
    });

    socket.on('singlePicRequest', function(user, sessionID){
        logged_profs[sessionID].emit('singlePicRequest', user);     //inform presenter client to share an 'instant image' of his content
    });
});