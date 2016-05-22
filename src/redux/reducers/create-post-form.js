import _ from 'lodash';

import * as ActionTypes from '../action-types';

export default function createPostForm(state = {}, action) {
  switch (action.type) {
    case ActionTypes.ADD_ATTACHMENT_RESPONSE: {
      // If this is an attachment for edit-post (existent post),
      // it should be handled in posts(), not here
      if (action.payload.postId) {
        return state;
      }

      return {...state,
        attachments: [...(state.attachments || []), action.payload.attachments.id]
      };
    }
    case ActionTypes.REMOVE_ATTACHMENT: {
      // If this is an attachment for edit-post (existent post),
      // it should be handled in posts(), not here
      if (action.payload.postId) {
        return state;
      }

      return {...state,
        attachments: _.without((state.attachments || []), action.payload.attachmentId)
      };
    }
  }

  return state;
}
