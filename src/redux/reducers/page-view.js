import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';
import { getSummaryPeriod } from '../../utils';

const { request, response } = ActionHelpers;

const getPageByOffset = (offset) => (offset ? Math.floor(offset / 30 + 1) : 1);

const initialState = {
  title: 'FreeFeed'
};

export default function pageView(state = initialState, action) {
  switch (action.type) {
    case request(ActionTypes.HOME): {
      return {
        title: 'FreeFeed',
        header: 'Home',
        number: getPageByOffset(action.payload.offset)
      };
    }
    case request(ActionTypes.DISCUSSIONS): {
      return {
        title: 'My discussions - FreeFeed',
        header: 'My discussions',
        number: getPageByOffset(action.payload.offset)
      };
    }
    case request(ActionTypes.DIRECT): {
      return {
        title: 'Direct messages - FreeFeed',
        header: 'Direct messages',
        number: getPageByOffset(action.payload.offset)
      };
    }
    case request(ActionTypes.GET_SUMMARY): {
      const period = getSummaryPeriod(action.payload.days);
      return {
        title: `Best of ${period} - FreeFeed`,
        header: `Best of ${period}`
      };
    }

    case request(ActionTypes.GET_SEARCH_RESULTS): {
      const querySnippet = (action.payload.query ? action.payload.query.substr(0, 60) + ' - ' : '');
      const queryFull = (action.payload.query ? ': ' + action.payload.query : '');
      return {
        title: querySnippet + 'Search - FreeFeed',
        header: 'Search' + queryFull,
        number: getPageByOffset(action.payload.offset)
      };
    }

    case request(ActionTypes.GET_USER_FEED): {
      const username = action.payload.username;
      return {
        title: `${username} - FreeFeed`,
        header: 'Posts',
        number: getPageByOffset(action.payload.offset)
      };
    }
    case response(ActionTypes.GET_USER_FEED): {
      const user = (action.payload.users || []).filter(user => user.username === action.request.username)[0];
      const author = user.screenName + (user.username !== user.screenName ? ' (' + user.username + ')' : '');
      return { ...state,
        title: `${author} - FreeFeed`
      };
    }

    case request(ActionTypes.GET_USER_SUMMARY): {
      const period = getSummaryPeriod(action.payload.days);
      const username = action.payload.username;
      return {
        title: `Best of ${period} - ${username} - FreeFeed`,
        header: `Best of ${period}`
      };
    }
    case response(ActionTypes.GET_USER_SUMMARY): {
      const period = getSummaryPeriod(action.request.days);
      const user = (action.payload.users || []).filter(user => user.username === action.request.username)[0];
      const author = user.screenName + (user.username !== user.screenName ? ' (' + user.username + ')' : '');
      return { ...state,
        title: `Best of ${period} - ${author} - FreeFeed`
      };
    }

    case request(ActionTypes.GET_USER_SUBSCRIBERS): {
      const username = action.payload.username;
      return {
        title: `Subscribers - ${username} - FreeFeed`,
        header: 'Subscribers'
      };
    }
    case request(ActionTypes.GET_USER_SUBSCRIPTIONS): {
      const username = action.payload.username;
      return {
        title: `Subscriptions - ${username} - FreeFeed`,
        header: 'Subscriptions'
      };
    }
    case request(ActionTypes.GET_USER_COMMENTS): {
      const username = action.payload.username;
      return {
        title: `Comments - ${username} - FreeFeed`,
        header: 'Comments',
        number: getPageByOffset(action.payload.offset)
      };
    }
    case request(ActionTypes.GET_USER_LIKES): {
      const username = action.payload.username;
      return {
        title: `Likes - ${username} - FreeFeed`,
        header: 'Likes',
        number: getPageByOffset(action.payload.offset)
      };
    }

    case request(ActionTypes.GET_SINGLE_POST): {
      return state;
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      const text = (action.payload.posts.body || '').substr(0, 60);
      const user = (action.payload.users || [])[0];
      const author = user.screenName + (user.username !== user.screenName ? ' (' + user.username + ')' : '');
      return { ...state,
        title: `${text} - ${author} - FreeFeed`
      };
    }

    case ActionTypes.STATIC_PAGE: {
      return {
        title: `${action.payload.title} - FreeFeed`
      };
    }
  }
  return state;
}
