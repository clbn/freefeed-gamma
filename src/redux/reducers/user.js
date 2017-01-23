import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';
import { getPersistedUser } from '../../services/auth';
import { userParser } from '../../utils';
import { frontendPreferences as frontendPrefsConfig } from '../../../config/app';

const { request, response } = ActionHelpers;

const initUser = () => ({
  frontendPreferences: frontendPrefsConfig.defaultValues,
  ...getPersistedUser()
});

export default function user(state = initUser(), action) {
  if (ActionHelpers.isUserChangeResponse(action)) {
    const subscriptions = _.uniq((action.payload.subscriptions || []).map(sub => sub.user));
    return { ...state, ...userParser(action.payload.users), subscriptions };
  }
  switch (action.type) {
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
    case request(ActionTypes.UPDATE_FRONTEND_PREFERENCES): {
      return { ...state,
        frontendPreferences: { ...state.frontendPreferences,
          realtimeActive: action.payload.prefs.realtimeActive
        }
      };
    }
  }
  return state;
}
