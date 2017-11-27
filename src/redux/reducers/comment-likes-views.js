import * as ActionTypes from '../action-types';
import { request, response, fail } from '../action-helpers';

export default function commentLikesView(state = {}, action) {
  switch (action.type) {
    case request(ActionTypes.GET_COMMENT_LIKES): {
      return { ...state,
        [action.payload.commentId]: {
          status: 'loading'
        },
      };
    }
    case response(ActionTypes.GET_COMMENT_LIKES): {
      return { ...state,
        [action.request.commentId]: {
          status: 'success',
          userIds: action.payload.likes && action.payload.likes.map(l => l.userId) || []
        },
      };
    }
    case fail(ActionTypes.GET_COMMENT_LIKES): {
      return { ...state,
        [action.request.commentId]: {
          status: 'error',
          errorMessage: (action.payload || {}).err
        },
      };
    }

    case response(ActionTypes.LIKE_COMMENT):
    case response(ActionTypes.UNLIKE_COMMENT): {
      const view = state[action.request.commentId] || {};
      return { ...state,
        [action.request.commentId]: { ...view,
          userIds: action.payload.likes && action.payload.likes.map(l => l.userId) || []
        }
      };
    }
  }
  return state;
}
