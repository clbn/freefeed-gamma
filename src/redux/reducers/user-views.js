import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const {request, response, fail} = ActionHelpers;

export default function userViews(state = {}, action) {
  switch (action.type) {
    case request(ActionTypes.SUBSCRIBE):
    case request(ActionTypes.UNSUBSCRIBE): {
      const userId = action.payload.id;
      const userView = state[userId];
      return {...state, [userId]: {...userView, isSubscribing: true}};
    }
    case response(ActionTypes.SUBSCRIBE):
    case response(ActionTypes.UNSUBSCRIBE):
    case fail(ActionTypes.SUBSCRIBE):
    case fail(ActionTypes.UNSUBSCRIBE): {
      const userId = action.request.id;
      const userView = state[userId];
      return {...state, [userId]: {...userView, isSubscribing: false}};
    }

    case request(ActionTypes.BAN):
    case request(ActionTypes.UNBAN): {
      const userId = action.payload.id;
      const userView = state[userId];
      return {...state, [userId]: {...userView, isBlocking: true}};
    }
    case response(ActionTypes.BAN):
    case response(ActionTypes.UNBAN):
    case fail(ActionTypes.BAN):
    case fail(ActionTypes.UNBAN): {
      const userId = action.request.id;
      const userView = state[userId];
      return {...state, [userId]: {...userView, isBlocking: false}};
    }
  }

  return state;
}
