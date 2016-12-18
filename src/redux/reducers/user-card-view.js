import * as ActionTypes from '../action-types';

export default function userCardView(state = {}, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_USER_CARD: {
      return { ...state, ...action.payload };
    }
  }

  return state;
}
