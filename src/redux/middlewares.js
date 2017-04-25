import { browserHistory } from 'react-router';

import * as ActionCreators from './action-creators';
import * as ActionTypes from './action-types';
import { request, response, fail, requiresAuth, isFeedRequest, isFeedResponse } from './action-helpers';
import { getPost } from '../services/api';
import { setToken, getPersistedUser, persistUser } from '../services/auth';
import { init } from '../services/realtime';
import { userParser } from '../utils';

//middleware for api requests
export const apiMiddleware = store => next => async (action) => {
  //ignore normal actions
  if (!action.apiRequest) {
    return next(action);
  }

  //dispatch request begin action
  //clean apiRequest to not get caught by this middleware
  store.dispatch({ ...action, type: request(action.type), apiRequest: null });
  try {
    const apiResponse = await action.apiRequest(action.payload);
    const obj = await apiResponse.json();
    if (apiResponse.status === 200) {
      return store.dispatch({ payload: obj, type: response(action.type), request: action.payload });
    } else {
      return store.dispatch({ payload: obj, type: fail(action.type), request: action.payload, response: apiResponse });
    }
  } catch (e) {
    return store.dispatch(ActionCreators.serverError(e));
  }
};

export const authMiddleware = store => next => action => {

  //stop action propagation if it should be authed and user is not authed
  if (requiresAuth(action) && !store.getState().authenticated) {
    return;
  }

  if (action.type === ActionTypes.UNAUTHENTICATED) {
    setToken();
    persistUser();
    next(action);
    const pathname = (store.getState().routing.locationBeforeTransitions || {}).pathname;
    if (!pathname || pathname.indexOf('signin') !== -1 || pathname.indexOf('signup') !== -1) {
      return;
    }
    return browserHistory.push('/signin');
  }

  if (action.type === response(ActionTypes.SIGN_IN) ||
     action.type === response(ActionTypes.SIGN_UP) ) {
    setToken(action.payload.authToken);
    next(action);
    store.dispatch(ActionCreators.whoAmI());

    // Do not redirect to Home page if signed in at Bookmarklet
    const pathname = (store.getState().routing.locationBeforeTransitions || {}).pathname;
    if (pathname === '/bookmarklet') {
      return;
    }

    return browserHistory.push('/');
  }

  if (action.type === response(ActionTypes.WHO_AM_I) ||
     action.type === response(ActionTypes.UPDATE_USER) ) {
    persistUser(userParser(action.payload.users));
    return next(action);
  }

  return next(action);
};

export const highlightedCommentsMiddleware = store => next => action => {

  // When we got raw HIGHLIGHT_COMMENTS with payload like {postId, baseCommentId, username, arrows},
  // we replace it with payload like [commentId, commentId, commentId, ...]
  if (action.type === ActionTypes.START_HIGHLIGHTING_COMMENTS && action.payload.postId) {
    const state = store.getState();

    if (!state.user.frontendPreferences.comments.highlightComments) {
      return;
    }

    const { postId, baseCommentId, username, arrows } = action.payload;
    const post = state.posts[postId];

    const baseCommentIndex = post.comments.indexOf(baseCommentId);
    const targetedCommentIndex = (baseCommentIndex + post.omittedComments) - arrows;
    const targetedCommentId = post.comments[targetedCommentIndex < baseCommentIndex ? targetedCommentIndex : -1];

    const isCommentHighlighted = (commentId, authorUsername) => (authorUsername === username || commentId === targetedCommentId);

    const highlightedCommentIds = post.comments.filter(commentId => {
      const comment = state.comments[commentId];
      const authorUsername = comment.createdBy && state.users[comment.createdBy].username;
      return isCommentHighlighted(commentId, authorUsername);
    });

    return store.dispatch({ type: ActionTypes.START_HIGHLIGHTING_COMMENTS, payload: highlightedCommentIds });
  }

  // When we got raw STOP_HIGHLIGHTING_COMMENTS with empty payload,
  // we replace it with payload like [commentId, commentId, commentId, ...]
  if (action.type === ActionTypes.STOP_HIGHLIGHTING_COMMENTS && !action.payload) {
    const state = store.getState();

    if (!state.user.frontendPreferences.comments.highlightComments) {
      return;
    }

    const highlightedCommentIds = state.highlightedComments;
    return store.dispatch({ type: ActionTypes.STOP_HIGHLIGHTING_COMMENTS, payload: highlightedCommentIds });
  }

  return next(action);
};

export const likesLogicMiddleware = store => next => action => {
  switch (action.type) {
    case ActionTypes.SHOW_MORE_LIKES: {
      const postId = action.payload.postId;
      const post = store.getState().posts[postId];
      const isSync = (post.omittedLikes === 0);
      if (isSync) {
        return store.dispatch(ActionCreators.showMoreLikesSync(postId));
      } else {
        return store.dispatch(ActionCreators.showMoreLikesAsync(postId));
      }
    }
  }

  return next(action);
};

export const userPhotoLogicMiddleware = store => next => action => {
  if (action.type === response(ActionTypes.UPDATE_USER_PICTURE)) {
    // Update data after userpic is updated
    store.dispatch(ActionCreators.whoAmI());
  }

  return next(action);
};

export const groupPictureLogicMiddleware = store => next => action => {
  if (action.type === response(ActionTypes.UPDATE_GROUP_PICTURE)) {
    // Update data after group picture is updated
    store.dispatch(ActionCreators.getUserInfo(action.request.groupName));
  }

  return next(action);
};

export const redirectionMiddleware = store => next => action => {
  //go to home if single post has been removed
  if (action.type === response(ActionTypes.DELETE_POST) && store.getState().singlePostId) {
    return browserHistory.push('/');
  }

  if (action.type === response(ActionTypes.DEMOTE_GROUP_ADMIN) &&
      store.getState().user.id === action.request.user.id) {
    browserHistory.push(`/${action.request.groupName}/subscribers`);
  }

  return next(action);
};

export const directsMiddleware = store => next => action => {
  if (action.type === response(ActionTypes.HOME)) {
    store.dispatch(ActionCreators.getUnreadDirects());
  }

  if (action.type === response(ActionTypes.DIRECT)) {
    store.dispatch(ActionCreators.markDirectsAsRead());
  }

  if (action.type === response(ActionTypes.MARK_DIRECTS_AS_READ)) {
    persistUser({ ...getPersistedUser(), unreadDirectsNumber: 0 });
  }

  return next(action);
};

const isPostEligibleForBump = (post, action, state) => {
  // FreeFeed server (API) bumps posts in timelines for every new comment...

  if (action.type === ActionTypes.REALTIME_COMMENT_NEW) {
    return true;
  }

  // ...however, for new likes it's a little more picky:
  //
  // "For the time being, like does not bump post if it is already present in timeline"
  // See https://github.com/FreeFeed/freefeed-server/blob/bec135c9bd0cbac891048b50e5a603b6e64e4ab1/app/models/post.js#L329
  //
  // On the client side, the app tries to reproduce this behaviour, but it's hard
  // to know for sure if the post was already somewhere in current user's ("my")
  // timeline before this particular like, so the app tries to guess.
  // - Is the post authored by me?
  // - Has the post been commented by my subscriptions?
  // - Has the post been liked (earlier) by my subscriptions?
  // If one of these is true, then it's likely that the post is in my timeline
  // already, and the app shouldn't bump it for this particular like.

  // 1. Is the post authored by me?
  if (post.posts.createdBy === state.user.id) {
    return false;
  }

  const areFriendsInList = list => list.filter(item => state.user.subscriptions.indexOf(item) > -1).length > 0;

  // 2. Has the post been commented by my subscriptions?
  const commentAuthorIds = (post.comments || []).map(comment => comment.createdBy); // This check is lame if there are omitted comments :(
  if (areFriendsInList(commentAuthorIds)) {
    return false;
  }

  // 3. Has the post been liked (earlier) by my subscriptions?
  const currentLike = action.users[0].id;
  const likesExceptCurrent = post.posts.likes.filter(like => like !== currentLike);
  if (areFriendsInList(likesExceptCurrent)) {
    return false;
  }

  // OK then, let's bump it
  return true;
};

const maybeGetRespectivePost = async (store, postId, action) => {
  const state = store.getState();

  // If the post is in the store and it's visible, just pass on the original action (comment:new or like:new)
  if (state.posts[postId] && state.feedViewState.visibleEntries.indexOf(postId) > -1) {
    return store.dispatch(action);
  }

  // Otherwise, for the first page of home feed, try to retrieve the respective post
  const isHomeFeed = state.routing.locationBeforeTransitions.pathname === '/';
  const isFirstPage = !state.routing.locationBeforeTransitions.query.offset;
  if (isHomeFeed && isFirstPage) {
    const postResponse = await getPost({ postId });
    const data = await postResponse.json();
    if (postResponse.status === 200 && isPostEligibleForBump(data, action, state)) {
      return store.dispatch({ ...data, type: ActionTypes.REALTIME_POST_NEW, post: data.posts });
    }
  }

  return false;
};

const bindHandlers = store => ({
  'user:update': data => store.dispatch({ ...data, type: ActionTypes.REALTIME_USER_UPDATE }),
  'post:new': data => {
    const state = store.getState();

    const isFirstPage = !state.routing.locationBeforeTransitions.query.offset;

    if (isFirstPage) {

      const isHomeFeed = state.routing.locationBeforeTransitions.pathname === '/';
      const useRealtimePreference = state.user.frontendPreferences.realtimeActive;

      if (!isHomeFeed || (useRealtimePreference && isHomeFeed)) {
        return store.dispatch({ ...data, type: ActionTypes.REALTIME_POST_NEW, post: data.posts });
      }
    }
    return false;
  },
  'post:update': data => store.dispatch({ ...data, type: ActionTypes.REALTIME_POST_UPDATE, post: data.posts }),
  'post:destroy': data => store.dispatch({ type: ActionTypes.REALTIME_POST_DESTROY, postId: data.meta.postId }),
  'post:hide': data => store.dispatch({ type: ActionTypes.REALTIME_POST_HIDE, postId: data.meta.postId }),
  'post:unhide': data => store.dispatch({ type: ActionTypes.REALTIME_POST_UNHIDE, postId: data.meta.postId }),
  'comment:new': data => maybeGetRespectivePost(store, data.comments.postId, { type: ActionTypes.REALTIME_COMMENT_NEW, comment: data.comments, users: data.users }),
  'comment:update': data => store.dispatch({ ...data, type: ActionTypes.REALTIME_COMMENT_UPDATE, comment: data.comments }),
  'comment:destroy': data => store.dispatch({ type: ActionTypes.REALTIME_COMMENT_DESTROY, commentId: data.commentId, postId: data.postId }),
  'like:new': data => maybeGetRespectivePost(store, data.meta.postId, { type: ActionTypes.REALTIME_LIKE_NEW, postId: data.meta.postId, users: [data.users] }),
  'like:remove': data => store.dispatch({ type: ActionTypes.REALTIME_LIKE_REMOVE, postId: data.meta.postId, userId: data.meta.userId }),
});

export const realtimeMiddleware = store => {
  const handlers = bindHandlers(store);
  const state = store.getState();
  let realtimeConnection;
  return next => action => {

    if (action.type === ActionTypes.UNAUTHENTICATED) {
      if (realtimeConnection) {
        realtimeConnection.disconnect();
        realtimeConnection = undefined;
      }
    }

    if (isFeedRequest(action) ||
      action.type === request(ActionTypes.GET_SINGLE_POST)) {
      if (realtimeConnection) {
        realtimeConnection.unsubscribe();
      }
    }

    if (isFeedResponse(action) && action.payload.timelines) {
      if (!realtimeConnection) {
        realtimeConnection = init(handlers);
      }
      realtimeConnection.subscribe({
        user: [state.user.id],
        timeline: [action.payload.timelines.id]
      });
    }

    if (action.type === response(ActionTypes.GET_SINGLE_POST)) {
      if (!realtimeConnection) {
        realtimeConnection = init(handlers);
      }
      realtimeConnection.subscribe({
        user: [state.user.id],
        post: [action.payload.posts.id]
      });
    }

    return next(action);
  };
};
