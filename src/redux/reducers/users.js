import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';
import { userParser } from '../../utils';

const { response } = ActionHelpers;
const indexById = list => _.keyBy(list || [], 'id');
const mergeByIds = (state, array) => _.merge(state, indexById(array));

export default function users(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, (action.payload.users || []).map(userParser));
  }
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I):
    case response(ActionTypes.GET_USER_INFO): {
      let newState = state;

      // Add some users from "subscribers"
      newState = mergeByIds(newState, (action.payload.subscribers || []).map(userParser));

      // Add some users from "admins"
      newState = mergeByIds(newState, (action.payload.admins || []).map(userParser));

      // Add target user
      let userId = action.payload.users.id;
      let oldUser = state[userId] || {};
      let newUser = userParser(action.payload.users);
      return { ...newState,
        [userId]: { ...oldUser, ...newUser }
      };
    }
    case response(ActionTypes.GET_USER_SUBSCRIBERS): {
      return mergeByIds(state, (action.payload.subscribers || []).map(userParser));
    }
    case response(ActionTypes.CREATE_GROUP): {
      let userId = action.payload.groups.id;
      let newUser = userParser(action.payload.groups);
      return { ...state,
        [userId]: { ...newUser }
      };
    }
    case response(ActionTypes.UPDATE_GROUP): {
      let userId = action.payload.groups.id;
      let oldUser = state[userId] || {};
      let newUser = userParser(action.payload.groups);
      return { ...state,
        [userId]: { ...oldUser, ...newUser }
      };
    }
    case response(ActionTypes.PROMOTE_GROUP_ADMIN): {
      const group = _.find(state || [], { username: action.request.groupName });
      const newAdmins = [...group.administrators, action.request.user.id];
      return { ...state,
        [group.id]: { ...group,
          administrators: newAdmins
        }
      };
    }
    case response(ActionTypes.DEMOTE_GROUP_ADMIN): {
      const group = _.find(state || [], { username: action.request.groupName });
      const newAdmins = _.without(group.administrators, action.request.user.id);
      return { ...state,
        [group.id]: { ...group,
          administrators: newAdmins
        }
      };
    }
    case response(ActionTypes.SHOW_MORE_COMMENTS):
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC):
    case response(ActionTypes.GET_SINGLE_POST): {
      return mergeByIds(state, (action.payload.users || []).map(userParser));
    }
    case ActionTypes.REALTIME_POST_NEW:
    case ActionTypes.REALTIME_LIKE_NEW:
    case ActionTypes.REALTIME_COMMENT_NEW: {
      if (!action.users || !action.users.length) {
        return state;
      }
      const newUsers = action.users.filter(user => !state[user.id]);
      if (!newUsers.length) {
        return state;
      }
      return mergeByIds(state, newUsers.map(userParser));
    }
    case ActionTypes.UNAUTHENTICATED:
      return {};
  }
  return state;
}
