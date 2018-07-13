import { userParser } from '../../utils';
import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const { request, response, fail } = ActionHelpers;

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
  if (action.type === request(ActionTypes.GET_SINGLE_POST)) {
    return true;
  }
  if (action.type === response(ActionTypes.GET_SINGLE_POST) || action.type === fail(ActionTypes.GET_SINGLE_POST)) {
    return false;
  }
  if (action.type === request(ActionTypes.GET_USER_SUBSCRIBERS)) {
    return true;
  }
  if (action.type === response(ActionTypes.GET_USER_SUBSCRIBERS) || action.type === fail(ActionTypes.GET_USER_SUBSCRIBERS)) {
    return false;
  }
  if (action.type === request(ActionTypes.GET_USER_SUBSCRIPTIONS)) {
    return true;
  }
  if (action.type === response(ActionTypes.GET_USER_SUBSCRIPTIONS) || action.type === fail(ActionTypes.GET_USER_SUBSCRIPTIONS)) {
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
  if (action.type === request(ActionTypes.GET_SINGLE_POST)) {
    return action.payload.postId;
  }
  return state;
}

const handleUsers = (state, action, type, errorString) => {
  if (action.type === request(type)) {
    return {
      payload: [],
      isPending: true,
      errorString: ''
    };
  }

  if (action.type === response(type)) {
    return {
      payload: (action.payload.subscribers || []).map(userParser),
      isPending: false,
      errorString: ''
    };
  }

  if (action.type === fail(type)) {
    return {
      payload: [],
      isPending: false,
      errorString: errorString
    };
  }

  return state;
};

export function usernameSubscribers(state = {}, action) {
  if (action.type === response(ActionTypes.UNSUBSCRIBE_FROM_GROUP)) {
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
