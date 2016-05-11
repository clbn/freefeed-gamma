import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';
import {userParser} from '../../utils';

const {response} = ActionHelpers;

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
