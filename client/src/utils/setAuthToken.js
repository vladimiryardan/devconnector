import axios from 'axios';

const setAuthTOken = token => {
    if(token){
        //apply to every request
        axios.defaults.headers.common['Authorization'] = token;
    }else{
        //delete auth header
        delete axios.defaults.headers.common['Authorization'];
    }
}

export default setAuthTOken;