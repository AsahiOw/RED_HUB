const express = require("express");
const app = express();
const port = 3000;

const formidable = require("express-formidable");
app.use(formidable());

const mongoose = require("mongoose");
const http = require("http").createServer(app);
const bcrypt = require("bcrypt");
const fileSystem = require("fs");

const jwt = require("jsonwebtoken");
const { request } = require("http");
const accessTokenSecret = "myAccessTokenSecret1234567890";

app.use("/public", express.static(__dirname + "/public"));
app.set("view engine", "ejs");

const socketIO = require("socket.io")(http);
const socketID = "";
const users = [];
const mainURL = "http://localhost:3000";
// import models
const User = require('./models/user');
const Post = require('./models/post');

// database connection
mongoose.connect('mongodb+srv://s3978072:YrhwejwQY3c62LgF@redhub.tnvbho8.mongodb.net/')
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => { console.error(err);});

// wait for the app response = app.listen
app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
  })

app.get("/signup", function (req, res){
    res.render("signup");
});

app.post("/signup", function (request, result) {
    const name = request.fields.name;
    const username = request.fields.username;
    const email = request.fields.email;
    const password = request.fields.password;
    const gender = request.fields.gender;
  
    User.findOne({
      $or: [
        { email: email },
        { username: username },
      ],
    })
    .then((user) => {
      if (user == null) {
        bcrypt.hash(password, 10)
        .then((hash) => {
          const newUser = new User({
            name: name,
            username: username,
            email: email,
            password: hash,
            gender: gender,
            profileImage: "",
            coverPhoto: "",
            dob: "",
            city: "",
            country: "",
            aboutMe: "",
            friends: [],
            pages: [],
            notification: [],
            groups: [],
            posts: [],
            accessToken: "",
          });
  
          newUser.save()
          .then(() => {
            result.json({
              status: "success",
              message: "Signed up successfully, Please login your account.",
            });
          })
          .catch((error) => {
            console.error("Error saving user:", error);
            result.json({
              status: "error",
              message: "An error occurred while signing up.",
            });
          });
        })
        .catch((error) => {
          console.error("Error hashing password:", error);
          result.json({
            status: "error",
            message: "An error occurred while signing up.",
          });
        });
      } else {
        result.json({
          status: "error",
          message: "Email or username already exist.",
        });
      }
    })
    .catch((error) => {
      console.error("Error finding user:", error);
      result.json({
        status: "error",
        message: "An error occurred while signing up.",
      });
    });
});

app.get("/login", function (req, res){
    res.render("login");
});

app.post("/login", function (request, result){
    const email = request.fields.email;
    const password = request.fields.password;
    User.findOne({ "email": email })
        .then((user) => {
            if (user == null){
                result.json({
                    "status": "error",
                    "message": "Email does not exist"
                });
            }
            else {
                bcrypt.compare(password, user.password)
                    .then((isVerify) => {
                        if (isVerify){
                            var accessToken = jwt.sign({ email: email }, accessTokenSecret);
                            User.findOneAndUpdate({ "email": email }, { $set: { "accessToken": accessToken } })
                                .then((data) => {
                                    result.json({
                                        "status": "success",
                                        "message": "Login successfully",
                                        "accessToken": accessToken,
                                        "profileImage": user.profileImage
                                    });
                                })
                                .catch((error) => {
                                    console.error("Error updating user:", error);
                                    result.json({
                                        "status": "error",
                                        "message": "An error occurred while updating user.",
                                    });
                                });
                        } else {
                            result.json({
                                "status": "error",
                                "message": "Password is not correct.",
                            });
                        }
                    })
                    .catch((error) => {
                        console.error("Error comparing passwords:", error);
                        result.json({
                            "status": "error",
                            "message": "An error occurred while comparing passwords.",
                        });
                    });
            }
        })
        .catch((error) => {
            console.error("Error finding user:", error);
            result.json({
                "status": "error",
                "message": "An error occurred while finding user.",
            });
        });
});
app.get("/updateProfile", function (req, res){
    res.render("updateProfile");
});
app.post("/getUser", async function (request, result) {
    try {
      const accessToken = request.fields.accessToken;
      const user = await User.findOne({ "accessToken": accessToken });
  
      if (user == null) {
        result.json({
          "status": "error",
          "message": "User has been logged out. Please login again."
        });
      } else {
        result.json({
          "status": "success",
          "message": "Record has been fetched.",
          "data": user
        });
      }
    } catch (error) {
      console.error("Error finding user:", error);
      result.json({
        "status": "error",
        "message": "An error occurred while finding user.",
      });
    }
  });
app.get("/logout", function (req, res){
    res.redirect("/login");
});

app.post("/uploadCoverPhoto", function (request, result){
    const accessToken = request.fields.accessToken;
    var coverPhoto = "";

    User.findOne({ "accessToken": accessToken })
        .then((user) => {
            if (user == null){
                result.json({
                    "status": "error",
                    "message": "User has been logged out. please login again."
                });
            } else {

                // if (request.files.coverPhoto.size > 0 && request.files.coverPhoto.type.includes("image")){
                //     if (user.coverPhoto != ""){
                //         fileSystem.unlink(user.coverPhoto, function(error){
                //             //
                //         });
                //     }
                //     coverPhoto = "public/images/" + new Date().getTime() + "-" + request.files.coverPhoto.name;
                //     fileSystem.rename(request.files.coverPhoto.path, coverPhoto, function (error) {
                //         //
                //     });
                //     User.updateOne({ "accessToken": accessToken }, { $set: { "coverPhoto": coverPhoto } })
                //         .then((user) => {
                //             result.json({
                //                 "status": "status",
                //                 "message": "Cover photo has been updated.",
                //                 data: mainURL + "/" + coverPhoto
                //             });
                //         });
                // } else {
                //     result.json({
                //         "status": "error",
                //         "message": "Please select a valid image.",
                //     });
                // }

                const path = require('path');

                // ...

                if (request.files.coverPhoto.size > 0 && request.files.coverPhoto.type.includes("image")) {
                if (user.coverPhoto != "") {
                    fileSystem.unlink(user.coverPhoto, function(error) {
                    // Handle error or do something after deleting the previous image
                    });
                }
                coverPhoto = "public/images/" + new Date().getTime() + "-" + request.files.coverPhoto.name;
                const imagePath = path.join(__dirname, coverPhoto); // Get the absolute path of the image file
                fileSystem.copyFile(request.files.coverPhoto.path, imagePath, function(error) {
                    if (error) {
                    console.error("Error moving image file:", error);
                    result.json({
                        "status": "error",
                        "message": "An error occurred while moving the image file.",
                    });
                    } else {
                    User.updateOne({ "accessToken": accessToken }, { $set: { "coverPhoto": coverPhoto } })
                        .then((user) => {
                        result.json({
                            "status": "success",
                            "message": "Cover photo has been updated.",
                            data: mainURL + "/" + coverPhoto
                        });
                        })
                        .catch((error) => {
                        console.error("Error updating user:", error);
                        result.json({
                            "status": "error",
                            "message": "An error occurred while updating the user.",
                        });
                        });
                    }
                });
                } else {
                result.json({
                    "status": "error",
                    "message": "Please select a valid image.",
                });
                }
            }
        });   
});

app.post("/uploadProfileImage", function (request, result){
    const accessToken = request.fields.accessToken;
    var profileImage = "";

    User.findOne({ "accessToken": accessToken })
        .then((user) => {
            if (user == null){
                result.json({
                    "status": "error",
                    "message": "User has been logged out. please login again."
                });
            } else {
                const path = require('path');

                // ...

                if (request.files.profileImage.size > 0 && request.files.profileImage.type.includes("image")) {
                if (user.profileImage != "") {
                    fileSystem.unlink(user.profileImage, function(error) {
                    // Handle error or do something after deleting the previous image
                    });
                }
                profileImage = "public/images/" + new Date().getTime() + "-" + request.files.profileImage.name;
                const imagePath = path.join(__dirname, profileImage); // Get the absolute path of the image file
                fileSystem.copyFile(request.files.profileImage.path, imagePath, function(error) {
                    if (error) {
                    console.error("Error moving image file:", error);
                    result.json({
                        "status": "error",
                        "message": "An error occurred while moving the image file.",
                    });
                    } else {
                    User.updateOne({ "accessToken": accessToken }, { $set: { "profileImage": profileImage } })
                        .then((user) => {
                        result.json({
                            "status": "success",
                            "message": "Cover photo has been updated.",
                            data: mainURL + "/" + profileImage
                        });
                        })
                        .catch((error) => {
                        console.error("Error updating user:", error);
                        result.json({
                            "status": "error",
                            "message": "An error occurred while updating the user.",
                        });
                        });
                    }
                });
                } else {
                result.json({
                    "status": "error",
                    "message": "Please select a valid image.",
                });
                }
            }
        });   
});

app.post("/updateProfile", async function (request, result) {
  try {
    const accessToken = request.fields.accessToken;
    const name = request.fields.name;
    const dob = request.fields.dob;
    const city = request.fields.city;
    const country = request.fields.country;
    const gender = request.fields.gender;
    const aboutMe = request.fields.aboutMe;

    const user = await User.findOne({ "accessToken": accessToken });

    if (user == null) {
      result.json({
        "status": "error",
        "message": "User has been logged out. please login again."
      });
    } else {
      await User.updateOne({ "accessToken": accessToken }, {
        $set: {
          "name": name,
          "dob": dob,
          "city": city,
          "country": country,
          "gender": gender,
          "aboutMe": aboutMe
        }
      });

      result.json({
        "status": "success",
        "message": "Profile has been updated.",
      });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    result.json({
      "status": "error",
      "message": "An error occurred while updating the profile.",
    });
  }
});

app.get("/", function(req,res){
  res.render("index");
});
app.post("/addPost", function (request, result) {
  const accessToken = request.fields.accessToken;
  const caption = request.fields.caption;
  let image = "";
  let video = "";
  const type = request.fields.type;
  const createdAt = new Date().getTime();
  const _id = request.fields._id;

  User.findOne({ "accessToken": accessToken })
    .then((user) => {
      if (user == null) {
        result.json({
          "status": "error",
          "message": "User has been logged out. Please login again."
        });
      } else {
        if (request.files.image.size > 0 && request.files.image.type.includes("image")) {
          image = "public/images/" + new Date() + "-" + request.files.image.name;
          fileSystem.rename(request.files.image.path, image, function (error) { });
        }
        if (request.files.video.size > 0 && request.files.video.type.includes("video")) {
          video = "public/videos/" + new Date() + "-" + request.files.videos.name;
          fileSystem.rename(request.files.video.path, video, function (error) { });
        }

        // Create a new instance of the Post model
        const newPost = new Post({
          caption: caption,
          image: image,
          video: video,
          type: type,
          createdAt: createdAt,
          likers: [],
          comments: [],
          shares: [],
        });

        // Save the new post to the database
        newPost.save()
          .then((data) => {
            // Update the user's posts array with the new post ID
            user.posts.push(data._id);
            user.save()
              .then(() => {
                result.json({
                  "status": "success",
                  "message": "Post has been uploaded."
                });
              })
              .catch((error) => {
                console.error("Error updating user:", error);
                result.json({
                  "status": "error",
                  "message": "An error occurred while updating the user.",
                });
              });
          })
          .catch((error) => {
            console.error("Error saving post:", error);
            result.json({
              "status": "error",
              "message": "An error occurred while saving the post.",
            });
          });
      }
    });
});

// idk why it doesn't work so please help
app.post("/getNewsfeed", async function (request, result) {
  const accessToken = request.fields.accessToken;
  try {
    const user = await User.findOne({ accessToken: accessToken });
    if (user == null) {
      result.json({
        status: 'error',
        message: 'User has been logged out. Please login again.',
      });
    } else {
      const ids = [user._id];
      const data = await Post.find({ user: { $in: ids } })
        .sort({ createAt: -1 })
        .limit(5)
        .exec();
      result.json({
        status: 'success',
        message: 'Record has been fetched',
        data: data,
      });
    }
  } catch (error) {
    result.json({
      status: 'error',
      message: 'An error occurred while fetching the record.',
    });
  }
});