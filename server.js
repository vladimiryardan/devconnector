const express  = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const users = require('./routes/api/users')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/posts')



const app = express();

app.use(bodyParser.urlencoded({extended:false}));

const db = require('./config/keys').mongoURI;


//connect to mongodb
mongoose
    .connect(db)
    .then(() => console.log('mongodb connected'))
    .catch(err => console.log(err));

//passport middleware
app.use(passport.initialize());

//Passport config
require('./config/passport')(passport);


//use routes
app.use('/api/users',users);
app.use('/api/profile',profile);
app.use('/api/posts',posts);

const port = process.env.port || 5000;

app.listen(port, () => console.log(`servere running on port ${port}`));


