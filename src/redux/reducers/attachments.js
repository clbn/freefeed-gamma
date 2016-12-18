import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const { response } = ActionHelpers;
const indexById = list => _.keyBy(list || [], 'id');
const mergeByIds = (state, array) => ({ ...state, ...indexById(array) });

export default function attachments(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, action.payload.attachments);
  }
  switch (action.type) {
    case response(ActionTypes.GET_SINGLE_POST): {
      return mergeByIds(state, action.payload.attachments);
    }
    case ActionTypes.REALTIME_POST_NEW:
    case ActionTypes.REALTIME_POST_UPDATE: {
      return mergeByIds(state, action.attachments);
    }
    case ActionTypes.ADD_ATTACHMENT_RESPONSE: {
      return { ...state,
        [action.payload.attachments.id]: action.payload.attachments
      };
    }
  }
  return state;
}
