const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

//validation
const validatePostInput = require('../../validation/post');

const bodyParser = require('body-parser');

// support parsing of application/json type post data
router.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
router.use(bodyParser.urlencoded({ extended: true }));

//@route GET api/users/test
//@desc Tests users route
//@access Public
router.get('/test', (req,res) => res.json({msg:'Posts works'}));

//@route POST api/posts
//@desc Get posts
//@access Public
router.get('/', (req,res) => {
    Post.find()
    .sort({date: -1})
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({nopostsfound: 'No Posts found'}))
});


//@route POST api/posts/id
//@desc Get posts by id
//@access Public
router.get('/:id', (req,res) => {
    Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({nopostfound: 'No Post found'}))
});

//@route POST api/posts
//@desc Create post
//@access Private
router.post('/', passport.authenticate('jwt', {session: false}), (req,res) => {
    const {errors, isValid}  = validatePostInput(req.body);

    //check validation
    if(!isValid){
        //if any errors, send 400 error
        return res.status(400).json(errors)
    }
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.nme,
        user: req.user.id
    });

    newPost.save().then(post => res.json(post));
});


//@route DELETE api/posts/:id
//@desc Delete the post
//@access Private
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req,res) => {
    Profile.findOne({user: req.user.id})
    .then(profile => {
        Post.findById(req.params.id)
        .then(post =>{
            //check for post owner
            if(post.user.toString() !== req.user.id){
                return res.status(401).json({notauthorized: 'User not authorized'})
            }
            
            post.remove().then(() => res.json({success: true}) );

        })
        .catch(err => res.status(404).json({postnofound: 'Post not found'}))
    })
    .catch(err => res.status(404).json({nopostsfound: 'No Posts found'}));
});

//@route POST api/posts/like/:id
//@desc like the post
//@access Private
router.post('/like/:id', passport.authenticate('jwt', {session: false}), 
    (req,res) => {
        Profile.findOne({user: req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
            .then(post => {
                if(
                    post.likes.filter(like => like.user.toString() === req.user.id)
                    .length > 0
                ){
                        return res
                            .status(400)
                            .json({ alreadyliked: 'User already liked this post' });
               }

                //add user id to likes array
                post.likes.unshift( {user: req.user.id} );

                post.save().then(post => res.json(post));

            })
            .catch(err => res.status(404).json({postnofound: 'Post not found'}))
        })
    
    }
);


//@route POST api/posts/unlike/:id
//@desc unlike the post
//@access Private
router.post('/unlike/:id', passport.authenticate('jwt', {session: false}), 
    (req,res) => {
        Profile.findOne({user: req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
            .then(post => {
                if(
                    post.likes.filter(like => like.user.toString() === req.user.id)
                    .length == 0
                ){
                        return res
                            .status(400)
                            .json({ notliked: 'You have not liked this post' });
               }

                //get remove index
                var removeIndex = post.likes
                    .map(item => item.user.toString())
                    .indexOf(req.user.id);

                //splice out of array
                post.likes.splice(removeIndex, 1)

                //save
                post.save().then(post =>
                    res.json(post)
                );

            })
            .catch(err => res.status(404).json({postnofound: 'Post not found'}))
        })
    
    }
);


//@route POST api/posts/comment/:id
//@desc comment to post
//@access Private
router.post('/comment/:id', passport.authenticate('jwt', {session: false}), 
    (req,res) => {
            Post.findById(req.params.id)
            .then(post => {
                const {errors, isValid}  = validatePostInput(req.body);

                //check validation
                if(!isValid){
                    //if any errors, send 400 error
                    return res.status(400).json(errors)
                }    

                const newComment = {
                    text: req.body.text,
                    name: req.body.name,
                    avatar: req.body.avatar,
                    user: req.user.id
                }

                post.comments.unshift(newComment);

                //save
                post.save().then(post => res.json(post));

            })
            .catch (err => res.status(404).json({ postnotfound: 'No Post found' }));
    }
);



//@route delete api/posts/comment/:id/:comment_id
//@desc remove comment from post
//@access Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {session: false}), 
    (req,res) => {
            Post.findById(req.params.id)
            .then(post => {
               
                //check if comments exist
                if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0){
                    return res.status(404).json({commentnotexist: 'Comment does not exist'})
                }
                
                //get remove index
                const removeIndex = post.comments
                .map(item => item._id.toString())
                .indexOf(req.params.comment_id);

                //splice comment out of array
                post.comments.splice(removeIndex,1);

                //save
                post.save().then(post => res.json(post));

            })
            .catch (err => res.status(404).json({ postnotfound: 'No Post found' }));
    }
);

module.exports = router;



