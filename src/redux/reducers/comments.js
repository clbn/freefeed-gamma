import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const { response } = ActionHelpers;
const indexById = list => _.keyBy(list || [], 'id');
const mergeByIds = (state, array) => ({ ...state, ...indexById(array) });

export default function comments(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, action.payload.comments);
  }
  switch (action.type) {
    case response(ActionTypes.GET_SINGLE_POST):
    case response(ActionTypes.SHOW_MORE_COMMENTS):
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      return mergeByIds(state, action.payload.comments);
    }
    case response(ActionTypes.SAVE_EDITING_COMMENT): {
      return { ...state, [action.payload.comments.id]: { ...state[action.payload.comments.id], ...action.payload.comments } };
    }
    case response(ActionTypes.LIKE_COMMENT): {
      const id = action.request.commentId;
      return { ...state, [id]: { ...state[id], hasOwnLike: true, likes: action.payload.likes.length } };
    }
    case response(ActionTypes.UNLIKE_COMMENT): {
      const id = action.request.commentId;
      return { ...state, [id]: { ...state[id], hasOwnLike: false, likes: action.payload.likes.length } };
    }
    case response(ActionTypes.DELETE_COMMENT): {
      const newState = { ...state };
      delete newState[action.request.commentId];
      return newState;
    }
    case ActionTypes.REALTIME_COMMENT_NEW:
    case ActionTypes.REALTIME_COMMENT_UPDATE: {
      return mergeByIds(state, [action.comment]);
    }
    case ActionTypes.REALTIME_COMMENT_DESTROY: {
      const newState = { ...state };
      delete newState[action.commentId];
      return newState;
    }
    case response(ActionTypes.ADD_COMMENT): {
      return { ...state,
        [action.payload.comments.id]: action.payload.comments
      };
    }
    case ActionTypes.REALTIME_POST_NEW: {
      return mergeByIds(state, action.comments);
    }
  }
  return state;
}
