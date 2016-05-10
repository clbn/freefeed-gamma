import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const {request, response} = ActionHelpers;

const initForm = {
  username: '',
  password: '',
  error: '',
  loading: false
};

export default function signInForm(state = initForm, action) {
  switch (action.type) {
    case ActionTypes.SIGN_IN_CHANGE: {
      return {
        ...state,
        username: action.username || state.username,
        password: action.password || state.password,
        loading: false
      };
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {...state, error: (action.payload || {}).err, loading: false };
    }
    case ActionTypes.SIGN_IN_EMPTY: {
      return {...state, error: 'Enter login and password', loading: false };
    }
    case request(ActionTypes.SIGN_IN): {
      return {...state, loading: true };
    }
    case response(ActionTypes.SIGN_IN): {
      return {...state, loading: false };
    }
  }
  return state;
}
