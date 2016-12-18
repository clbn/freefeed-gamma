import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const { request } = ActionHelpers;

const getPageByOffset = (offset) => (offset ? Math.floor(offset / 30 + 1) : 1);

export default function boxHeader(state = "", action) {
  switch (action.type) {
    case request(ActionTypes.HOME): {
      return { title: 'Home', page: getPageByOffset(action.payload.offset) };
    }
    case request(ActionTypes.DISCUSSIONS): {
      return { title: 'My discussions', page: getPageByOffset(action.payload.offset) };
    }
    case request(ActionTypes.DIRECT): {
      return { title: 'Direct messages', page: getPageByOffset(action.payload.offset) };
    }
    case request(ActionTypes.GET_SEARCH_RESULTS): {
      const query = (action.payload.query ? ': ' + action.payload.query : '');
      return { title: 'Search' + query, page: getPageByOffset(action.payload.offset) };
    }
    case request(ActionTypes.GET_USER_FEED): {
      return { title: 'Posts', page: getPageByOffset(action.payload.offset) };
    }
    case request(ActionTypes.GET_USER_SUBSCRIBERS): {
      return { title: 'Subscribers', page: 1 };
    }
    case request(ActionTypes.GET_USER_SUBSCRIPTIONS): {
      return { title: 'Subscriptions', page: 1 };
    }
    case request(ActionTypes.GET_USER_COMMENTS): {
      return { title: 'Comments', page: getPageByOffset(action.payload.offset) };
    }
    case request(ActionTypes.GET_USER_LIKES): {
      return { title: 'Likes', page: getPageByOffset(action.payload.offset) };
    }
    case request(ActionTypes.GET_SINGLE_POST): {
      return {};
    }
  }
  return state;
}
