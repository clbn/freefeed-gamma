import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const { request, response, fail } = ActionHelpers;

export default function createPostForm(state = {}, action) {
  switch (action.type) {
    case request(ActionTypes.CREATE_POST): {
      return { ...state, status: 'loading' };
    }
    case response(ActionTypes.CREATE_POST): {
      return { ...state, status: 'success', lastPost: action.payload.posts };
    }
    case fail(ActionTypes.CREATE_POST): {
      console.log('action', action);
      return { ...state, status: 'error', errorMessage: (action.payload || {}).err };
    }
    case ActionTypes.RESET_POST_CREATE_FORM: {
      return { ...state, status: null };
    }
    case ActionTypes.ADD_ATTACHMENT_RESPONSE: {
      // If this is an attachment for edit-post (existent post),
      // it should be handled in posts(), not here
      if (action.payload.postId) {
        return state;
      }

      return { ...state,
        attachments: [...(state.attachments || []), action.payload.attachments.id]
      };
    }
    case ActionTypes.REMOVE_ATTACHMENT: {
      // If this is an attachment for edit-post (existent post),
      // it should be handled in posts(), not here
      if (action.payload.postId) {
        return state;
      }

      return { ...state,
        attachments: _.without((state.attachments || []), action.payload.attachmentId)
      };
    }
  }

  return state;
}
