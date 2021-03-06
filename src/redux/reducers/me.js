import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';
import { getPersistedUser } from '../../services/auth';
import { meParser } from '../../utils';
import { frontendPreferences as frontendPrefsConfig } from '../../../config/config';

const { request, response } = ActionHelpers;

const initUser = () => ({
  preferences: {},
  frontendPreferences: frontendPrefsConfig.defaultValues,
  directAccepters: [],
  ...getPersistedUser()
});

export default function me(state = initUser(), action) {
  if (ActionHelpers.isUserChangeResponse(action)) {
    const subscriptions = _.uniq((action.payload.subscriptions || []).map(sub => sub.user));
    return { ...state, ...meParser(action.payload.users), subscriptions, isPending: false };
  }
  switch (action.type) {
    case request(ActionTypes.WHO_AM_I): {
      return { ...state, isPending: true };
    }
    case response(ActionTypes.GET_USER_INFO): {
      const userId = action.payload.users.id;
      const acceptsDirects = action.payload.acceptsDirects;

      if (acceptsDirects) {
        return { ...state,
          directAccepters: _.uniq([...state.directAccepters, userId])
        };
      } else {
        return { ...state,
          directAccepters: _.without(state.directAccepters, userId)
        };
      }
    }
    case response(ActionTypes.SEND_SUBSCRIPTION_REQUEST): {
      return { ...state,
        pendingSubscriptionRequests: [...(state.pendingSubscriptionRequests || []),
          action.request.id
        ]
      };
    }
    case response(ActionTypes.REVOKE_USER_REQUEST): {
      return { ...state,
        pendingSubscriptionRequests: _.without((state.pendingSubscriptionRequests || []), action.request.id)
      };
    }
    case response(ActionTypes.BAN): {
      return { ...state, banIds: [...state.banIds, action.request.id] };
    }
    case response(ActionTypes.UNBAN): {
      return { ...state, banIds: _.without(state.banIds, action.request.id) };
    }
    case response(ActionTypes.CREATE_GROUP): {
      return { ...state, subscriptions: [...state.subscriptions, action.payload.groups.id] };
    }
    case response(ActionTypes.GET_UNREAD_DIRECTS): {
      return { ...state, unreadDirectsNumber: action.payload.unread };
    }
    case response(ActionTypes.MARK_DIRECTS_AS_READ): {
      return { ...state, unreadDirectsNumber: 0 };
    }
    case ActionTypes.REALTIME_USER_UPDATE: {
      return { ...state, ...action.user };
    }

    // Update the state of realtime switch immediately
    case request(ActionTypes.UPDATE_USER_PREFERENCES): {
      return { ...state,
        frontendPreferences: { ...state.frontendPreferences,
          realtimeActive: action.payload.prefs.realtimeActive
        }
      };
    }
  }
  return state;
}
