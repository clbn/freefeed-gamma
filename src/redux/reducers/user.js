import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';
import {getPersistedUser} from '../../services/auth';
import {userParser} from '../../utils';
import {frontendPreferences as frontendPrefsConfig} from '../../config';

const {response} = ActionHelpers;

const initUser = () => ({
  frontendPreferences: frontendPrefsConfig.defaultValues,
  ...getPersistedUser()
});

export default function user(state = initUser(), action) {
  if (ActionHelpers.isUserChangeResponse(action)) {
    const subscriptions = _.uniq((action.payload.subscriptions || []).map(sub => sub.user));
    return {...state, ...userParser(action.payload.users), subscriptions};
  }
  switch (action.type) {
    case response(ActionTypes.SEND_SUBSCRIPTION_REQUEST): {
      return {...state,
        pendingSubscriptionRequests: [...(state.pendingSubscriptionRequests || []),
          action.request.id
        ]
      };
    }
    case response(ActionTypes.BAN): {
      return {...state, banIds: [...state.banIds, action.request.id]};
    }
    case response(ActionTypes.UNBAN): {
      return {...state, banIds: _.without(state.banIds, action.request.id)};
    }
    case response(ActionTypes.CREATE_GROUP): {
      return {...state, subscriptions: [...state.subscriptions, action.payload.groups.id]};
    }
  }
  return state;
}
