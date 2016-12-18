import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';
import { getToken } from '../../services/auth';

const { response } = ActionHelpers;

export default function authenticated(state = !!getToken(), action) {
  switch (action.type) {
    case response(ActionTypes.SIGN_IN): {
      return true;
    }
    case response(ActionTypes.SIGN_UP): {
      return true;
    }
    case ActionTypes.UNAUTHENTICATED: {
      return false;
    }
  }
  return state;
}
