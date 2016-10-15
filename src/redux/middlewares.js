import {browserHistory} from 'react-router';

import * as ActionCreators from './action-creators';
import * as ActionTypes from './action-types';
import {request, response, fail, requiresAuth, isFeedRequest, isFeedResponse} from './action-helpers';
import {setToken, persistUser} from '../services/auth';
import {init} from '../services/realtime';
import {userParser} from '../utils';

//middleware for api requests
export const apiMiddleware = store => next => async (action) => {
  //ignore normal actions
  if (!action.apiRequest) {
    return next(action);
  }

  //dispatch request begin action
  //clean apiRequest to not get caught by this middleware
  var t = store.dispatch({...action, type: request(action.type), apiRequest: null});
  try {
    const apiResponse = await action.apiRequest(action.payload);
    const obj = await apiResponse.json();
    if (apiResponse.status === 200) {
      return store.dispatch({payload: obj, type: response(action.type), request: action.payload});
    } else {
      return store.dispatch({payload: obj, type: fail(action.type), request: action.payload, response: apiResponse});
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

export const searchMiddleware = store => next => action => {
  switch (action.type) {
    case response(ActionTypes.GET_SEARCH_RESULTS): {
      // Let's just remove irrelevant comments from the server payload
      // (all except for the first ones and the last ones)

      // 1. Remove pointers to those comments from payload.posts
      // and set proper omittedComments for each post
      let irrelevantCommentIds = [];
      if (action.payload.posts) {
        action.payload.posts.forEach((post) => {
          if (post.comments && post.comments.length > 3) {
            post.omittedComments = post.comments.length - 2;
            for (let i = 1; i < post.comments.length - 1; i++) {
              irrelevantCommentIds.push(post.comments[i]);
            }
            post.comments = [post.comments[0], post.comments[post.comments.length - 1]];
          }
        });
      }

      // 2. Remove the actual comments from payload.comments
      if (action.payload.comments) {
        action.payload.comments = action.payload.comments.filter(c => irrelevantCommentIds.indexOf(c.id) === -1);
      }
    }
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

export const requestsMiddleware = store => next => action => {
  if (action.type === response(ActionTypes.WHO_AM_I)) {
    next(action);

    if (store.getState().user.pendingGroupRequests) {
      store.dispatch(ActionCreators.managedGroups());
    }

    return;
  }

  return next(action);
};

const bindHandlers = store => ({
  'post:new': data => {
    const state = store.getState();

    const isFirstPage = !state.routing.locationBeforeTransitions.query.offset;

    if (isFirstPage) {

      const isHomeFeed = state.routing.locationBeforeTransitions.pathname === '/';
      const useRealtimePreference = state.user.frontendPreferences.realtimeActive;

      if (!isHomeFeed || (useRealtimePreference && isHomeFeed)) {
        return store.dispatch({...data, type: ActionTypes.REALTIME_POST_NEW, post: data.posts});
      }
    }
    return false;
  },
  'post:update': data => store.dispatch({...data, type: ActionTypes.REALTIME_POST_UPDATE, post: data.posts}),
  'post:destroy': data => store.dispatch({type: ActionTypes.REALTIME_POST_DESTROY, postId: data.meta.postId}),
  'post:hide': data => store.dispatch({type: ActionTypes.REALTIME_POST_HIDE, postId: data.meta.postId}),
  'post:unhide': data => store.dispatch({type: ActionTypes.REALTIME_POST_UNHIDE, postId: data.meta.postId}),
  'comment:new': data => store.dispatch({type: ActionTypes.REALTIME_COMMENT_NEW, comment: data.comments, users: data.users}),
  'comment:update': data => store.dispatch({...data, type: ActionTypes.REALTIME_COMMENT_UPDATE, comment: data.comments}),
  'comment:destroy': data => store.dispatch({type: ActionTypes.REALTIME_COMMENT_DESTROY, commentId: data.commentId, postId: data.postId}),
  'like:new': data => store.dispatch({type: ActionTypes.REALTIME_LIKE_NEW, postId: data.meta.postId, users:[data.users]}),
  'like:remove': data => store.dispatch({type: ActionTypes.REALTIME_LIKE_REMOVE, postId: data.meta.postId, userId: data.meta.userId}),
});

export const realtimeMiddleware = store => {
  const handlers = bindHandlers(store);
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
      realtimeConnection.subscribe({timeline:[action.payload.timelines.id]});
    }

    if (action.type === response(ActionTypes.GET_SINGLE_POST)) {
      if (!realtimeConnection) {
        realtimeConnection = init(handlers);
      }
      realtimeConnection.subscribe({post:[action.payload.posts.id]});
    }

    return next(action);
  };
};
