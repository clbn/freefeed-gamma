import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const { response } = ActionHelpers;
const indexById = list => _.keyBy(list || [], 'id');
const mergeByIds = (state, array) => ({ ...state, ...indexById(array) });

export default function subscriptions(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, action.payload.subscriptions);
  }
  switch (action.type) {
    case response(ActionTypes.GET_SINGLE_POST):
    case response(ActionTypes.CREATE_POST): {
      return mergeByIds(state, action.payload.subscriptions);
    }
    case ActionTypes.REALTIME_POST_NEW: {
      return mergeByIds(state, action.subscriptions);
    }
  }
  return state;
}
