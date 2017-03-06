import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';
const { request, response, fail } = ActionHelpers;

import { userParser } from '../../utils';

export function serverError(state = false, action) {
  switch (action.type) {
    case ActionTypes.SERVER_ERROR: {
      return true;
    }
  }
  return state;
}

export function userErrors(state = {}, action) {
  switch (action.type) {
    case fail(ActionTypes.GET_USER_INFO): {
      const username = action.request.username;
      const status = action.response.status + ' ' + action.response.statusText;
      return { ...state,
        [username]: status
      };
    }
  }
  return state;
}

export function groupSettings(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.GET_USER_INFO): {
      return { ...state, status: 'loading' };
    }
    case response(ActionTypes.GET_USER_INFO): {
      return { ...state, status: 'success' };
    }
    case fail(ActionTypes.GET_USER_INFO): {
      return { ...state, status: 'error', errorMessage: (action.payload || {}).err };
    }
  }
  return state;
}

export function routeLoadingState(state = false, action) {
  if (ActionHelpers.isFeedRequest(action)) {
    return true;
  }
  if (ActionHelpers.isFeedResponse(action) || ActionHelpers.isFeedFail(action)) {
    return false;
  }
  if (action.type == request(ActionTypes.GET_SINGLE_POST)) {
    return true;
  }
  if (action.type == response(ActionTypes.GET_SINGLE_POST) || action.type == fail(ActionTypes.GET_SINGLE_POST)) {
    return false;
  }
  switch (action.type) {
    case ActionTypes.UNAUTHENTICATED: {
      return false;
    }
  }
  return state;
}

export function singlePostId(state = null, action) {
  if (ActionHelpers.isFeedRequest(action)) {
    return null;
  }
  if (action.type == request(ActionTypes.GET_SINGLE_POST)) {
    return action.payload.postId;
  }
  return state;
}

const handleUsers = (state, action, type, errorString) => {
  if (action.type == request(type)) {
    return {
      payload: [],
      isPending: true,
      errorString: ''
    };
  }

  if (action.type == response(type)) {
    return {
      payload: (action.payload.subscribers || []).map(userParser),
      isPending: false,
      errorString: ''
    };
  }

  if (action.type == fail(type)) {
    return {
      payload: [],
      isPending: false,
      errorString: errorString
    };
  }

  return state;
};

export function usernameSubscribers(state = {}, action) {
  if (action.type == response(ActionTypes.UNSUBSCRIBE_FROM_GROUP)) {
    const userName = action.request.userName;
    return {
      ...state,
      payload: state.payload.filter((user) => user.username !== userName)
    };
  }

  return handleUsers(
    state,
    action,
    ActionTypes.GET_USER_SUBSCRIBERS,
    'error occured while fetching subscribers'
  );
}

export function usernameSubscriptions(state = {}, action) {
  return handleUsers(
    state,
    action,
    ActionTypes.GET_USER_SUBSCRIPTIONS,
    'error occured while fetching subscriptions'
  );
}

export function usernameBlockedByMe(state = {}, action) {
  return handleUsers(
    state,
    { ...action, 'payload': { 'subscribers': action.payload } },
    ActionTypes.BLOCKED_BY_ME,
    'error occured while fetching blocked users'
  );
}

export function highlightedComments(state = [], action) {
  switch (action.type) {
    case ActionTypes.START_HIGHLIGHTING_COMMENTS: {
      return action.payload;
    }
    case ActionTypes.STOP_HIGHLIGHTING_COMMENTS: {
      return [];
    }
  }
  return state;
}

import attachments from './attachments';
import authenticated from './authenticated';
import boxHeader from './box-header';
import comments from './comments';
import commentViews from './comment-views';
import createPostForm from './create-post-form';
import feedViewState from './feed-view';
import { groupCreateForm, groupSettingsForm, groupPictureForm } from './group-forms';
import posts from './posts';
import postViews from './post-views';
import { groupRequests, userRequests, sentRequests } from './requests';
import sendTo from './send-to';
import signInForm from './sign-in-form';
import signUpForm from './sign-up-form';
import subscribers from './subscribers';
import subscriptions from './subscriptions';
import title from './title';
import user from './user';
import userCardView from './user-card-view';
import { userSettingsForm, userPictureForm, frontendPreferencesForm, passwordForm } from './user-forms';
import users from './users';
import userViews from './user-views';

export {
  attachments,
  authenticated,
  boxHeader,
  comments,
  commentViews,
  createPostForm,
  feedViewState,
  groupCreateForm, groupSettingsForm, groupPictureForm,
  posts,
  postViews,
  groupRequests, userRequests, sentRequests,
  sendTo,
  signInForm,
  signUpForm,
  subscribers,
  subscriptions,
  title,
  user,
  userCardView,
  userSettingsForm, userPictureForm, frontendPreferencesForm, passwordForm,
  users,
  userViews
};
