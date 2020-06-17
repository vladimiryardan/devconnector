const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateProfileInput(data){
    let errors = {};

    data.handle = !isEmpty(data.handle) ? data.handle : '';
    data.status = !isEmpty(data.status) ? data.status : '';
    data.skills = !isEmpty(data.skills) ? data.skills : '';


    if(!Validator.isLength(data.handle, {min: 2,max: 40}) ){
        errors.handle = 'Handle between 2 and 4 characters';
    }
    
    if(Validator.isEmpty(data.handle)){
        errors.handle = 'Profile handle is required';        
    }
    
    if(Validator.isEmpty(data.status)){
        errors.status = 'Status handle is required';        
    }

    if(Validator.isEmpty(data.skills)){
        errors.skills = 'Skills handle is required';        
    }

    if(!isEmpty(data.website)){
        if(!Validator.isURL(data.website)){
            errors.website = 'Invalid Url';
        }
    }

    if(!isEmpty(data.youtube)){
        if(!Validator.isURL(data.youtube)){
            errors.youtube = 'Invalid youtube Url';
        }
    }

    if(!isEmpty(data.twitter)){
        if(!Validator.isURL(data.twitter)){
            errors.twitter = 'Invalid twitter Url';
        }
    }

    if(!isEmpty(data.facebook)){
        if(!Validator.isURL(data.facebook)){
            errors.facebook = 'Invalid facebook Url';
        }
    }

    if(!isEmpty(data.linkedin)){
        if(!Validator.isURL(data.linkedin)){
            errors.linkedin = 'Invalid linkedin Url';
        }
    }

    if(!isEmpty(data.instagram)){
        if(!Validator.isURL(data.instagram)){
            errors.instagram = 'Invalid instagram Url';
        }
    }


    return {
        errors,
        isValid: isEmpty(errors)
    }

}