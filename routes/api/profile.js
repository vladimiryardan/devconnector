const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');


// load validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

//load profile model
const Profile = require('../../models/Profile');

//load user profile
const user = require('../../models/User');

//@route GET api/users/test
//@desc Tests users route
//@access Public
router.get('/test', (req,res) => res.json({msg:'Profile works'}));


//@route GET api/profile
//@desc get current users profile
//@access Private
router.get('/', passport.authenticate('jwt', { session: false }),
    (req,res) => {
        const errors = {};
        Profile.findOne({user: req.user.id})
            .populate('user',['name','avatar'])
            .then(profile =>{
                if(!profile){
                    errors.noprofile = 'No profile found';
                    return res.status(404).json(errors);
                }

                res.json(profile);
            })
            .catch(err => res.status(404).json(err) );
    }
);

//@route Post api/profile
//@desc create or edit user profile
//@access Private
router.post('/', passport.authenticate('jwt', { session: false }),
    (req,res) => {
        const {errors, isValid} = validateProfileInput(req.body);

        //check validation
        if(!isValid){
            //return any errors with 400 status
            return res.status(400).json(errors);
        }

        //get fields
        const profiledFields = {};
        profiledFields.user = req.user.id;

        if(req.body.handle)profiledFields.handle = req.body.handle;
        if(req.body.company)profiledFields.company = req.body.company;
        if(req.body.website)profiledFields.website = req.body.website;
        if(req.body.location)profiledFields.location = req.body.location;
        if(req.body.bio)profiledFields.bio = req.body.bio;
        if(req.body.status)profiledFields.status = req.body.status;
        if(req.body.githubusername)profiledFields.githubusername = req.body.githubusername;
        //skills - split into array
        if(typeof req.body.skills !== 'undefined'){
            profiledFields.skills = req.body.skills.split(',');
        }
        //social
        profiledFields.social = {};
        if(req.body.youtube)profiledFields.social.youtube = req.body.youtube;
        if(req.body.twitter)profiledFields.social.twitter = req.body.twitter;
        if(req.body.facebook)profiledFields.social.facebook = req.body.facebook;
        if(req.body.linkedin)profiledFields.social.linkedin = req.body.linkedin;
        if(req.body.instagram)profiledFields.social.instagram = req.body.instagram;

        Profile.findOne({user: req.user.id})
            .then(profile =>{
                if(profile){
                    //update
                    Profile.findOneAndUpdate(
                        {user: req.user.id},
                        {$set: profiledFields},
                        {new: true}
                    ).then(profile => res.json(profile));
                }else{
                    //create
                    
                    //check if handle exist
                    Profile.findOne({ handle: profiledFields.handle})
                        .then(profile =>{
                            errors.handle = 'That handle exists'
                            res.status(400).json(errors);
                        });

                    //save profile
                    new Profile(profiledFields).save().then(profile =>{
                        res.json(profile);
                    });
                }
            })



    }
);

//@route GET api/profile/handle/:handle
//@desc get profile by handle
//@access Public
router.get('/handle/:handle', (req,res) =>{
    const errors = {};
    Profile.findOne({ handle: req.params.handle })
    .populate('user',['name','avatar'])
    .then(profile =>{
        if(!profile){
            errors.noprofile = 'No profile found';
            res.status(404).json(errors);
        }

        res.json(profile);

    })
    .catch(err => res.status(404).json(err)); 

});


//@route GET api/profile/users/:user_id
//@desc get profile by user id
//@access Public
router.get('/users/:user_id', (req,res) =>{
    const errors = {};

    Profile.findOne({ user: req.params.user_id })
    .populate('user',['name','avatar'])
    .then(profile =>{
        if(!profile){
            errors.noprofile = 'No profile found';
            res.status(404).json(errors);
        }

        res.json(profile);

    })
    .catch(err => res.status(404).json(err)); 
    
});

//@route GET api/profile/all
//@desc get all profiles
//@access Public
router.get('/all', (req, res) => {
    const errors = {};

    Profile.find()
        .populate('user',['name','avatar'])
        .then(profiles => {
            if(!profiles){
                errors = 'Profile list empty';
                res.status(404).json(errors)
            }

            res.json(profiles);

        })
        .catch(err => res.status(404).json({ profile: 'No Profiles found'})); 
});


//@route POST api/profile/experience
//@desc add experience
//@access Private
router.post('/experience', passport.authenticate('jwt',{session: false}), (req,res) =>{
    const {errors, isValid} = validateExperienceInput(req.body);

    //check validation
    if(!isValid){
        //return any errors with 400 status
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id})
        .then(profile =>{
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

        //add to experience array
        profile.experience.unshift(newExp);

        profile.save().then(profile => res.json(profile));

        });
});


//@route POST api/profile/education
//@desc add education to profile
//@access Private
router.post('/education', passport.authenticate('jwt',{session: false}), (req,res) =>{
    const {errors, isValid} = validateEducationInput(req.body);

    //check validation
    if(!isValid){
        //return any errors with 400 status
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id})
        .then(profile =>{
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

        //add to experience array
        profile.education.unshift(newEdu);

        profile.save().then(profile => res.json(profile));

        });
});



//@route DELETE api/profile/experience/:exp_id
//@desc delete experience from profile
//@access Private
router.delete('/experience/:exp_id', passport.authenticate('jwt',{session: false}), (req,res) =>{
    
    Profile.findOne({ user: req.user.id})
        .then(profile => {

            //get remove index
            const removeIndex = profile.experience
                .map(item => item.id)
                .indexOf(req.params.exp_id);

            //splice out of array
            profile.experience.splice(removeIndex,1);

            //save
            profile.save().then(profile => res.json(profile) );
        })
        .catch(err => res.status(404).json(err));
});


//@route DELETE api/profile/education/:edu_id
//@desc delete experience from profile
//@access Private
router.delete('/education/:edu_id', passport.authenticate('jwt',{session: false}), (req,res) =>{
    
    Profile.findOne({ user: req.user.id})
        .then(profile => {

            //get remove index
            const removeIndex = profile.education
                .map(item => item.id)
                .indexOf(req.params.edu_id);

            //splice out of array
            profile.education.splice(removeIndex,1);

            //save
            profile.save().then(profile => res.json(profile) );
        })
        .catch(err => res.status(404).json(err));
});


//@route DELETE api/profile
//@desc delete user and profile
//@access Private
router.delete('/', passport.authenticate('jwt',{session: false}), (req,res) =>{
    
    Profile.findOneAndRemove({ user: req.user.id})
        .then(() => {
            user.findByIdAndRemove({_id: req.user.id})
                .then(() => res.json({success: true}));
        }) ;
});
module.exports = router;



