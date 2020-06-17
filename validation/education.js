const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateEducationInput(data){
    let errors = {};

    data.school = !isEmpty(data.school) ? data.school : '';
    data.degree = !isEmpty(data.degree) ? data.degree : '';
    data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : '';
    data.from = !isEmpty(data.from) ? data.from : '';


    if(!Validator.isLength(data.school, {min: 2,max: 40}) ){
        errors.school = 'School between 2 and 4 characters';
    }
    
    if(Validator.isEmpty(data.degree)){
        errors.degree = 'Degree handle is required';        
    }
    
    if(Validator.isEmpty(data.fieldofstudy)){
        errors.fieldofstudy = 'Field of study handle is required';        
    }

    if(Validator.isEmpty(data.from)){
        errors.from = 'Date from handle is required';        
    }
   


    return {
        errors,
        isValid: isEmpty(errors)
    }

}