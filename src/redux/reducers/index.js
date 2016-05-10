import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';
const {request, response, fail} = ActionHelpers;

import _ from 'lodash';
import {userParser, postParser} from '../../utils';
import {frontendPreferences as frontendPrefsConfig} from '../../config';

export function serverError(state = false, action) {
  switch (action.type) {
    case ActionTypes.SERVER_ERROR: {
      return true;
    }
  }
  return state;
}

const NO_ERROR = {
  isError: false,
  errorString: '',
  commentError: ''
};

const indexById = list => _.keyBy(list || [], 'id');
const mergeByIds = (state, array) => ({...state, ...indexById(array)});

const COMMENT_SAVE_ERROR = 'Something went wrong while saving comment';

export function userErrors(state = {}, action) {
  switch (action.type) {
    case fail(ActionTypes.GET_USER_INFO): {
      const username = action.request.username;
      const status = action.response.status + ' ' + action.response.statusText;
      return {...state,
        [username]: status
      };
    }
  }
  return state;
}

import {getToken, getPersistedUser} from '../../services/auth';

const DEFAULT_PASSWORD_FORM_STATE = {
  isSaving:false,
  success:false,
  error:false,
  errorText: '',
};

export function passwordForm(state=DEFAULT_PASSWORD_FORM_STATE, action) {
  switch (action.type) {
    case request(ActionTypes.UPDATE_PASSWORD): {
      return {...state, isSaving: true, error: false, success: false};
    }
    case response(ActionTypes.UPDATE_PASSWORD): {
      return {...state, isSaving: false, success: true, error: false};
    }
    case fail(ActionTypes.UPDATE_PASSWORD): {
      return {...state, isSaving: false, success: false, error: true, errorText: action.payload.err};
    }
  }
  return state;
}

export function userSettingsForm(state={saved: false}, action) {
  switch (action.type) {
    case ActionTypes.USER_SETTINGS_CHANGE: {
      return {...state, ...action.payload, success: false, error: false};
    }
    case request(ActionTypes.UPDATE_USER): {
      return {...state, isSaving: true, error: false};
    }
    case response(ActionTypes.UPDATE_USER): {
      return {...state, isSaving: false, success: true, error: false};
    }
    case fail(ActionTypes.UPDATE_USER): {
      return {...state, isSaving: false, success: false, error: true};
    }
  }
  return state;
}

export function frontendPreferencesForm(state={}, action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return {...state, ...action.payload.users.frontendPreferences[frontendPrefsConfig.clientId]};
    }
    case request(ActionTypes.UPDATE_FRONTEND_PREFERENCES): {
      return {...state, status: 'loading'};
    }
    case response(ActionTypes.UPDATE_FRONTEND_PREFERENCES): {
      return {...state, status: 'success'};
    }
    case fail(ActionTypes.UPDATE_FRONTEND_PREFERENCES): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err};
    }
  }
  return state;
}

export function userPictureForm(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.UPDATE_USER_PICTURE): {
      return {...state, status: 'loading'};
    }
    case response(ActionTypes.UPDATE_USER_PICTURE): {
      return {...state, status: 'success'};
    }
    case fail(ActionTypes.UPDATE_USER_PICTURE): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err};
    }
  }
  return state;
}

export function groupSettings(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.GET_USER_INFO): {
      return {...state, status: 'loading'};
    }
    case response(ActionTypes.GET_USER_INFO): {
      return {...state, status: 'success'};
    }
    case fail(ActionTypes.GET_USER_INFO): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err};
    }
  }
  return state;
}

export function groupCreateForm(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.CREATE_GROUP): {
      return {...state, status: 'loading'};
    }
    case response(ActionTypes.CREATE_GROUP): {
      const groupUrl = '/' + action.payload.groups.username;
      return {...state, status: 'success', groupUrl };
    }
    case fail(ActionTypes.CREATE_GROUP): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err};
    }
    case ActionTypes.RESET_GROUP_CREATE_FORM: {
      return {};
    }
  }
  return state;
}

export function groupSettingsForm(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.UPDATE_GROUP): {
      return {...state, status: 'loading'};
    }
    case response(ActionTypes.UPDATE_GROUP): {
      return {...state, status: 'success'};
    }
    case fail(ActionTypes.UPDATE_GROUP): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err};
    }
    case ActionTypes.RESET_GROUP_UPDATE_FORM: {
      return {};
    }
  }
  return state;
}

export function groupPictureForm(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.UPDATE_GROUP_PICTURE): {
      return {...state, status: 'loading'};
    }
    case response(ActionTypes.UPDATE_GROUP_PICTURE): {
      return {...state, status: 'success'};
    }
    case fail(ActionTypes.UPDATE_GROUP_PICTURE): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err};
    }
    case ActionTypes.RESET_GROUP_UPDATE_FORM: {
      return {};
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

export function createPostForm(state = {}, action) {
  switch (action.type) {
    case ActionTypes.ADD_ATTACHMENT_RESPONSE: {
      // If this is an attachment for edit-post (existent post),
      // it should be handled in posts(), not here
      if (action.payload.postId) {
        return state;
      }

      return {...state,
        attachments: [...(state.attachments || []), action.payload.attachments.id]
      };
    }
    case ActionTypes.REMOVE_ATTACHMENT: {
      // If this is an attachment for edit-post (existent post),
      // it should be handled in posts(), not here
      if (action.payload.postId) {
        return state;
      }

      return {...state,
        attachments: _.without((state.attachments || []), action.payload.attachmentId)
      };
    }
  }

  return state;
}

const GROUPS_SIDEBAR_LIST_LENGTH = 4;

export function recentGroups(state = [], action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      const subscribers = (action.payload.subscribers || []);
      return subscribers.filter(i => i.type == 'group')
                        .sort((i, j) => parseInt(j.updatedAt) - parseInt(i.updatedAt))
                        .slice(0, GROUPS_SIDEBAR_LIST_LENGTH);
    }
    case response(ActionTypes.CREATE_GROUP): {
      const newGroup = action.payload.groups;
      state.unshift(newGroup);
      return [...state];
    }
    case response(ActionTypes.UPDATE_GROUP): {
      const groupId = (action.payload.groups.id || null);
      const groupIndex = _.findIndex(state, { 'id': groupId });
      if (groupIndex > -1) {
        const oldGroup = state[groupIndex];
        const newGroup = (action.payload.groups || {});
        state[groupIndex] = {...oldGroup, ...newGroup};
        return [...state];
      }
      return state;
    }
  }

  return state;
}

export function groups(state = {}, action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      const groups = (action.payload.subscribers || []).filter((u) => u.type == 'group');
      return mergeByIds(state, groups.map(userParser));
    }
    case response(ActionTypes.CREATE_GROUP): {
      let groupId = action.payload.groups.id;
      let newGroup = userParser(action.payload.groups);
      return {...state,
        [groupId]: {...newGroup}
      };
    }
    case response(ActionTypes.UPDATE_GROUP): {
      let groupId = action.payload.groups.id;
      let oldGroup = state[groupId] || {};
      let newGroup = userParser(action.payload.groups);
      return {...state,
        [groupId]: {...oldGroup, ...newGroup}
      };
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {};
    }
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
    ActionTypes.SUBSCRIBERS,
    'error occured while fetching subscribers'
  );
}

export function usernameSubscriptions(state = {}, action) {
  return handleUsers(
    state,
    action,
    ActionTypes.SUBSCRIPTIONS,
    'error occured while fetching subscriptions'
  );
}

export function usernameBlockedByMe(state = {}, action) {
  return handleUsers(
    state,
    { ...action, 'payload': {'subscribers': action.payload } },
    ActionTypes.BLOCKED_BY_ME,
    'error occured while fetching blocked users'
  );
}

const removeItemFromGroupRequests = (state, action) => {
  const userName = action.request.userName;
  const groupName = action.request.groupName;

  const group = state.find(group => group.username === groupName);

  if (group && group.requests.length !== 0) {
    let newGroup = {
      ...group,
      requests: group.requests.filter(user => user.username !== userName)
    };

    return _(state).without(group).push(newGroup).value();
  }

  return state;
};

export function managedGroups(state = [], action) {
  switch (action.type) {
    case response(ActionTypes.MANAGED_GROUPS): {
      return action.payload.map(userParser).map(group => {
        group.requests = group.requests.map(userParser);
        return {...group};
      });
    }
    case response(ActionTypes.ACCEPT_GROUP_REQUEST):
    case response(ActionTypes.REJECT_GROUP_REQUEST): {
      return removeItemFromGroupRequests(state, action);
    }
    case response(ActionTypes.DEMOTE_GROUP_ADMIN): {
      if (action.request.isItMe) {
        return state.filter(group => group.username !== action.request.groupName);
      }
    }
  }

  return state;
}

const findByIds = (collection, ids) => {
  return _.filter(collection, (item) => _.includes(ids, item.id));
};

const subscriptionRequests = (whoamiPayload) => {
  const subscriptionRequestsIds = whoamiPayload.users.subscriptionRequests || [];
  return findByIds(whoamiPayload.requests || [], subscriptionRequestsIds).map(userParser);
};

const pendingSubscriptionRequests = (whoamiPayload) => {
  const pendingSubscriptionRequestsIds = whoamiPayload.users.pendingSubscriptionRequests || [];
  return findByIds(whoamiPayload.requests || [], pendingSubscriptionRequestsIds).map(userParser);
};

export function userRequests(state = [], action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return subscriptionRequests(action.payload);
    }
    case response(ActionTypes.ACCEPT_USER_REQUEST):
    case response(ActionTypes.REJECT_USER_REQUEST): {
      const userName = action.request.userName;
      return state.filter((user) => user.username !== userName);
    }
  }

  return state;
}

export function sentRequests(state = [], action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return pendingSubscriptionRequests(action.payload);
    }
    case response(ActionTypes.REVOKE_USER_REQUEST): {
      const userName = action.request.userName;
      return state.filter((user) => user.username !== userName);
    }
  }

  return state;
}

export function groupRequestsCount(state = 0, action) {
  switch (action.type) {
    case response(ActionTypes.MANAGED_GROUPS): {
      return action.payload.reduce((acc, group) => {
        return acc + group.requests.length;
      }, 0);
    }
    case response(ActionTypes.ACCEPT_GROUP_REQUEST):
    case response(ActionTypes.REJECT_GROUP_REQUEST): {
      return Math.max(0, state - 1);
    }
  }

  return state;
}

export function userRequestsCount(state = 0, action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return subscriptionRequests(action.payload).length;
    }
    case response(ActionTypes.ACCEPT_USER_REQUEST):
    case response(ActionTypes.REJECT_USER_REQUEST): {
      return Math.max(0, state - 1);
    }
  }
  return state;
}

export function sentRequestsCount(state = 0, action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return pendingSubscriptionRequests(action.payload).length;
    }
    case response(ActionTypes.REVOKE_USER_REQUEST): {
      return Math.max(0, state - 1);
    }
  }

  return state;
}

const initialRealtimeSettings = {
  realtimeActive: false,
  status: '',
  errorMessage: '',
};

export function frontendRealtimePreferencesForm(state=initialRealtimeSettings, action) {
  switch (action.type) {
    case ActionTypes.TOGGLE_REALTIME: {
      return {...state, realtimeActive: !state.realtimeActive, status: ''};
    }
    case response(ActionTypes.WHO_AM_I): {
      const fp = action.payload.users.frontendPreferences[frontendPrefsConfig.clientId];
      return {...state, realtimeActive: (fp ? fp.realtimeActive : initialRealtimeSettings.realtimeActive)};
    }
    case request(ActionTypes.UPDATE_FRONTEND_REALTIME_PREFERENCES): {
      return {...state, status: 'loading'};
    }
    case response(ActionTypes.UPDATE_FRONTEND_REALTIME_PREFERENCES): {
      return {...state, status: 'success'};
    }
    case fail(ActionTypes.UPDATE_FRONTEND_REALTIME_PREFERENCES): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err};
    }
  }
  return state;
}

export function commentsHighlights(state={}, action) {
  switch (action.type) {
    case ActionTypes.HIGHLIGHT_COMMENT: {
      return {
        ...action
      };
    }
    case ActionTypes.CLEAR_HIGHLIGHT_COMMENT: {
      return {};
    }
  }
  return state;
}

export function sidebarViewState(state={}, action) {
  switch (action.type) {
    case ActionTypes.TOGGLE_SIDEBAR: {
      const isOpen = (action.payload.val !== null ? action.payload.val : !state.isOpen);
      return {...state,
        isOpen
      };
    }
  }
  return state;
}

import attachments from './attachments';
import authenticated from './authenticated';
import boxHeader from './box-header';
import comments from './comments';
import commentViews from './comment-views';
import createPostViewState from './create-post-view';
import feedViewState from './feed-view';
import posts from './posts';
import postViews from './post-views';
import sendTo from './send-to';
import signInForm from './sign-in-form';
import signUpForm from './sign-up-form';
import subscribers from './subscribers';
import subscriptions from './subscriptions';
import title from './title';
import user from './user';
import users from './users';

export {
  attachments,
  authenticated,
  boxHeader,
  comments,
  commentViews,
  createPostViewState,
  feedViewState,
  posts,
  postViews,
  sendTo,
  signInForm,
  signUpForm,
  subscribers,
  subscriptions,
  title,
  user,
  users
};
