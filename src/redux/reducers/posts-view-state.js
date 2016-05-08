import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const {request, response, fail} = ActionHelpers;
const indexById = list => _.keyBy(list || [], 'id');
const mergeByIds = (state, array) => ({...state, ...indexById(array)});

const POST_SAVE_ERROR = 'Something went wrong while editing the post...';
const NEW_COMMENT_ERROR = 'Failed to add comment';
const NO_ERROR = {
  isError: false,
  errorString: '',
  commentError: ''
};

const initPostViewState = (post) => {
  const id = post.id;

  const omittedComments = post.omittedComments;
  const omittedLikes = post.omittedLikes;
  const isEditing = false;
  const editingText = post.body;

  return {omittedComments, omittedLikes, id, isEditing, editingText, ...NO_ERROR};
};

export default function postsViewState(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, (action.payload.posts || []).map(initPostViewState));
  }
  switch (action.type) {
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      const id = action.payload.posts.id;
      const omittedLikes = 0;

      return { ...state, [id]: { ...state[id], omittedLikes, ...NO_ERROR } };
    }
    case request(ActionTypes.SHOW_MORE_COMMENTS): {
      const id = action.payload.postId;
      const isLoadingComments = true;

      return { ...state, [id]: { ...state[id], isLoadingComments } };
    }
    case response(ActionTypes.SHOW_MORE_COMMENTS): {
      const id = action.payload.posts.id;
      const isLoadingComments = false;
      const omittedComments = 0;

      return { ...state, [id]: { ...state[id], isLoadingComments, omittedComments, ...NO_ERROR } };
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

      const isError = true;
      const errorString = action.response.status + ' ' + action.response.statusText;

      return { ...state, [id]: { id, isEditing, isError, errorString }};
    }
    case ActionTypes.SHOW_MORE_LIKES_SYNC: {
      const id = action.payload.postId;
      const omittedLikes = 0;

      return { ...state, [id]: { ...state[id], omittedLikes, ...NO_ERROR } };
    }
    case ActionTypes.TOGGLE_EDITING_POST: {
      const id = action.payload.postId;
      const editingText = action.payload.newValue;
      const isEditing = !state[id].isEditing;

      return { ...state, [id]: { ...state[id], isEditing, editingText, ...NO_ERROR } };
    }
    case ActionTypes.CANCEL_EDITING_POST: {
      const id = action.payload.postId;
      const editingText = action.payload.newValue;
      const isEditing = false;

      return { ...state, [id]: { ...state[id], isEditing, editingText, ...NO_ERROR } };
    }
    case request(ActionTypes.SAVE_EDITING_POST): {
      const id = action.payload.postId;
      return { ...state, [id]: { ...state[id], isSaving: true } };
    }
    case response(ActionTypes.SAVE_EDITING_POST): {
      const id = action.payload.posts.id;
      const editingText = action.payload.posts.body;
      const isEditing = false;
      const isSaving = false;

      return { ...state, [id]: { ...state[id], isEditing, isSaving, editingText, ...NO_ERROR } };
    }
    case fail(ActionTypes.SAVE_EDITING_POST): {
      const id = action.request.postId;
      const isEditing = false;

      const isError = true;

      return { ...state, [id]: { ...state[id], isEditing, isSaving, isError, errorString: POST_SAVE_ERROR} };
    }
    case fail(ActionTypes.DELETE_POST): {
      const id = action.request.postId;

      const isError = true;
      const errorString = 'Something went wrong while deleting the post...';

      return { ...state, [id]: { ...state[id], isError, errorString} };
    }
    case ActionTypes.TOGGLE_COMMENTING: {
      return {...state,
        [action.postId] : {
          ...state[action.postId],
          isCommenting:!state[action.postId].isCommenting,
          newCommentText: state[action.postId].newCommentText || '' }
      };
    }
    case ActionTypes.UPDATE_COMMENTING_TEXT: {
      const postState = state[action.postId];
      return {...state,
        [action.postId]: {...postState,
          newCommentText: action.commentText
        }
      };
    }
    case request(ActionTypes.ADD_COMMENT): {
      const post = state[action.payload.postId];
      return {...state,
        [post.id] : {
          ...post,
          isSavingComment: true
        }};
    }
    case response(ActionTypes.ADD_COMMENT): {
      const post = state[action.request.postId];
      return {...state,
        [post.id] : {
          ...post,
          isCommenting: false,
          isSavingComment: false,
          newCommentText: '',
          omittedComments: (post.omittedComments ? post.omittedComments + 1 : 0)
        }
      };
    }
    case fail(ActionTypes.ADD_COMMENT): {
      const post = state[action.request.postId];
      return {...state,
        [post.id] : {
          ...post,
          isSavingComment: false,
          commentError: NEW_COMMENT_ERROR
        }
      };
    }
    case ActionTypes.REALTIME_COMMENT_NEW: {
      const post = state[action.comment.postId];
      if (!post) {
        return state;
      }
      return {...state,
        [post.id] : {
          ...post,
          omittedComments: (post.omittedComments ? post.omittedComments + 1 : 0)
        }
      };
    }
    case ActionTypes.REALTIME_COMMENT_DESTROY: {
      if (!action.postId) {
        return state;
      }
      const post = state[action.postId];
      if (!post) {
        return state;
      }
      return {
        ...state,
        [action.postId] : {
          ...post,
          omittedComments: (post.omittedComments ? post.omittedComments - 1 : 0)
        }
      };
    }
    // This doesn't work currently, since there's no information in the server
    // response, and just with request.commentId it's currently impossible to
    // find the post in postsViewState's state.
    // TODO: Fix this.
    /*
     case response(ActionTypes.DELETE_COMMENT): {
     const commentId = action.request.commentId
     const post = _(state).find(post => (post.comments||[]).indexOf(commentId) !== -1)
     return {...state,
     [post.id]: {...post,
     omittedComments: (post.omittedComments ? post.omittedComments - 1 : 0)
     }
     }
     }
     */
    case request(ActionTypes.LIKE_POST): {
      const post = state[action.payload.postId];
      return {...state,
        [post.id] : {
          ...post,
          isLiking: true
        }};
    }
    case response(ActionTypes.LIKE_POST): {
      const post = state[action.request.postId];
      return {...state,
        [post.id] : {
          ...post,
          isLiking: false,
          omittedLikes: (post.omittedLikes > 0 ? post.omittedLikes + 1 : 0)
        }
      };
    }
    case fail(ActionTypes.LIKE_POST): {
      const post = state[action.request.postId];
      const errorString = 'Something went wrong while liking the post...';
      return {...state,
        [post.id] : {
          ...post,
          isLiking: false,
          likeError: errorString
        }
      };
    }
    case request(ActionTypes.UNLIKE_POST): {
      const post = state[action.payload.postId];
      return {...state,
        [post.id] : {
          ...post,
          isLiking: true
        }};
    }
    case response(ActionTypes.UNLIKE_POST): {
      const post = state[action.request.postId];
      return {...state,
        [post.id] : {
          ...post,
          isLiking: false,
          omittedLikes: (post.omittedLikes > 0 ? post.omittedLikes - 1 : 0)
        }
      };
    }
    case ActionTypes.REALTIME_LIKE_REMOVE: {
      const post = state[action.postId];
      if (!post) {
        return state;
      }
      return {...state,
        [post.id] : {
          ...post,
          isLiking: false,
          omittedLikes: (post.omittedLikes > 0 ? post.omittedLikes - 1 : 0)
        }
      };
    }
    case fail(ActionTypes.UNLIKE_POST): {
      const post = state[action.request.postId];
      const errorString = 'Something went wrong while un-liking the post...';
      return {...state,
        [post.id] : {
          ...post,
          isLiking: false,
          likeError: errorString
        }
      };
    }

    case request(ActionTypes.HIDE_POST): {
      const post = state[action.payload.postId];
      return {...state,
        [post.id]: {...post,
          isHiding: true
        }};
    }
    case response(ActionTypes.HIDE_POST): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isHiding: false
        }
      };
    }
    case ActionTypes.REALTIME_POST_HIDE: {
      const post = state[action.postId];
      if (!post) {
        return state;
      }
      return {...state,
        [post.id]: {...post,
          isHiding: false
        }
      };
    }
    case fail(ActionTypes.HIDE_POST): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isHiding: false,
          hideError: 'Something went wrong while hiding the post.'
        }
      };
    }

    case request(ActionTypes.UNHIDE_POST): {
      const post = state[action.payload.postId];
      return {...state,
        [post.id]: {...post,
          isHiding: true
        }};
    }
    case response(ActionTypes.UNHIDE_POST): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isHiding: false
        }
      };
    }
    case ActionTypes.REALTIME_POST_UNHIDE: {
      const post = state[action.postId];
      if (!post) {
        return state;
      }
      return {...state,
        [post.id]: {...post,
          isHiding: false
        }
      };
    }
    case fail(ActionTypes.UNHIDE_POST): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isHiding: false,
          hideError: 'Something went wrong while un-hiding the post.'
        }
      };
    }

    case ActionTypes.TOGGLE_MODERATING_COMMENTS: {
      const post = state[action.postId];
      return {...state,
        [post.id]: {...post,
          isModeratingComments: !post.isModeratingComments
        }
      };
    }

    case request(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.payload.postId];
      return {...state,
        [post.id]: {...post,
          isDisablingComments: true
        }
      };
    }
    case response(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isDisablingComments: false,
          commentsDisabled: true
        }
      };
    }
    case fail(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isDisablingComments: false,
          disableCommentsError: 'Something went wrong while disabling comments.'
        }
      };
    }

    case request(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.payload.postId];
      return {...state,
        [post.id]: {...post,
          isDisablingComments: true
        }};
    }
    case response(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isDisablingComments: false,
          commentsDisabled: false
        }
      };
    }
    case fail(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isDisablingComments: false,
          disableCommentsError: 'Something went wrong while enabling comments.'
        }
      };
    }

    case response(ActionTypes.CREATE_POST): {
      const post = action.payload.posts;
      const id = post.id;

      const omittedComments = post.omittedComments;
      const omittedLikes = post.omittedLikes;
      const isEditing = false;
      const editingText = post.body;

      return { ...state, [id]: { omittedComments, omittedLikes, id, isEditing, editingText, ...NO_ERROR } };
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {};
    }
  }

  return state;
}
