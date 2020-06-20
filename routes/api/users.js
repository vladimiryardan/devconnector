const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

// support parsing of application/json type post data
router.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
router.use(bodyParser.urlencoded({ extended: true }));

const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

//load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');


//load user model
const User = require('../../models/User');

//@route GET api/users/test
//@desc Tests users route
//@access Public
router.get('/test', (req,res) => res.json({msg:'Users works'}));


//@route post api/users/test
//@desc Register user
//@access Public
router.post('/register', (req,res) => {
    const {errors,isValid} = validateRegisterInput(req.body);
    
    //let isValid={};
    //let errors={};
    //console.log(req.body)
    //check validation input
    if(!isValid){
        return res.status(400).json(errors);
    }

    User.findOne({
        email: req.body.email
    }).then(user =>{

        if(user){
            return res.status(400).json({email:'email exists'});
        }else{

            const avatar = gravatar.url(req.body.email,{
                s: '200',
                r: 'pg',
                d: 'mm'
            })
            
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password
            }) 
            
            bcrypt.genSalt(10,(err,salt) =>{
                bcrypt.hash(newUser.password,salt,(err,hash) => {
                    if (err)throw err;

                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));

                })
            })
                        
        }       

    })
});

//@route post api/users/login
//@desc Login User
//@access Public
router.post('/login',(req,res) =>{

    const email = req.body.email;
    const password = req.body.password;
    const {errors,isValid} = validateLoginInput(req.body);

    //check validation input
    if(!isValid){
        return res.status(400).json(errors);
    }

    User.findOne({email})
        .then(user =>{
            //check user
            if(!user){
                errors.email = 'User not found';
                return res.status(400).json(errors);
            }
            
            //check Password
            bcrypt.compare(password, user.password)
                .then(isMatch =>{
                    if(isMatch){
                        //res.json({msg: 'Success user matched'});
                        
                        const payload = { id: user.id, name: user.name, avatar: user.avatar};//create jwt payload

                        //sign token
                       jwt.sign(                            
                            payload, 
                            keys.secretOrKey,
                            {expiresIn: 3600},
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                });
                            }
                        );
                       
                    }else{
                        errors.password = 'Password incorrect';
                        return res.status(400).json(errors);
                    }
                });
        });
});

//@route GET api/users/current
//@desc return current User
//@access Private
router.get('/current', 
    passport.authenticate('jwt', {session: false}),
    (req,res)=>{        
        //res.json({msg:'success authenticate'});
        //res.json(req.user);
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
        });
    }
);




module.exports = router;



