import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const { request, response, fail } = ActionHelpers;
const indexById = list => _.keyBy(list || [], 'id');
const mergeByIds = (state, array) => ({ ...state, ...indexById(array) });

const initPostViewState = (post) => {
  const id = post.id;
  const isEditing = false;
  const errorStatus = '';
  const errorMessage = '';
  const commentError = '';

  return { id, isEditing, errorStatus, errorMessage, commentError };
};

export default function postViews(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, (action.payload.posts || []).map(initPostViewState));
  }
  switch (action.type) {
    case request(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      const id = action.payload.postId;
      const isLoadingLikes = true;
      return { ...state, [id]: { ...state[id], isLoadingLikes } };
    }
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      const id = action.payload.posts.id;
      const isLoadingLikes = false;
      return { ...state, [id]: { ...state[id], isLoadingLikes } };
    }
    case fail(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      const id = action.request.postId;
      const isLoadingLikes = false;
      return { ...state, [id]: { ...state[id], isLoadingLikes } };
    }
    case request(ActionTypes.SHOW_MORE_COMMENTS):
    case request(ActionTypes.GET_SINGLE_POST): {
      const id = action.payload.postId;
      const isLoadingComments = true;
      return { ...state, [id]: { ...state[id], isLoadingComments } };
    }
    case response(ActionTypes.SHOW_MORE_COMMENTS): {
      const id = action.payload.posts.id;
      const isLoadingComments = false;
      return { ...state, [id]: { ...state[id], isLoadingComments } };
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      const id = action.payload.posts.id;
      return { ...state, [id]: initPostViewState(action.payload.posts) };
    }
    case ActionTypes.REALTIME_POST_NEW:
    case ActionTypes.REALTIME_POST_UPDATE: {
      const id = action.post.id;
      const postAlreadyAdded = !!state[id];
      if (postAlreadyAdded) {
        return state;
      }
      return { ...state, [id]: initPostViewState(action.post) };
    }
    case fail(ActionTypes.GET_SINGLE_POST): {
      const id = action.request.postId;
      const isEditing = false;
      const errorStatus = action.response.status + ' ' + action.response.statusText;
      const errorMessage = (action.payload || {}).err;
      return { ...state, [id]: { id, isEditing, errorStatus, errorMessage } };
    }
    case ActionTypes.TOGGLE_EDITING_POST: {
      const id = action.payload.postId;
      const isEditing = !state[id].isEditing;
      return { ...state, [id]: { ...state[id], isEditing, errorStatus: '', errorMessage: '' } };
    }
    case ActionTypes.CANCEL_EDITING_POST: {
      const id = action.payload.postId;
      const isEditing = false;
      return { ...state, [id]: { ...state[id], isEditing, errorStatus: '', errorMessage: '' } };
    }
    case request(ActionTypes.SAVE_EDITING_POST): {
      const id = action.payload.postId;
      return { ...state, [id]: { ...state[id], isSaving: true } };
    }
    case response(ActionTypes.SAVE_EDITING_POST): {
      const id = action.payload.posts.id;
      return { ...state, [id]: { ...state[id], isEditing: false, isSaving: false, errorStatus: '', errorMessage: '' } };
    }
    case fail(ActionTypes.SAVE_EDITING_POST): {
      const id = action.request.postId;
      const isEditing = true;
      const isSaving = false;
      const errorStatus = action.response.status + ' ' + action.response.statusText;
      const errorMessage = (action.payload || {}).err;
      return { ...state, [id]: { ...state[id], isEditing, isSaving, errorStatus, errorMessage } };
    }
    case fail(ActionTypes.DELETE_POST): {
      const id = action.request.postId;
      const errorStatus = action.response.status + ' ' + action.response.statusText;
      const errorMessage = (action.payload || {}).err;
      return { ...state, [id]: { ...state[id], errorStatus, errorMessage } };
    }
    case ActionTypes.TOGGLE_COMMENTING: {
      return { ...state,
        [action.postId]: { ...state[action.postId],
          isCommenting: !state[action.postId].isCommenting,
          commentError: ''
        }
      };
    }
    case request(ActionTypes.ADD_COMMENT): {
      const post = state[action.payload.postId];
      return { ...state,
        [post.id]: {
          ...post,
          isSavingComment: true
        } };
    }
    case response(ActionTypes.ADD_COMMENT): {
      const post = state[action.request.postId];
      return { ...state,
        [post.id]: {
          ...post,
          isCommenting: false,
          isSavingComment: false
        }
      };
    }
    case fail(ActionTypes.ADD_COMMENT): {
      const post = state[action.request.postId];
      return { ...state,
        [post.id]: {
          ...post,
          isSavingComment: false,
          commentError: (action.payload || {}).err
        }
      };
    }
    case request(ActionTypes.LIKE_POST): {
      const post = state[action.payload.postId];
      return { ...state,
        [post.id]: {
          ...post,
          isLiking: true
        } };
    }
    case response(ActionTypes.LIKE_POST): {
      const post = state[action.request.postId];
      return { ...state,
        [post.id]: {
          ...post,
          isLiking: false
        }
      };
    }
    case fail(ActionTypes.LIKE_POST): {
      const post = state[action.request.postId];
      const errorString = 'Something went wrong while liking the post...';
      return { ...state,
        [post.id]: {
          ...post,
          isLiking: false,
          likeError: errorString
        }
      };
    }
    case request(ActionTypes.UNLIKE_POST): {
      const post = state[action.payload.postId];
      return { ...state,
        [post.id]: {
          ...post,
          isLiking: true
        } };
    }
    case response(ActionTypes.UNLIKE_POST): {
      const post = state[action.request.postId];
      return { ...state,
        [post.id]: {
          ...post,
          isLiking: false
        }
      };
    }
    case fail(ActionTypes.UNLIKE_POST): {
      const post = state[action.request.postId];
      const errorString = 'Something went wrong while un-liking the post...';
      return { ...state,
        [post.id]: {
          ...post,
          isLiking: false,
          likeError: errorString
        }
      };
    }

    case request(ActionTypes.HIDE_POST): {
      const post = state[action.payload.postId];
      return { ...state,
        [post.id]: { ...post,
          isHiding: true
        } };
    }
    case response(ActionTypes.HIDE_POST): {
      const post = state[action.request.postId];
      return { ...state,
        [post.id]: { ...post,
          isHiding: false
        }
      };
    }
    case ActionTypes.REALTIME_POST_HIDE: {
      const post = state[action.postId];
      if (!post) {
        return state;
      }
      return { ...state,
        [post.id]: { ...post,
          isHiding: false
        }
      };
    }
    case fail(ActionTypes.HIDE_POST): {
      const post = state[action.request.postId];
      return { ...state,
        [post.id]: { ...post,
          isHiding: false,
          hideError: 'Something went wrong while hiding the post.'
        }
      };
    }

    case request(ActionTypes.UNHIDE_POST): {
      const post = state[action.payload.postId];
      return { ...state,
        [post.id]: { ...post,
          isHiding: true
        } };
    }
    case response(ActionTypes.UNHIDE_POST): {
      const post = state[action.request.postId];
      return { ...state,
        [post.id]: { ...post,
          isHiding: false
        }
      };
    }
    case ActionTypes.REALTIME_POST_UNHIDE: {
      const post = state[action.postId];
      if (!post) {
        return state;
      }
      return { ...state,
        [post.id]: { ...post,
          isHiding: false
        }
      };
    }
    case fail(ActionTypes.UNHIDE_POST): {
      const post = state[action.request.postId];
      return { ...state,
        [post.id]: { ...post,
          isHiding: false,
          hideError: 'Something went wrong while un-hiding the post.'
        }
      };
    }

    case ActionTypes.TOGGLE_MODERATING_COMMENTS: {
      const post = state[action.postId];
      return { ...state,
        [post.id]: { ...post,
          isModeratingComments: !post.isModeratingComments
        }
      };
    }

    case request(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.payload.postId];
      return { ...state,
        [post.id]: { ...post,
          isDisablingComments: true
        }
      };
    }
    case response(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.request.postId];
      return { ...state,
        [post.id]: { ...post,
          isDisablingComments: false,
          commentsDisabled: true
        }
      };
    }
    case fail(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.request.postId];
      return { ...state,
        [post.id]: { ...post,
          isDisablingComments: false,
          disableCommentsError: 'Something went wrong while disabling comments.'
        }
      };
    }

    case request(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.payload.postId];
      return { ...state,
        [post.id]: { ...post,
          isDisablingComments: true
        } };
    }
    case response(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.request.postId];
      return { ...state,
        [post.id]: { ...post,
          isDisablingComments: false,
          commentsDisabled: false
        }
      };
    }
    case fail(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.request.postId];
      return { ...state,
        [post.id]: { ...post,
          isDisablingComments: false,
          disableCommentsError: 'Something went wrong while enabling comments.'
        }
      };
    }

    case response(ActionTypes.CREATE_POST): {
      const post = action.payload.posts;
      return { ...state,
        [post.id]: initPostViewState(post)
      };
    }

    case ActionTypes.UNAUTHENTICATED: {
      return {};
    }
  }

  return state;
}
