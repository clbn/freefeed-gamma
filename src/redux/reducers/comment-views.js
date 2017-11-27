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
      const id = action.payload.comments.id;
      return { ...state,
        [id]: { ...state[id],
          id: action.payload.comments.id,
          isEditing: false
        }
      };
    }

    case request(ActionTypes.LIKE_COMMENT):
    case request(ActionTypes.UNLIKE_COMMENT): {
      const id = action.payload.commentId;
      return { ...state,
        [id]: { ...state[id],
          isLiking: true
        }
      };
    }
    case response(ActionTypes.LIKE_COMMENT):
    case response(ActionTypes.UNLIKE_COMMENT): {
      const id = action.request.commentId;
      return { ...state,
        [id]: { ...state[id],
          isLiking: false
        }
      };
    }
    case fail(ActionTypes.LIKE_COMMENT):
    case fail(ActionTypes.UNLIKE_COMMENT): {
      const id = action.request.commentId;
      const errorString = 'Something went wrong while liking the comment...';
      return { ...state,
        [id]: { ...state[id],
          isLiking: false,
          likeError: errorString
        }
      };
    }

    case ActionTypes.REALTIME_COMMENT_NEW:
    case ActionTypes.REALTIME_COMMENT_UPDATE: {
      const id = action.comment.id;
      return { ...state,
        [id]: { ...state[id],
          id: action.comment.id,
          isEditing: false
        }
      };
    }
    case ActionTypes.REALTIME_COMMENT_DESTROY: {
      const newState = { ...state };
      delete newState[action.commentId];
      return newState;
    }
    case ActionTypes.REALTIME_POST_NEW: {
      return updateCommentViews(state, action.comments || []);
    }

    case ActionTypes.UPDATE_HIGHLIGHTED_COMMENTS: {
      const newState = { ...state };
      _.forEach(newState, (view, commentId) => {
        const prev = !!view.isHighlighted; // "!!" is NOT redundant here, it casts undefined to false for proper comparison
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
