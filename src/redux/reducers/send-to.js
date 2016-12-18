import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';
import { userParser } from '../../utils';

const { response } = ActionHelpers;

const getValidRecipients = (state) => {
  const subscriptions = _.map(state.subscriptions || [], (rs) => {
    let sub = _.find(state.subscriptions || [], { 'id': rs.id });
    let user = null;
    if (sub && sub.name == 'Posts') {
      user = _.find(state.subscribers || [], { 'id': sub.user });
    }
    if (user) {
      return { id: rs.id, user: user };
    }
  }).filter(Boolean);

  const canPostToGroup = function(subUser) {
    return (
      (subUser.isRestricted === '0') ||
      ((subUser.administrators || []).indexOf(state.users.id) > -1)
    );
  };

  const canSendDirect = function(subUser) {
    return (_.findIndex(state.users.subscribers || [], { 'id': subUser.id }) > -1);
  };

  const validRecipients = _.filter(subscriptions, (sub) => {
    return (
      (sub.user.type === 'group' && canPostToGroup(sub.user)) ||
      (sub.user.type === 'user' && canSendDirect(sub.user))
    );
  });

  return validRecipients;
};

const INITIAL_SEND_TO_STATE = {
  feeds: []
};

export default function sendTo(state = INITIAL_SEND_TO_STATE, action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return {
        feeds: getValidRecipients(action.payload)
      };
    }
    case response(ActionTypes.CREATE_GROUP): {
      let groupId = action.payload.groups.id;
      let group = userParser(action.payload.groups);
      return { ...state,
        feeds: [ ...state.feeds, { id: groupId, user: group } ]
      };
    }
    case response(ActionTypes.SUBSCRIBE):
    case response(ActionTypes.UNSUBSCRIBE): {
      return { ...state,
        feeds: getValidRecipients(action.payload)
      };
    }
  }

  return state;
}
