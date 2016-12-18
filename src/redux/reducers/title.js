import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const { response, fail } = ActionHelpers;

export default function title(state = '', action) {
  switch (action.type) {
    case response(ActionTypes.HOME): {
      return 'FreeFeed';
    }
    case response(ActionTypes.DIRECT): {
      return 'Direct messages - FreeFeed';
    }
    case response(ActionTypes.DISCUSSIONS): {
      return 'My discussions - FreeFeed';
    }
    case response(ActionTypes.GET_SEARCH_RESULTS): {
      if (action.request.query) {
        const query = action.request.query.substr(0, 60);
        return `${query} - Search - FreeFeed`;
      }
      return 'Search - FreeFeed';
    }
    case response(ActionTypes.GET_USER_FEED): {
      const user = (action.payload.users || []).filter(user => user.username === action.request.username)[0];
      const author = user.screenName + (user.username !== user.screenName ? ' (' + user.username + ')' : '');
      return `${author} - FreeFeed`;
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      const text = (action.payload.posts.body || '').substr(0, 60);
      const user = (action.payload.users || [])[0];
      const author = user.screenName + (user.username !== user.screenName ? ' (' + user.username + ')' : '');
      return `${text} - ${author} - FreeFeed`;
    }

    case fail(ActionTypes.HOME):
    case fail(ActionTypes.DIRECT):
    case fail(ActionTypes.DISCUSSIONS):
    case fail(ActionTypes.GET_USER_FEED):
    case fail(ActionTypes.GET_SINGLE_POST): {
      return 'Error - FreeFeed';
    }

    case ActionTypes.STATIC_PAGE: {
      return `${action.payload.title} - FreeFeed`;
    }
  }
  return state;
}
