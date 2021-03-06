import jwtDecode from 'jwt-decode';

import { REHYDRATE } from 'redux-persist/constants'

import { hashHistory } from 'react-router'

import { socket } from '../utils/socket';

const initialState = {
  token: null,
  email: null,
  isAuthenticated: false,
  isAuthenticating: false,
  loginStatusText: null,
  signUpStatusText: null,
  hasSignedUp: false,
  committee: null,
  firstName: null,
  lastName: null,
  school: null,
  userLevel: null,
  country: null,
  partner: null,
  admins: null
};

export function auth(state = initialState, action) {

  switch (action.type) {
    case REHYDRATE: 
      const incoming = action.payload.auth;

      // We don't want old error messages.
      if (incoming) {      
        incoming.loginStatusText = null;
        incoming.signUpStatusText = null;
      }

      if (incoming && incoming.token) {
        socket.emit("subscribe", {token: incoming.token})
        return {...state, ...incoming}
      } 
      return state;

    case 'LOGIN_USER_REQUEST': 
      // TODO: Use immutable.js
      return Object.assign({}, state, {
        'isAuthenticating': true
      });

    case 'LOGIN_USER_FAILURE': 
      return Object.assign({}, state, {
        'isAuthenticating': false,
        'isAuthenticated': false,
        'token': null,
        'loginStatusText': `Authentication Error: ${action.status} ${action.statusText}`
      });

    case 'LOGIN_USER_SUCCESS': 

      const usrObject = jwtDecode(action.token);
      return Object.assign({}, state, {
        'isAuthenticating': false,
        'isAuthenticated': true,
        'token': action.token,
        'firstName': usrObject.firstName,
        'lastName': usrObject.lastName,
        'committee': usrObject.committee,
        'userLevel': usrObject.userLevel,
        'school': usrObject.school,
        'email': usrObject.email,
        'country': usrObject.country,
        'partner': usrObject.partner,
        'admins': usrObject.admins,
        'loginStatusText': 'You have been successfully logged in.'
      });

    case 'SIGNUP_USER_SUCCESS':
      return Object.assign({}, state, {
        'isAuthenticating': false,
        'isAuthenticated': false,
        'token': null,
        'hasSignedUp': true,
        'signUpStatusText': 'You have validated your account. You can sign up now!'
      }); 

    case 'SIGNUP_USER_FAILURE': 
      return Object.assign({}, state, {
        'isAuthenticating': false,
        'isAuthenticated': false,
        'token': null,
        'hasSignedUp': false,
        'signUpStatusText': `Authentication Error: ${action.status} ${action.statusText}`
      });

    case 'LOGIN_PASSWORD_RESET_FAILURE': 
      return Object.assign({}, state, {
        'isAuthenticating': false,
        'isAuthenticated': false,
        'token': null,
        'hasSignedUp': false,
        'loginStatusText': `We couldn't find your email address. Talk to an admin!`
      });

    case 'LOGIN_PASSWORD_RESET_SUCCESS': 
      return Object.assign({}, state, {
        'isAuthenticating': false,
        'isAuthenticated': false,
        'token': null,
        'hasSignedUp': false,
        'loginStatusText': `Check your email for password reset intructions`
      });

    case 'LOGOUT_USER' : 
      return Object.assign({}, state, initialState);

    default:
      return state;

  }
}

