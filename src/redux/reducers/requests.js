import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';
import { userParser } from '../../utils';

const { request, response, fail } = ActionHelpers;

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
    case response(ActionTypes.WHO_AM_I): {
      const requests = [];
      action.payload.managedGroups.forEach((g) => {
        g.requests.forEach((u) => {
          requests.push({ ...u, groupId: g.id, groupName: g.username });
        });
      });
      return requests.map(userParser);
    }

    case request(ActionTypes.ACCEPT_GROUP_REQUEST):
    case request(ActionTypes.REJECT_GROUP_REQUEST): {
      const userName = action.payload.userName;
      const groupName = action.payload.groupName;
      return state.map((r) => (r.username === userName && r.groupName === groupName ? { ...r, status: 'loading' } : r));
    }
    case response(ActionTypes.ACCEPT_GROUP_REQUEST):
    case response(ActionTypes.REJECT_GROUP_REQUEST): {
      const userName = action.request.userName;
      const groupName = action.request.groupName;
      return state.filter((r) => (r.username !== userName || r.groupName !== groupName));
    }
    case fail(ActionTypes.ACCEPT_GROUP_REQUEST):
    case fail(ActionTypes.REJECT_GROUP_REQUEST): {
      const userName = action.request.userName;
      const groupName = action.request.groupName;
      return state.map((r) => (r.username === userName && r.groupName === groupName ? { ...r, status: 'fail' } : r));
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
