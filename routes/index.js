var express = require('express');
var router = express.Router();
var userModel = require('./users');
var postModel = require('./reel');
var storyModel = require('./story');
const passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var path = require('path');
var multer = require('multer');
var fn = '';

passport.use(new localStrategy(userModel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploades/')
  },
  filename: function (req, file, cb) {
    var dt = new Date();
    fn = Math.floor(Math.random() * 100000000) + dt.getTime() + path.extname(file.originalname);
    console.log(fn);
    cb(null, fn)
  }
})
const upload = multer({ storage: storage })


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', function (req, res) {
  res.render('register');
});

router.post('/register', function (req, res) {
  var CreatedUser = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
  });
  userModel.register(CreatedUser, req.body.password)
    .then(function () {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/dashbord');
      })
    })
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashbord',
  failureRedirect: '/'
}));

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next();
    } else {
      res.redirect('/');
    }
  });
});

router.get('/dashbord', isLogedIn, function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .populate('story')
    .then(function (user) {
      // res.send(user);
      // return
      postModel.find()
        .populate('account', ['username', 'profile', 'name'])
        .then(function (allPost) {
          res.render('dashbord', { userData: user, allPost: allPost });
        });
    })
});

router.get('/like/post/:id', isLogedIn, function (req, res) {
  postModel.findOne({ _id: req.params.id })
    .then(function (post) {
      var index = post.like.indexOf(req.session.passport.user);
      console.log(index);
      if (index == -1) {
        post.like.push(req.session.passport.user);
        return post.save();
      } else {
        post.like.splice(index, 1);
        return post.save();
      }

    })
    .then(function () {
      res.redirect('back');
    });
});

router.get('/profile', isLogedIn, function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .populate('post')
    .exec()
    .then(function (user) {
      var arr = [];

      var promises = user.post.map(function (postId) {
        return postModel.findOne({ _id: postId }).exec()
          .then(function (data) {
            arr.push(data);
          });
      });

      return Promise.all(promises)
        .then(function () {
          console.log(arr);
          res.render('profile', { userData: user, post: arr });
        })
        .catch(function (error) {
          console.error(error);
          res.status(500).send('An error occurred');
        });
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    });
});

router.get('/account/:id', isLogedIn, function (req, res) {
  userModel.findOne({ _id: req.params.id })
    .then(function (user) {
      res.render('update', { userData: user });
    })
})

router.post('/save/:id', isLogedIn, function (req, res) {
  userModel.findOneAndUpdate({ _id: req.params.id }, {
    name: req.body.name,
    bio: req.body.bio,
    gender: req.body.gender,
    email: req.body.email,
  }).then(function (dat) {
    res.redirect('back');
  })
});

router.get('/createpost', isLogedIn, function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      res.render('post', { userData: user });
    })
})

router.post('/createpost/:id', isLogedIn, upload.single('postfile'), function (req, res, next) {

  postModel.create({
    url: fn,
    description: req.body.description
  }).then(function (createdPost) {
    userModel.findOne({ username: req.session.passport.user })
      .then(function (user) {
        user.post.push(createdPost._id);
        user.save();
        createdPost.account = user._id;
        createdPost.save();
      })
      .then(function () {
        res.send('done');
      })
  })
});

router.get('/post/:id', function (req, res) {
  postModel.findOne({ _id: req.params.id })
    .then(function (data) {
      res.send(data);
    }).catch(function (err) {
      res.send(err);
    });
});

router.post('/updateprofile/', isLogedIn, upload.single('profilePicture'), function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      if (fn == "") {
        console.log('empty profile');
      } else {
        user.profile.push({ url: fn, time: Date.now() });
        user.save();
      }
    })
    .then(function () {
      res.redirect('back');
    });
});

router.get('/s', function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      var Newuser = '';
      res.render('search', { userData: user, newUser: Newuser });
    });
});

router.post('/s/:uesrname', function (req, res) {
  // var username = req.params.uesrname;
  var regex = new RegExp('^' + req.params.uesrname);
  // console.log(regex);
  // return;
  userModel.find({ username: regex })
    .limit(5)
    .then(function (users) {
      res.json({ users: users, accountuser: req.session.passport.user });
    });
});

router.get('/follow/:id', function (req, res) {
  var updateUser;
  userModel.findOne({ _id: req.params.id })
    .then((followUser) => {
      updateUser = followUser;
      var index = followUser.folower.indexOf(req.session.passport.user);
      if (index == -1) {
        followUser.folower.push(req.session.passport.user);
        followUser.save();
      } else {
        followUser.folower.splice(index, 1);
        followUser.save();
      }

    }).then(() => {
      userModel.findOne({ username: req.session.passport.user })
        .then((currentUser) => {
          var index = currentUser.following.indexOf(updateUser.username);
          if (index == -1) {
            currentUser.following.push(updateUser.username);
            currentUser.save();
          } else {
            currentUser.following.splice(index, 1);
            currentUser.save();
          }

        }).then(() => {
          res.json({ msg: 'Removed Sucessfully....' });
        })
    })
})

router.post('/comment/:id', isLogedIn, function (req, res) {
  postModel.findOne({ _id: req.params.id })
    .then(function (post) {
      if (req.body.comment == "") {
        res.redirect('back');
      } else {
        post.comments.push({ profile: req.session.passport.user, comment: req.body.comment });
        post.save();
      }
    })
    .then(function () {
      res.redirect('back');
    });
})

router.get('/save/:id', isLogedIn, function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then((FindUser) => {
      var index = FindUser.saved.indexOf(req.params.id);
      if (index == -1) {
        FindUser.saved.push(req.params.id);
        FindUser.save();
      } else {
        FindUser.saved.splice(index, 1);
        FindUser.save();
      }
    })
    .then(() => {
      res.redirect('back');
    })
})

router.get('/checkuser/:username', function (req, res) {
  userModel.findOne({ username: req.params.username })
    .then(function (user) {
      if (user) {
        res.json({ user: true });
      } else {
        res.json({ user: false });
      }
    });
});

router.get('/po/:postId', function (req, res) {
  postModel.findOne({ _id: req.params.postId })
    .populate({
      path: 'account',
      select: 'username profile',
    })
    .populate({
      path: 'comments',
      populate: {
        path: 'user',
        select: 'username profile'
      }
    })
    .then(function (post) {
      console.log(post);
      res.json({ post: post });
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get('/loggedinuser', function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      res.json({ user: user });
    })
    .catch(function (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.get('/saved', isLogedIn, function (req, res, next) {
  userModel.findOne({ username: req.session.passport.user })
    .populate({
      path: 'saved',
      populate: {
        path: 'account',
        model: 'users',
        select: 'username profile'
      }
    })
    .then((findPost) => {
      // res.send(findPost);
      res.render('saved', { userData: findPost, allPost: '' });
    })
})

router.post('/story/upload', upload.single('story'), isLogedIn, (req, res, next) => {
  userModel.findOne({ username: req.session.passport.user })
    .then((Founduser) => {
      storyModel.create({
        account: Founduser._id,
        url: fn,
      })
        .then((createdStory) => {
          Founduser.story.push(createdStory._id);
          return Founduser.save();
        })
        .then(() => {
          res.redirect('back');
        })
    })
});

router.get('/axios/story/:serchId',(req,res,next)=>{
  userModel.findOne({_id:req.params.serchId})
  .populate('story')
  .then((dbResponse)=>{
    res.send(dbResponse);
  });
})

router.get('/axios/comment/:id/:comment', isLogedIn, function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then((user) => {
      postModel.findOne({ _id: req.params.id })
        .then(function (post) {
          if (req.body.comment == "") {
            // res.redirect('back');
          } else {
            post.comments.push({ user: user._id, comment: req.params.comment });
            return post.save();
          }
        })
        .then(() => {
          postModel.findOne({ _id: req.params.id })
            .populate({
              path: 'comments',
              populate: {
                path: 'user',
                select: 'username profile'
              }
            })
            .then(function (newPost) {
              res.send(newPost);
            });
        })
    })
})

router.get('/msg',(req,res,next)=>{
  res.render('chat-home');
});


function isLogedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/');
  }
}
module.exports = router;
