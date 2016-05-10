import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const {request, response, fail} = ActionHelpers;

const INITIAL_SIGN_UP_FORM_STATE = {
  username: '',
  password: '',
  email: '',
  captcha: null,
  error: '',
  loading: false
};

export default function signUpForm(state = INITIAL_SIGN_UP_FORM_STATE, action) {
  switch (action.type) {
    case ActionTypes.SIGN_UP_CHANGE: {
      return {
        ...state,
        username: action.username || state.username,
        password: action.password || state.password,
        email: action.email || state.email,
        captcha: typeof action.captcha == 'undefined' ? state.captcha : action.captcha,
        loading: false,
        error: ''
      };
    }
    case ActionTypes.SIGN_UP_EMPTY: {
      return {...state, error: action.message, loading: false };
    }
    case request(ActionTypes.SIGN_UP): {
      return {...state, loading: true };
    }
    case response(ActionTypes.SIGN_UP): {
      return {...state, loading: false };
    }
    case fail(ActionTypes.SIGN_UP): {
      return {...state, error: action.payload.err, loading: false };
    }
  }
  return state;
}
