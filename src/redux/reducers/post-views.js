import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const { request, response, fail } = ActionHelpers;

export default function postViews(state = {}, action) {
  const addRecord = (id) => ({ ...state, [id]: {} });
  const updateRecord = (id, props) => ({ ...state, [id]: { ...state[id], ...props } });

  if (ActionHelpers.isFeedResponse(action)) {
    const newPosts = {};
    action.payload.posts.forEach(p => {
      newPosts[p.id] = {};
    });
    return { ...state, ...newPosts };
  }
  switch (action.type) {
    case request(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      return updateRecord(action.payload.postId, {
        isLoadingLikes: true
      });
    }
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      return updateRecord(action.payload.posts.id, {
        isLoadingLikes: false
      });
    }
    case fail(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      return updateRecord(action.request.postId, {
        isLoadingLikes: false
      });
    }
    case request(ActionTypes.SHOW_MORE_COMMENTS):
    case request(ActionTypes.GET_SINGLE_POST): {
      return updateRecord(action.payload.postId, {
        isLoadingComments: true
      });
    }
    case response(ActionTypes.SHOW_MORE_COMMENTS): {
      return updateRecord(action.payload.posts.id, {
        isLoadingComments: false
      });
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      return addRecord(action.payload.posts.id);
    }
    case ActionTypes.REALTIME_POST_NEW:
    case ActionTypes.REALTIME_POST_UPDATE: {
      const id = action.post.id;
      const postAlreadyAdded = !!state[id];
      if (postAlreadyAdded) {
        return state;
      }
      return addRecord(id);
    }
    case fail(ActionTypes.GET_SINGLE_POST): {
      return updateRecord(action.request.postId, {
        isEditing: false,
        errorStatus: action.response.status + ' ' + action.response.statusText,
        errorMessage: (action.payload || {}).err
      });
    }
    case ActionTypes.TOGGLE_EDITING_POST: {
      const id = action.payload.postId;
      return updateRecord(id, {
        isEditing: !state[id].isEditing,
        errorStatus: '',
        errorMessage: ''
      });
    }
    case ActionTypes.CANCEL_EDITING_POST: {
      return updateRecord(action.payload.postId, {
        isEditing: false,
        errorStatus: '',
        errorMessage: ''
      });
    }
    case request(ActionTypes.SAVE_EDITING_POST): {
      return updateRecord(action.payload.postId, {
        isSaving: true
      });
    }
    case response(ActionTypes.SAVE_EDITING_POST): {
      return updateRecord(action.payload.posts.id, {
        isEditing: false,
        isSaving: false,
        errorStatus: '',
        errorMessage: ''
      });
    }
    case fail(ActionTypes.SAVE_EDITING_POST): {
      return updateRecord(action.request.postId, {
        isEditing: true,
        isSaving: false,
        errorStatus: action.response.status + ' ' + action.response.statusText,
        errorMessage: (action.payload || {}).err
      });
    }
    case fail(ActionTypes.DELETE_POST): {
      return updateRecord(action.request.postId, {
        errorStatus: action.response.status + ' ' + action.response.statusText,
        errorMessage: (action.payload || {}).err
      });
    }
    case ActionTypes.TOGGLE_COMMENTING: {
      const id = action.postId;
      return updateRecord(id, {
        isCommenting: !state[id].isCommenting,
        commentError: ''
      });
    }
    case request(ActionTypes.ADD_COMMENT): {
      return updateRecord(action.payload.postId, {
        isSavingComment: true
      });
    }
    case response(ActionTypes.ADD_COMMENT): {
      return updateRecord(action.request.postId, {
        isCommenting: false,
        isSavingComment: false
      });
    }
    case fail(ActionTypes.ADD_COMMENT): {
      return updateRecord(action.request.postId, {
        isSavingComment: false,
        commentError: (action.payload || {}).err
      });
    }

    case request(ActionTypes.LIKE_POST):
    case request(ActionTypes.UNLIKE_POST): {
      return updateRecord(action.payload.postId, {
        isLiking: true
      });
    }
    case response(ActionTypes.LIKE_POST):
    case response(ActionTypes.UNLIKE_POST): {
      return updateRecord(action.request.postId, {
        isLiking: false
      });
    }
    case fail(ActionTypes.LIKE_POST):
    case fail(ActionTypes.UNLIKE_POST): {
      return updateRecord(action.request.postId, {
        isLiking: false,
        likeError: 'Something went wrong while liking the post...'
      });
    }

    case request(ActionTypes.HIDE_POST): {
      return updateRecord(action.payload.postId, {
        isHiding: true
      });
    }
    case response(ActionTypes.HIDE_POST): {
      return updateRecord(action.request.postId, {
        isHiding: false
      });
    }
    case ActionTypes.REALTIME_POST_HIDE: {
      const id = action.postId;
      if (!state[id]) {
        return state;
      }
      return updateRecord(id, {
        isHiding: false
      });
    }
    case fail(ActionTypes.HIDE_POST): {
      return updateRecord(action.request.postId, {
        isHiding: false,
        hideError: 'Something went wrong while hiding the post.'
      });
    }

    case request(ActionTypes.UNHIDE_POST): {
      return updateRecord(action.payload.postId, {
        isHiding: true
      });
    }
    case response(ActionTypes.UNHIDE_POST): {
      return updateRecord(action.request.postId, {
        isHiding: false
      });
    }
    case ActionTypes.REALTIME_POST_UNHIDE: {
      const id = action.postId;
      if (!state[id]) {
        return state;
      }
      return updateRecord(id, {
        isHiding: false
      });
    }
    case fail(ActionTypes.UNHIDE_POST): {
      return updateRecord(action.request.postId, {
        isHiding: false,
        hideError: 'Something went wrong while un-hiding the post.'
      });
    }

    case ActionTypes.TOGGLE_MODERATING_COMMENTS: {
      const id = action.postId;
      return updateRecord(id, {
        isModeratingComments: !state[id].isModeratingComments
      });
    }

    case request(ActionTypes.DISABLE_COMMENTS): {
      return updateRecord(action.payload.postId, {
        isDisablingComments: true
      });
    }
    case response(ActionTypes.DISABLE_COMMENTS): {
      return updateRecord(action.request.postId, {
        isDisablingComments: false
      });
    }
    case fail(ActionTypes.DISABLE_COMMENTS): {
      return updateRecord(action.request.postId, {
        isDisablingComments: false,
        disableCommentsError: 'Something went wrong while disabling comments.'
      });
    }

    case request(ActionTypes.ENABLE_COMMENTS): {
      return updateRecord(action.payload.postId, {
        isDisablingComments: true
      });
    }
    case response(ActionTypes.ENABLE_COMMENTS): {
      return updateRecord(action.request.postId, {
        isDisablingComments: false
      });
    }
    case fail(ActionTypes.ENABLE_COMMENTS): {
      return updateRecord(action.request.postId, {
        isDisablingComments: false,
        disableCommentsError: 'Something went wrong while enabling comments.'
      });
    }

    case response(ActionTypes.CREATE_POST): {
      return addRecord(action.payload.posts.id);
    }

    case ActionTypes.UNAUTHENTICATED: {
      return {};
    }
  }

  return state;
}
