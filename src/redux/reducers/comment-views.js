import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const { request, response, fail } = ActionHelpers;
const indexById = list => _.keyBy(list || [], 'id');

const updateCommentViews = (state, comments) => {
  const commentViews = comments.map(comment => ({
    id: comment.id,
    isEditing: false
  }));
  const viewStateMap = indexById(commentViews);
  return { ...viewStateMap, ...state };
};

export default function commentViews(state={}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return updateCommentViews(state, action.payload.comments || []);
  }
  switch (action.type) {
    case response(ActionTypes.SHOW_MORE_COMMENTS): {
      return updateCommentViews(state, action.payload.comments || []);
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      return updateCommentViews(state, action.payload.comments || []);
    }
    case ActionTypes.TOGGLE_EDITING_COMMENT: {
      return {
        ...state,
        [action.commentId]: {
          ...state[action.commentId],
          isEditing: !state[action.commentId].isEditing,
          errorMessage: ''
        }
      };
    }
    case request(ActionTypes.SAVE_EDITING_COMMENT): {
      return { ...state, [action.payload.commentId]: { ...state[action.payload.commentId], isSaving: true } };
    }
    case response(ActionTypes.SAVE_EDITING_COMMENT): {
      return { ...state, [action.payload.comments.id]: { ...state[action.payload.comments.id], isEditing: false, isSaving: false, errorMessage: '' } };
    }
    case fail(ActionTypes.SAVE_EDITING_COMMENT): {
      return { ...state, [action.request.commentId]: { ...state[action.request.commentId], isEditing: true, isSaving: false, errorMessage: (action.payload || {}).err } };
    }
    case response(ActionTypes.DELETE_COMMENT): {
      const newState = { ...state };
      delete newState[action.request.commentId];
      return newState;
    }
    case response(ActionTypes.ADD_COMMENT): {
      return { ...state,
        [action.payload.comments.id]: {
          id: action.payload.comments.id,
          isEditing: false
        }
      };
    }
    case ActionTypes.REALTIME_COMMENT_NEW:
    case ActionTypes.REALTIME_COMMENT_UPDATE: {
      return { ...state,
        [action.comment.id]: {
          id: action.comment.id,
          isEditing: false
        }
      };
    }
    case ActionTypes.REALTIME_COMMENT_DESTROY: {
      return { ...state,
        [action.commentId]: undefined
      };
    }
    case ActionTypes.REALTIME_POST_NEW: {
      return updateCommentViews(state, action.comments || []);
    }

    case ActionTypes.UPDATE_HIGHLIGHTED_COMMENTS: {
      const newState = { ...state };
      _.forEach(newState, (view, commentId) => {
        const prev = !!newState[commentId].isHighlighted; // "!!" is NOT redundant here, it casts undefined to false for proper comparison
        const next = (action.payload.comments.indexOf(commentId) > -1);
        if (prev !== next) {
          newState[commentId] = { ...newState[commentId], isHighlighted: next };
        }
      });
      return newState;
    }

    case ActionTypes.UNAUTHENTICATED: {
      return {};
    }
  }
  return state;
}
