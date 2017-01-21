import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const { request, response, fail } = ActionHelpers;

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
    case request(ActionTypes.SIGN_UP): {
      return { ...state, loading: true };
    }
    case response(ActionTypes.SIGN_UP): {
      return { ...state, loading: false };
    }
    case fail(ActionTypes.SIGN_UP): {
      return { ...state, error: action.payload.err, loading: false };
    }
  }
  return state;
}
