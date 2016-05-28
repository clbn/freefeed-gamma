import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const {request, response, fail} = ActionHelpers;
const indexById = list => _.keyBy(list || [], 'id');

const NO_ERROR = {
  isError: false,
  errorMessage: ''
};

const updateCommentViews = (state, action) => {
  const comments = action.payload.comments || [];
  const commentViews = comments.map(comment => ({
    id: comment.id,
    isEditing: false,
    editText: comment.body
  }));
  const viewStateMap = indexById(commentViews);
  return {...viewStateMap, ...state};
};

export default function commentViews(state={}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return updateCommentViews(state, action);
  }
  switch (action.type) {
    case response(ActionTypes.SHOW_MORE_COMMENTS): {
      return updateCommentViews(state, action);
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      return updateCommentViews(state, action);
    }
    case ActionTypes.TOGGLE_EDITING_COMMENT: {
      return {
        ...state,
        [action.commentId]: {
          ...state[action.commentId],
          isEditing: !state[action.commentId].isEditing
        }
      };
    }
    case request(ActionTypes.SAVE_EDITING_COMMENT): {
      return {...state, [action.payload.commentId]: {...state[action.payload.commentId], editText: action.payload.newCommentBody, isSaving: true}};
    }
    case response(ActionTypes.SAVE_EDITING_COMMENT): {
      return {...state, [action.payload.comments.id]: {...state[action.payload.comments.id], isEditing: false, isSaving: false, editText: action.payload.comments.body, ...NO_ERROR}};
    }
    case fail(ActionTypes.SAVE_EDITING_COMMENT): {
      return {...state, [action.request.commentId]: {...state[action.request.commentId], isEditing: true, isSaving: false, errorMessage: (action.payload || {}).err}};
    }
    case response(ActionTypes.DELETE_COMMENT): {
      return {...state, [action.request.commentId] : undefined};
    }
    case response(ActionTypes.ADD_COMMENT): {
      return {...state,
        [action.payload.comments.id] : {
          id: action.payload.comments.id,
          isEditing: false,
          editText: action.payload.comments.body
        }
      };
    }
    case ActionTypes.REALTIME_COMMENT_NEW:
    case ActionTypes.REALTIME_COMMENT_UPDATE: {
      return {...state,
        [action.comment.id]: {
          id: action.comment.id,
          isEditing: false,
          editText: action.comment.body
        }
      };
    }
    case ActionTypes.REALTIME_COMMENT_DESTROY: {
      return {...state,
        [action.commentId]: undefined
      };
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {};
    }
  }
  return state;
}
