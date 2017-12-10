import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const { request, response, fail } = ActionHelpers;

const updateRecord = (state, id, props) => {
  return { ...state, [id]: { ...state[id], ...props } };
};

const deleteRecord = (state, id) => {
  if (!state[id]) {
    return state;
  }
  const newState = { ...state };
  delete newState[id];
  return newState;
};

export default function commentViews(state={}, action) {
  switch (action.type) {
    case ActionTypes.TOGGLE_EDITING_COMMENT: {
      const id = action.commentId;
      const currentValue = (state[id] || {}).isEditing;
      return updateRecord(state, id, { isEditing: !currentValue, errorMessage: null });
    }
    case request(ActionTypes.SAVE_EDITING_COMMENT): {
      const id = action.payload.commentId;
      return updateRecord(state, id, { isSaving: true });
    }
    case response(ActionTypes.SAVE_EDITING_COMMENT): {
      const id = action.payload.comments.id;
      return updateRecord(state, id, { isEditing: false, isSaving: false, errorMessage: null });
    }
    case fail(ActionTypes.SAVE_EDITING_COMMENT): {
      const id = action.request.commentId;
      const error = (action.payload || {}).err;
      return updateRecord(state, id, { isEditing: true, isSaving: false, errorMessage: error });
    }
    case response(ActionTypes.DELETE_COMMENT): {
      const id = action.request.commentId;
      return deleteRecord(state, id);
    }
    case response(ActionTypes.ADD_COMMENT): {
      const id = action.payload.comments.id;
      return updateRecord(state, id, { isEditing: false });
    }

    case request(ActionTypes.LIKE_COMMENT):
    case request(ActionTypes.UNLIKE_COMMENT): {
      const id = action.payload.commentId;
      return updateRecord(state, id, { isLiking: true });
    }
    case response(ActionTypes.LIKE_COMMENT):
    case response(ActionTypes.UNLIKE_COMMENT): {
      const id = action.request.commentId;
      return updateRecord(state, id, { isLiking: false, likeError: null });
    }
    case fail(ActionTypes.LIKE_COMMENT):
    case fail(ActionTypes.UNLIKE_COMMENT): {
      const id = action.request.commentId;
      const error = 'Something went wrong while liking the comment...';
      return updateRecord(state, id, { isLiking: false, likeError: error });
    }

    case ActionTypes.REALTIME_COMMENT_DESTROY: {
      const id = action.commentId;
      return deleteRecord(state, id);
    }

    case ActionTypes.UPDATE_HIGHLIGHTED_COMMENTS: {
      const newState = { ...state };
      _.forEach(action.payload.comments, (commentId) => {
        newState[commentId] = newState[commentId] || {};
      });
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
