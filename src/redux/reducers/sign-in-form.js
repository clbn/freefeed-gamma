import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const { request, response, fail } = ActionHelpers;

export default function signInForm(state = {}, action) {
  switch (action.type) {
    case request(ActionTypes.SIGN_IN): {
      return { ...state, status: 'loading' };
    }
    case response(ActionTypes.SIGN_IN): {
      return { ...state, status: 'success' };
    }
    case fail(ActionTypes.SIGN_IN): {
      // TODO: remove this when API is updated
      if (action.payload && action.payload.err && action.payload.err.message) {
        return { ...state, status: 'error', errorMessage: action.payload.err.message };
      }

      return { ...state, status: 'error', errorMessage: (action.payload || {}).err };
    }
  }
  return state;
}
