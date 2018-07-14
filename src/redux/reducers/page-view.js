import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';
import { getSummaryPeriod } from '../../utils';

const { request } = ActionHelpers;

const getPageByOffset = (offset) => (offset ? Math.floor(offset / 30 + 1) : 1);

export default function pageView(state = {}, action) {
  switch (action.type) {
    case request(ActionTypes.HOME): {
      return {
        header: 'Home',
        number: getPageByOffset(action.payload.offset)
      };
    }
    case request(ActionTypes.DISCUSSIONS): {
      return {
        header: 'My discussions',
        number: getPageByOffset(action.payload.offset)
      };
    }
    case request(ActionTypes.DIRECT): {
      return {
        header: 'Direct messages',
        number: getPageByOffset(action.payload.offset)
      };
    }
    case request(ActionTypes.GET_SUMMARY):
    case request(ActionTypes.GET_USER_SUMMARY): {
      const period = getSummaryPeriod(action.payload.days);
      return {
        header: `Best of ${period}`
      };
    }
    case request(ActionTypes.GET_SEARCH_RESULTS): {
      const query = (action.payload.query ? ': ' + action.payload.query : '');
      return {
        header: 'Search' + query,
        number: getPageByOffset(action.payload.offset)
      };
    }
    case request(ActionTypes.GET_USER_FEED): {
      return {
        header: 'Posts',
        number: getPageByOffset(action.payload.offset)
      };
    }
    case request(ActionTypes.GET_USER_SUBSCRIBERS): {
      return {
        header: 'Subscribers',
        number: 1
      };
    }
    case request(ActionTypes.GET_USER_SUBSCRIPTIONS): {
      return {
        header: 'Subscriptions',
        number: 1
      };
    }
    case request(ActionTypes.GET_USER_COMMENTS): {
      return {
        header: 'Comments',
        number: getPageByOffset(action.payload.offset)
      };
    }
    case request(ActionTypes.GET_USER_LIKES): {
      return {
        header: 'Likes',
        number: getPageByOffset(action.payload.offset)
      };
    }
    case request(ActionTypes.GET_SINGLE_POST): {
      return {};
    }
  }
  return state;
}
