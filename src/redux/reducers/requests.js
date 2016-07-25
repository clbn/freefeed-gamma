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

export function groupRequests(state = [], action) {
  switch (action.type) {
    case response(ActionTypes.MANAGED_GROUPS): {
      const requests = [];
      action.payload.forEach((g) => {
        g.requests.forEach((u) => {
          requests.push({...u, groupId: g.id, groupName: g.username});
        });
      });
      return requests.map(userParser);
    }
    case response(ActionTypes.ACCEPT_GROUP_REQUEST):
    case response(ActionTypes.REJECT_GROUP_REQUEST): {
      const userName = action.request.userName;
      const groupName = action.request.groupName;
      return state.filter((r) => (r.username !== userName || r.groupName !== groupName));
    }
    case response(ActionTypes.DEMOTE_GROUP_ADMIN): {
      if (action.request.isItMe) {
        const groupName = action.request.groupName;
        return state.filter((r) => r.groupName !== groupName);
      }
    }
  }

  return state;
}

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
    case response(ActionTypes.SEND_SUBSCRIPTION_REQUEST): {
      // There's currently no user info in the response, so we can't add the object here.
      // The user is likely in the state.users though, so when we finally change/simplify
      // this architecture to only use users from state.users and have just links to it
      // everywhere else in the Redux tree, we can fix this. TODO
      return state;
    }
    case response(ActionTypes.REVOKE_USER_REQUEST): {
      const userName = action.request.username;
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
