import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';
import {postParser} from '../../utils';

const {response} = ActionHelpers;
const indexById = list => _.keyBy(list || [], 'id');
const mergeByIds = (state, array) => ({...state, ...indexById(array)});

const updatePostData = (state, action) => {
  const postId = action.payload.posts.id;
  return { ...state, [postId]: postParser(action.payload.posts) };
};

export default function posts(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, (action.payload.posts || []).map(postParser));
  }
  switch (action.type) {
    case response(ActionTypes.SHOW_MORE_COMMENTS): {
      const post = state[action.payload.posts.id];
      return {...state,
        [post.id]: {...post,
          omittedComments: 0,
          comments: action.payload.posts.comments
        }
      };
    }
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      const post = state[action.payload.posts.id];
      return {...state,
        [post.id]: {...post,
          omittedLikes: 0,
          likes: action.payload.posts.likes
        }
      };
    }
    case response(ActionTypes.SAVE_EDITING_POST): {
      const post = state[action.payload.posts.id];
      return {...state,
        [post.id]: {...post,
          body: action.payload.posts.body,
          updatedAt: action.payload.posts.updatedAt,
          attachments: action.payload.posts.attachments || []
        }
      };
    }
    case ActionTypes.ADD_ATTACHMENT_RESPONSE: {
      // If this is an attachment for create-post (non-existent post),
      // it should be handled in createPostForm(), not here
      if (!action.payload.postId) {
        return state;
      }

      const post = state[action.payload.postId];
      return {...state,
        [post.id]: {
          ...post,
          attachments: [...(post.attachments || []), action.payload.attachments.id]
        }
      };
    }
    case ActionTypes.REMOVE_ATTACHMENT: {
      // If this is an attachment for create-post (non-existent post),
      // it should be handled in createPostForm(), not here
      if (!action.payload.postId) {
        return state;
      }

      const post = state[action.payload.postId];
      return {...state,
        [post.id]: {
          ...post,
          attachments: _.without((post.attachments || []), action.payload.attachmentId)
        }
      };
    }
    case response(ActionTypes.DELETE_COMMENT): {
      const commentId = action.request.commentId;
      const post = _(state).find(_post => (_post.comments||[]).indexOf(commentId) !== -1);
      if (!post) {
        return state;
      }
      const comments = _.without(post.comments, commentId);
      return {...state,
        [post.id]: {...post,
          comments,
          omittedComments: (post.omittedComments > 0 ? post.omittedComments - 1 : 0)
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
      return {...state, [action.postId] : {
        ...post,
        comments: _.without(post.comments, action.commentId)
      }};
    }
    case response(ActionTypes.ADD_COMMENT): {
      const post = state[action.request.postId];
      const commentAlreadyAdded = post.comments && post.comments.indexOf(action.payload.comments.id)!==-1;
      if (commentAlreadyAdded) {
        return state;
      }
      return {...state,
        [post.id] : {
          ...post,
          comments: [...(post.comments || []), action.payload.comments.id],
          omittedComments: (post.omittedComments > 0 ? post.omittedComments + 1 : 0)
        }
      };
    }
    case response(ActionTypes.LIKE_POST): {
      const post = state[action.request.postId];
      const likeAlreadyAdded = post.likes && post.likes.indexOf(action.request.userId)!==-1;
      if (likeAlreadyAdded) {
        return state;
      }
      return {...state,
        [post.id] : {
          ...post,
          likes: [action.request.userId, ...(post.likes || [])],
          omittedLikes: (post.omittedLikes > 0 ? post.omittedLikes + 1 : 0)
        }
      };
    }
    case ActionTypes.REALTIME_LIKE_NEW: {
      const post = state[action.postId];
      if (!post || post.likes && post.likes.indexOf(action.users[0].id) !== -1) {
        return state;
      }
      return {...state,
        [post.id] : {
          ...post,
          likes: [action.users[0].id, ...(post.likes || [])],
          omittedLikes: (post.omittedLikes > 0 ? post.omittedLikes + 1 : 0)
        }
      };
    }
    case response(ActionTypes.UNLIKE_POST): {
      const post = state[action.request.postId];
      return {...state,
        [post.id] : {
          ...post,
          likes: _.without(post.likes, action.request.userId),
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
          likes: _.without(post.likes, action.userId),
          omittedLikes: (post.omittedLikes > 0 ? post.omittedLikes - 1 : 0)
        }
      };
    }
    case response(ActionTypes.HIDE_POST): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isHidden: true
        }
      };
    }
    case response(ActionTypes.UNHIDE_POST): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isHidden: false
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
          isHidden: false
        }
      };
    }
    case response(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          commentsDisabled: true
        }
      };
    }
    case response(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          commentsDisabled: false
        }
      };
    }
    case response(ActionTypes.CREATE_POST): {
      return updatePostData(state, action);
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      return updatePostData(state, action);
    }
    case ActionTypes.REALTIME_POST_NEW: {
      return { ...state, [action.post.id]: postParser(action.post) };
    }
    case ActionTypes.REALTIME_POST_UPDATE: {
      const post = state[action.post.id];
      if (!post) {
        return state;
      }
      const newPost = postParser(action.post);
      return {...state,
        [post.id]: {...post,
          body: newPost.body,
          attachments: newPost.attachments || [],
          commentsDisabled: newPost.commentsDisabled,
          updatedAt: newPost.updatedAt
        }
      };
    }
    case ActionTypes.REALTIME_COMMENT_NEW: {
      const post = state[action.comment.postId];
      if (!post) {
        return state;
      }
      const commentAlreadyAdded = post.comments && post.comments.indexOf(action.comment.id)!==-1;
      if (commentAlreadyAdded) {
        return state;
      }
      return {
        ...state,
        [post.id]: {
          ...post,
          comments: [...(post.comments || []), action.comment.id]
        }
      };
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {};
    }
  }

  return state;
}
