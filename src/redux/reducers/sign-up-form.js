import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const { request, response, fail } = ActionHelpers;

export default function signUpForm(state = {}, action) {
  switch (action.type) {
    case request(ActionTypes.SIGN_UP): {
      return { ...state, status: 'loading' };
    }
    case response(ActionTypes.SIGN_UP): {
      return { ...state, status: 'success' };
    }
    case fail(ActionTypes.SIGN_UP): {
      return { ...state, status: 'error', errorMessage: (action.payload || {}).err };
    }
  }
  return state;
}
