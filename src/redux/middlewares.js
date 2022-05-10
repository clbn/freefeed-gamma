import _ from 'lodash';
import { browserHistory } from 'react-router';
import { LOCATION_CHANGE } from 'react-router-redux';

import * as ActionCreators from './action-creators';
import * as ActionTypes from './action-types';
import { request, response, fail, requiresAuth, isFeedAction, isFeedRequest, isFeedResponse } from './action-helpers';
import { getPost } from '../services/api';
import { setToken, getPersistedUser, persistUser } from '../services/auth';
import { init } from '../services/realtime';
import { meParser } from '../utils';
import { setDraftPA, setDraftCA, setDraftPU, setDraftCU } from '../utils/drafts';

//middleware for api requests
export const apiMiddleware = store => next => async (action) => {
  const state = store.getState();
  const cachedPages = state.cachedPages;
  const currentPageKey = cachedPages.currentKey;

  // Page cache step #1
  // Read last available state of previous page and send it for saving (see step #3)
  if (action.type === LOCATION_CHANGE) {
    if (currentPageKey) {
      const pageType = cachedPages.pages[currentPageKey].pageType;
      const pageUser = cachedPages.pages[currentPageKey].pageUser;

      let pageData = null;
      if (pageType === 'feed') {
        const users = (pageUser ? _.filter(state.users, { username: pageUser }) : []);
        const posts = _.filter(state.posts, p => _.includes(state.feedViewState.visibleEntries, p.id));
        pageData = { cachedFeedView: state.feedViewState, posts, users };
      } else if (pageType === 'post') {
        const post = state.posts[ state.singlePostId ];
        const author = state.users[ post.createdBy ];
        pageData = { posts: post, users: [ author ] };
      }
      if (pageData) {
        const scrollPosition = window.pageYOffset;
        setTimeout(() => store.dispatch({ type: 'CACHE_PAGE', payload: { target: currentPageKey, data: pageData, scrollPosition } }), 0);
      }
    }
  }

  //ignore normal actions
  if (!action.apiRequest) {
    return next(action);
  }

  //dispatch request begin action
  //clean apiRequest to not get caught by this middleware
  store.dispatch({ ...action, type: request(action.type), apiRequest: null });

  // Page cache step #4
  // For cacheable requests, and if the page is cached: don't call the backend, simply dispatch response action with cached data
  if (currentPageKey) {
    if (action.type === ActionTypes.GET_SINGLE_POST || isFeedAction(action)) {
      const cachedData = cachedPages.pages[currentPageKey].data;
      const cachedPosition = cachedPages.pages[currentPageKey].scrollPosition;
      const useCached = !!cachedData;
      if (useCached) {
        console.log('Cache hit on', action.type);
        setTimeout(() => store.dispatch({ isCached: true, payload: cachedData, type: response(action.type), request: action.payload }), 50);
        setTimeout(() => scrollTo(0, cachedPosition), 300);
        return;
      }
    }
  }

  try {
    const apiResponse = await action.apiRequest(action.payload);
    const obj = await apiResponse.json();

    if (apiResponse.status === 401 && action.type !== ActionTypes.SIGN_IN) {
      return store.dispatch(ActionCreators.unauthenticated());
    }

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
      action.type === response(ActionTypes.UPDATE_USER) ||
      action.type === response(ActionTypes.UPDATE_USER_PREFERENCES) ) {
    persistUser(meParser(action.payload.users));
    return next(action);
  }

  return next(action);
};

export const highlightedCommentsMiddleware = store => next => action => {

  // When we get raw UPDATE_HIGHLIGHTED_COMMENTS with payload like { reason, postId, baseCommentId, username, arrows }
  // or null, we replace it with payload like { processed, comments: [commentId, commentId, commentId, ...] }
  if (action.type === ActionTypes.UPDATE_HIGHLIGHTED_COMMENTS && !(action.payload || {}).processed) {
    const state = store.getState();

    if (!state.me.frontendPreferences.comments.highlightComments) {
      return;
    }

    let { reason, postId, baseCommentId, username, arrows } = action.payload || {};

    let baseCommentIndex, targetedCommentIds, highlightedCommentIds;

    const post = state.posts[postId];
    const comments = post?.comments.map(cId => state.comments[cId]) ?? [];

    if (arrows && post) {
      // Index (seqNumber) of the base comment. For a new comment, take the last comment's index, plus one.
      baseCommentIndex = (baseCommentId
        ? state.comments[baseCommentId].seqNumber
        : comments[comments.length - 1].seqNumber + 1
      );

      if (!Array.isArray(arrows)) {
        arrows = [ arrows ];
      }

      // Find IDs of comments with specific indexes (seqNumbers)
      // and filter out absent seqNumbers (for arrows that point at deleted comments)
      targetedCommentIds = arrows
        .map(a => comments.find(c => c.seqNumber === baseCommentIndex - a)?.id)
        .filter(id => id);
    }

    switch (reason) {
      case 'hover-author':
        highlightedCommentIds = comments.filter(c => state.users[c.createdBy]?.username === username).map(c => c.id);
        break;

      case 'hover-arrows':
        highlightedCommentIds = targetedCommentIds;
        break;

      case 'click-arrows':
        highlightedCommentIds = [];
        if (targetedCommentIds[0]) {
          browserHistory.push(`/${state.users[post.createdBy].username}/${postId}#comment-${baseCommentId}`);
          browserHistory.push(`/${state.users[post.createdBy].username}/${postId}#comment-${targetedCommentIds[0]}`);
        }
        break;

      default:
        highlightedCommentIds = []; // clear highlighting if params/payload is empty (previously known as STOP_HIGHLIGHTING_COMMENTS)
    }

    return store.dispatch({ type: ActionTypes.UPDATE_HIGHLIGHTED_COMMENTS, payload: { processed: true, comments: highlightedCommentIds } });
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
  // Redirect to homepage if single post has been removed
  if (action.type === response(ActionTypes.DELETE_POST) && !action.payload.postStillAvailable && store.getState().singlePostId) {
    return browserHistory.push('/');
  }

  // Redirect to /groupName/subscribers after demoting myself from admin
  if (action.type === response(ActionTypes.DEMOTE_GROUP_ADMIN) &&
      store.getState().me.id === action.request.user.id) {
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

export const draftsMiddleware = () => next => action => {
  // When post or comment is successfully saved, we should discard its draft

  if (action.type === response(ActionTypes.CREATE_POST)) { setDraftPA(null); }
  if (action.type === ActionTypes.REALTIME_POST_NEW) { setDraftPA(null); }

  if (action.type === response(ActionTypes.ADD_COMMENT)) { setDraftCA(action.request.postId, null); }
  if (action.type === ActionTypes.REALTIME_COMMENT_NEW) { setDraftCA(action.comment.postId, null); }

  if (action.type === response(ActionTypes.SAVE_EDITING_POST)) { setDraftPU(action.payload.posts.id); }
  if (action.type === ActionTypes.REALTIME_POST_UPDATE) { setDraftPU(action.post.id); }

  if (action.type === response(ActionTypes.SAVE_EDITING_COMMENT)) { setDraftCU(action.payload.comments.id, null); }
  if (action.type === ActionTypes.REALTIME_COMMENT_UPDATE) { setDraftCU(action.comment.id, null); }

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
  if (post.posts.createdBy === state.me.id) {
    return false;
  }

  const areFriendsInList = list => list.filter(item => state.me.subscriptions.indexOf(item) > -1).length > 0;

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

  // If the post is in the store and on the page (visible or hidden),
  // just pass on the original action (comment:new or like:new)
  const isPostOnThePage = (state.feedViewState.visibleEntries.indexOf(postId) > -1 || state.feedViewState.hiddenEntries.indexOf(postId) > -1);
  if (state.posts[postId] && isPostOnThePage) {
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
      const useRealtimePreference = state.me.frontendPreferences.realtimeActive;

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
  'post:save': data => store.dispatch({ type: ActionTypes.REALTIME_POST_SAVE, postId: data.meta.postId }),
  'post:unsave': data => store.dispatch({ type: ActionTypes.REALTIME_POST_UNSAVE, postId: data.meta.postId }),
  'comment:new': data => maybeGetRespectivePost(store, data.comments.postId, { type: ActionTypes.REALTIME_COMMENT_NEW, comment: data.comments, users: data.users }),
  'comment:update': data => store.dispatch({ ...data, type: ActionTypes.REALTIME_COMMENT_UPDATE, comment: data.comments }),
  'comment:destroy': data => store.dispatch({ type: ActionTypes.REALTIME_COMMENT_DESTROY, commentId: data.commentId, postId: data.postId }),
  'like:new': data => maybeGetRespectivePost(store, data.meta.postId, { type: ActionTypes.REALTIME_LIKE_NEW, postId: data.meta.postId, users: [data.users] }),
  'like:remove': data => store.dispatch({ type: ActionTypes.REALTIME_LIKE_REMOVE, postId: data.meta.postId, userId: data.meta.userId }),
  'comment_like:new': data => store.dispatch({ type: ActionTypes.REALTIME_COMMENT_UPDATE, comment: data.comments }),
  'comment_like:remove': data => store.dispatch({ type: ActionTypes.REALTIME_COMMENT_UPDATE, comment: data.comments }),
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
        user: [state.me.id],
        timeline: [action.payload.timelines.id]
      });
    }

    if (action.type === response(ActionTypes.GET_SINGLE_POST)) {
      if (!realtimeConnection) {
        realtimeConnection = init(handlers);
      }
      realtimeConnection.subscribe({
        user: [state.me.id],
        post: [action.payload.posts.id]
      });
    }

    return next(action);
  };
};
