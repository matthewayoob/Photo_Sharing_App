
/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
const fs = require("fs");

var async = require('async');

var express = require('express');
var app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
// var cs142models = require('./modelData/photoApp.js').cs142models;
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));
app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/* use mongo functions to query, section slides

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    console.log('/test called with param1 = ', request.params.p1);

      if (!request.session.user_id) {
        response.status(401).send("Nobody is logged in.");
        return;
    }

    // citation: mongoose model documentation
      User.find({}, 'first_name last_name _id', function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/list error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('Users', info);
            response.end(JSON.stringify(info));
        });
    // response.status(200).send(cs142models.userListModel());
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    console.log('/test called with param1 = ', request.params.p1);
    var id = request.params.id;

    if (!request.session.user_id) {
        response.status(401).send("Nobody is logged in.");
        return;
    }

    // citation: mongoose model documentation
    User.find({_id: id}, '_id first_name last_name location description occupation', function (err, info) {
        if (err) {
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            console.error('Doing /user/specifcID error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (info.length === 0) {
            // Query didn't return an error but didn't find the SchemaInfo object - This
            // is also an internal error return.
            response.status(400).send('Missing SchemaInfo');
            return;
        }

        // We got the object - return it in JSON format.
        console.log('Users', info);
        response.status(200).send(JSON.stringify(info[0]));
    });

});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    var specifc_user_id = request.params.id;

    if (!request.session.user_id) {
        response.status(401).send("Nobody is logged in.");
        return;
    }

    // citation: PhotosOfUser Approach Chat OH 3/2/2023, 3/3/2023
      Photo.find({user_id: specifc_user_id}, '_id user_id comments file_name date_time', function (err, photoArrInfo) {
        if (err) {
            console.error('Doing /user/specifcID error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (photoArrInfo.length === 0) {
            response.status(400).send('Missing SchemaInfo');
            return;
        }

        photoArrInfo = JSON.parse(JSON.stringify(photoArrInfo));

        // eslint-disable-next-line no-shadow
        async.each(photoArrInfo, function(photo_granularity, noResponseCallback) {
            
            if (photo_granularity.comments.length) {
                
                // eslint-disable-next-line no-shadow
                async.each(photo_granularity.comments, function(comment_granularity, noResponseCallback) {
                    
                    User.find({_id: comment_granularity.user_id }, '_id last_name first_name', function (error, user) {
                    if (err) {
                        console.error('Malformed userId input given.', err);
                        response.status(400).send("Couldn't find it");
                        return;
                    }
                    if (user.length === 0) {
                        response.status(400).send("Couldn't find it");
                        return;
                    }
                    delete comment_granularity.user_id;
                    comment_granularity.user = user[0];
                   noResponseCallback();
                });
                // eslint-disable-next-line no-unused-vars
                }, function(error) {
                        if (err) {
                            console.log("Error", err);
                        } else {
                            noResponseCallback();
                        }
                    }); 
                } else {
                    noResponseCallback();
                }
                // eslint-disable-next-line no-unused-vars
            }, function(error){
                if (err) {
                    console.log("Error for user/id", err);
                } else {
                    response.status(200).send(JSON.stringify(photoArrInfo));
                    }
            });
        });
    });

app.post('/admin/login', function(request, response) {
    let user_we_are_searching_for = request.body.login_name;
    // const password = request.body.login_name;
    User.find({login_name: user_we_are_searching_for}, '_id password first_name', function (err, info) {
        if (err) {
            console.error('Specific username error', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (info.length === 0) {
            response.status(400).send('Missing SchemaInfo');
            return;
        }
        if (!info) {
            response.status(400).send('User not real');
            return;
        }
        if (request.body.password !== info[0].password) {
            response.status(400).send();
            return;
        }
            request.session.user_id = info[0]._id;
            user_we_are_searching_for = request.body.login_name;
            response.status(200).send(info[0]);
    });
});

app.post('/admin/logout', function(request, response) {

    if (!request.session.user_id) {
        response.status(400).send("Nobody is logged in.");
        return;
    }
    delete request.session.user_id;
    function callback () {
        console.log("Log out successful.");
    }
    request.session.destroy(callback());
    response.status(200).send("Success");
});


// //OH with Kexu and Dean 3/7
// app.post('/commentsOfPhoto/:photo_id', function(request, response) {
//     console.error(request);
//     if (request.session.user_id === undefined) {
//         response.status(401).send('Nobody is logged in.');
//         return;
//     }
//     const corresponding_photo_id = request.params.photo_id;
//     if (!request.body.comment || request.body.comment.length === 0 ) {
//         console.log(request.body.comment);
//         response.status(400).send('No comment content.');
//         return;
//     }
    
//     Photo.findOne({_id: corresponding_photo_id}, function (err, photo) {
//         // push comment from mentioned into photo object
//         if (err) {
//             console.error('Specific photo error', err);
//             response.status(400).send(JSON.stringify(err));
//             return;
//         }
//         if (photo) {
//             let comment_obj = {comment: request.body.comment,
//                  date_time: Date().valueOf(),
//                 user_id: request.session.user_id};
//             photo.comments.push(comment_obj);
//             photo.save();
//             response.status(200).send();
//             }
//              });
//     });


// citation: debugging with Christi 3/18 
app.post('/commentsOfPhoto/:photo_id', function(request, response) {
    const session_userID = request.session.user_id;
    if (!session_userID) {
        response.status(401).send('Invalid user');
        return;
    }
    //merp
    const comment_text = request.body.comment;
    const mentioned_users_arr = JSON.parse(request.body.who_was_mentioned); 
    console.log(request.body.mentioned);
    console.log(mentioned_users_arr);
    if (!comment_text) {
        response.status(400).send('Invalid comment');
        return;
    }
    const id = request.params.photo_id;
    const commentsObject = {
        comment: comment_text,
        user_id: session_userID,
    };
    Photo.findByIdAndUpdate(id, {$push: {comments: commentsObject,
                                         mentioned_elem: {$each: mentioned_users_arr}}}).exec((err, photo) => {
        if (err || !photo) {
            console.log('Photo not found.');
            response.status(400).send('Photo not found.');
            return; 
        }
        console.log("Were gonna get 200 - comments of photo");
        response.status(200).send();
    });
});


// Photo Uploading 
app.post('/photos/new', function(request, response) {
    if (request.session.user_id === undefined) {
        response.status(400).send('Nobody is logged in.'); // maybe 401
        return;
    }
    processFormBody(request, response, function(err) {
        if (err || request.file === undefined) {
            response.status(400).send('Invalid file');
            return;
        }
        // assert(request.file.filename, 'uploadedphoto');
        // console.log(request.file.filename);
        let currTime = new Date().valueOf();
        // let filename = 'U' + String(currTime) + request.file.originalname;

        // eslint-disable-next-line no-useless-concat
        let path = './images/' + 'U' + String(currTime) + request.file.originalname;
        if (path) {
        fs.writeFile(path, request.file.buffer, function (writeErr) {
            if (writeErr) {
                console.error(writeErr);
                response.status(400).send('File Not Written!'); // maybe 401
                return;
            }
            const newPhoto = { file_name: 'U' + String(currTime) + request.file.originalname, date_time: currTime, user_id: request.session.user_id, comments: [] };
            Photo.create(newPhoto)
            .then((photoObj) => {
                    photoObj.save();
                    response.status(200).send(JSON.stringify(newPhoto));
                })
                .catch((err2) => {
                    if (err2) response.status(400).send("Error in pohott:", err2);
                });
            });
        }
    }); // end of processFormBody
});

// OH with Anh and Kexu
app.post('/user', function(request, response) {
    let user = request.body;
    // if (!user.first_name || !user.last_name || !user.username) {
    //     response.status(400).send('Malformed User');
    //     return;
    // }
    User.count({ login_name: user.login_name}, function(err, userObj) {
        if (err) {
            response.status(500).send('No User Found');
            return; 
        }
         if (userObj) {
            response.status(400).send('No User Found');
            console.log("FAILED HERE 1");
            return; 
        }
        // if (userObj) {
        //     response.status(400).send('No User Found');
        //     console.log("FAILED HERE 2");
        //     return; 
        // }
        // let password = user.password;
        User.create(
            {first_name: request.body.first_name, 
            last_name: request.body.last_name, 
            location: request.body.location,
            description: request.body.description,
            occupation: request.body.occupation,
            login_name: request.body.login_name, 
            password: request.body.password
            },
            function(error, specifc_user) {
            if (error) {
                response.status(500).send(JSON.stringify(error));
                return;
            }
            specifc_user.id = specifc_user._id;
            specifc_user.save();
            // response.status(200).send(JSON.stringify(specifc_user));    
            response.status(200).send(JSON.stringify(specifc_user));  
        });
    });
});
        
 app.get('/recentPhotoOfUser/:id', function (request, response) {
    var specifc_user_id = request.params.id;

    if (!request.session.user_id) {
        response.status(400).send("Nobody is logged in.");
        return;
    }
    // Photo.sort({ date_time: -1 });
    Photo.find({ user_id: specifc_user_id }, '_id user_id comments file_name date_time', function (err, photoArrInfo) {
        if (err) {
            console.error('Doing /user/specifcID error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (photoArrInfo.length === 0) {
            response.status(400).send(JSON.stringify(err));
            return;
        }

        // photoArrInfo = JSON.parse(JSON.stringify(photoArrInfo));
        let curr_max_time = 0;
        let curr_max_index = -1;
        for (let i=0; i < photoArrInfo.length; i++) {
            let time = photoArrInfo[i].date_time.getTime();
            if (time > curr_max_time) {
                curr_max_time = time;
                curr_max_index = i;
            }
        }
        photoArrInfo[curr_max_index].curr_max_time = curr_max_time;
        console.log("photo with max time");
        console.log(photoArrInfo[curr_max_index]);
        photoArrInfo = JSON.parse(JSON.stringify(photoArrInfo));
        response.status(200).send(JSON.stringify(photoArrInfo[curr_max_index]));  
    });
});

 app.get('/mostCommentPhoto/:id', function (request, response) {
    var specifc_user_id = request.params.id;

    if (!request.session.user_id) {
        response.status(401).send("Nobody is logged in.");
        return;
    }
    // Photo.sort({ date_time: -1 });
    Photo.find({ user_id: specifc_user_id }, '_id user_id comments file_name date_time', function (err, photoArrInfo) {
        if (err) {
            console.error('Doing /user/specifcID error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (photoArrInfo.length === 0) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        let curr_max_length = 0;
        let curr_max_index = -1;
        photoArrInfo = JSON.parse(JSON.stringify(photoArrInfo));
        // brute force approach from OH
        for (let i=0; i <photoArrInfo.length; i++) {
            if (photoArrInfo[i].comments.length > curr_max_length) {
                curr_max_length = photoArrInfo[i].comments.length;
                curr_max_index = i;
            }
        }
        photoArrInfo[curr_max_index].curr_max_length = curr_max_length;
        response.status(200).send(JSON.stringify(photoArrInfo[curr_max_index]));  
    });
});

// OH with Christi 
app.post('/mentionsInPhoto/:photo_id', function(request, response) {
    console.log("test print print");
    const session_userID = request.session.user_id;
    if (!session_userID) {
        response.status(401).send('User is not logged in.');
        return;
    }
    const comment_text = request.session.comment;
    if (!comment_text) {
        response.status(400).send('Invalid comment');
        return;
    }
    const photo_id = request.params.photo_id;
    console.log(request.body.users_mentioned);
    const users_mentioned = JSON.parse(request.body.users_mentioned); 
    console.log(users_mentioned);
    Photo.findOne({_id: photo_id}, function(err, photo) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            console.log(JSON.stringify(err));
            return;
        }
        if (photo === null) {
            response.status(400).send('Photo was not found.');
            return;
        }
        // have to push new photos on
        for (let i=0; i < users_mentioned.length; i++) {
            if (!photo.mentioned.includes(users_mentioned[i])) {
                photo.mentioned.push(users_mentioned[i]);
            }
        }
        photo.save();
        console.log("Were gonna get 200 - via menitons photoID");
        response.status(200).send('Successfully added users mentioned to photo');
       
    });
});

// OH with Christi 
app.get('/mentionsInPhoto/:user_id', function(request, response) {
    const session_userID = request.session.user_id;
    if (!session_userID) {
        response.status(401).send('User is not logged in.');
        return;
    }
    const user_id = request.params.user_id; 
    Photo.find({}, function(err, photos) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            console.log(JSON.stringify(err));
            return;
        }
        if (photos === undefined) {
            response.status(400).send('Photos not found.');
            return;
        } 
        const mentioned_photos = []; const photosArray = JSON.parse(JSON.stringify(photos));
        async.each(photosArray, function(photo, photos_done) {
            if (photo.mentioned_elem.includes(user_id)) {
                // google select notation -- check in OH
                User.findOne({_id: photo.user_id}).select('first_name last_name')
                                                          .exec((errorUser, user) => {
                    if (errorUser || !user) {
                        console.log('User with _id:' + photo.user_id + ' not found.');
                        photos_done(errorUser);
                        return;
                    }
                    photo.first_name = user.first_name;
                    photo.last_name = user.last_name;
                    mentioned_photos.push(photo);
                    console.log("Mentioned Photos:");
                    console.log(mentioned_photos);
                    photos_done();
                });
            } else {
                photos_done(); 
            }
        }, function(errorUser) { 
            console.log(errorUser);
            if (errorUser) {
                response.status(400).send(errorUser);
            } else {
                console.log("Were gonna get 200 - via menitons userID");
                // console.log("Mentioned Photos:");
                // console.log(mentioned_photos);
                response.status(200).send(mentioned_photos);
                
            }
        });
    });
});


// citation Ed
app.post('/deletePhoto/:file', async function (request, response) {
    try {
        if (request.session.user_id === undefined) {
            response.status(401).send('User not logged in');
            return;
        }
        const file = request.params.file;
        await Photo.deleteOne({file_name: file});
        response.status(200).send('Deleted specific photo!');
    } catch (error) {
        console.error('Invalid file', error);
        response.status(400).send('Didnt get a valid photo ID name');
    }
});

// OH 3/17
app.post('/deleteUser/:id', function(request, response) {
    var spec_user_id = request.body.user_id;
    console.log("user_id in deleteUser");
    console.log(spec_user_id);
    // delete as many photos as needed, googling documentation
    Photo.deleteMany({user_id: spec_user_id}, function(err, photos) {
        console.log("photos to be deleted fro the user");
        console.log(photos);
        if (err) console.log("no photos to delete for this user");
    });

    Photo.find({}, function(err, photos) {
        if (err) console.log("no other photos besides this user's");
        let deletedCount = 0;
        for (let i =0; i < photos.length; i++) {

            let photo = photos[i];
            let comments = photo.comments;
        //iterate through each photo's comments to check if we need to delete any
            for (let k=comments.length - 1; k > -1; k--) {
                if ((comments[k].user_id).toString() === spec_user_id ) {
                    comments.splice(k, 1);
                    deletedCount += 1;
                }
            }
            //Save the edits made (removing comments the user)
            photo.comments = comments;
            photos[i] = photo;
            photos[i].save();
        }
        console.log("amount of comments delted");
        console.log(deletedCount);
    });
        User.deleteOne({_id: spec_user_id}, function(err) {
            if (err) {
                response.status(400).send('Invalid user given to delete.');
                return;
            }
            console.log("user was found and deleted");
            response.status(200).send("User is gone.");
    });
});


// OH with Christi 
app.post('/deleteComment/', function (request,response) {
if (!request.session.user_id) {
        response.status(400).send("Nobody is logged in.");
        return;
}
    console.log(request.body.photo.file_name);
// find the specific photo we will delete the comment from
Photo.findOne({file_name: request.body.photo.file_name}, '_id user_id comments file_name date_time', function (err, photo) {
    if (err) {
        response.status(400).send('Invalid id supplied');
        return;
    }
    console.log(photo);
    let adjComments = photo.comments;
    for (let i=0; i< adjComments.length; i++ ) {
        console.log("Loop comparsion variables, adj first");
        console.log(adjComments[i]._id.toString());
        console.log(request.body.commentObj._id);
        if (adjComments[i]._id.toString() === request.body.commentObj._id) {
            adjComments.splice(i, 1);
        }

        console.log("Comment Object");
        console.log(request.body.commentObj);

    }
   
    //  for (let i=0; i < users_mentioned.length; i++) {
    //         if (!photo.mentioned.includes(users_mentioned[i])) {
    //             photo.mentioned.push(users_mentioned[i]);
    //         }
    //     }


    photo.comments = adjComments;
    console.log("photo before saving");
    console.log(photo);
    console.log("adj comments");
    console.log(adjComments);
    photo.save();
    response.status(200).send("Comment was deleted / Success!"); 
});
    });


var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});

