import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';
import { userParser } from '../../utils';

const { response } = ActionHelpers;
const indexById = list => _.keyBy(list || [], 'id');
const mergeByIds = (state, array) => ({ ...state, ...indexById(array) });

export default function subscribers(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, (action.payload.subscribers || []).map(userParser));
  }
  switch (action.type) {
    case response(ActionTypes.GET_SINGLE_POST):
    case response(ActionTypes.CREATE_POST): {
      return mergeByIds(state, (action.payload.subscribers || []).map(userParser));
    }
    case ActionTypes.REALTIME_POST_NEW:
    case ActionTypes.REALTIME_COMMENT_NEW: {
      return mergeByIds(state, (action.subscribers || []).map(userParser));
    }
  }
  return state;
}
