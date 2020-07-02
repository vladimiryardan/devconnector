import axios from 'axios';

import{
    ADD_POST,
    GET_ERRORS,
    GET_POST,
    POST_LOADING,
    GET_POSTS,
    DELETE_POST
} from './types'

//Add Post
export const addPost = postData => dispatch => {
    axios
        .post('/api/posts', postData)
        .then(res =>
            dispatch({
                type: ADD_POST,
                payload: res.data
            })
        )
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        )    
}
//Delete Post
export const deletePost = id => dispatch => {
    axios
        .delete(`/api/posts/${id}`, id)
        .then(res =>
            dispatch({
                type: DELETE_POST,
                payload: id
            })
        )
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        )    
}
//Get Post
export const getPosts = ()   => dispatch => {
    dispatch(SetPostLoading());

    axios
        .get('/api/posts')
        .then(res =>
            dispatch({
                type: GET_POSTS,
                payload: res.data
            })
        )
        .catch(err =>
            dispatch({
                type: GET_POSTS,
                payload: null
            }))    
}

// Add Like
export const addLike = id => dispatch => {
    axios
      .post(`/api/posts/like/${id}`)
      .then(res => dispatch(getPosts()))
      .catch(err =>
        dispatch({
          type: GET_ERRORS,
          payload: err.response.data
        })
      );
  };
 
 // Remove Like
export const removeLike = id => dispatch => {
    axios
      .post(`/api/posts/unlike/${id}`)
      .then(res => dispatch(getPosts()))
      .catch(err =>
        dispatch({
          type: GET_ERRORS,
          payload: err.response.data
        })
      );
  }; 

  
//Set loading state
export const SetPostLoading = () =>{
    return{
        type: POST_LOADING
    }
}