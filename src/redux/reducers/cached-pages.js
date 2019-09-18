import { LOCATION_CHANGE } from 'react-router-redux';

import { CACHE_PAGE, GET_SINGLE_POST } from '../action-types';
import { response, isFeedResponse, isUserFeedResponse } from '../action-helpers';

const initialState = {
  currentKey: null,
  keys: [],
  pages: {}
};

export default function cachedPages(state = initialState, action) {
  // Page cache step #2
  // Save key for next page (also, discard cache for pages we don't need)
  if (action.type === LOCATION_CHANGE) {
    console.info('#2 save key for next page (LOCATION_CHANGE reducer)', action.payload.key);

    let currentKey = state.currentKey;
    let keys = [ ...state.keys ];
    let pages = { ...state.pages };

    const location = action.payload;
    const nextKey = location.key;

    // 1. Discard pages we don't need anymore
    if (location.action === 'PUSH') {
      for (let i = keys.length - 1; i > keys.indexOf(currentKey); i--) {
        delete pages[ keys[i] ];
      }
      keys = keys.slice(0, keys.indexOf(currentKey) + 1);
    }

    // 2. Add new key
    if (!keys.includes(nextKey)) {
      keys.push(nextKey);
      pages[nextKey] = {};
    }

    // 3. Update current key
    currentKey = nextKey;

    return { currentKey, keys, pages };
  }

  // Page cache step #3
  // Save state of previous page, sent from middleware (feedViewState or post; also, scroll position)
  if (action.type === CACHE_PAGE) {
    console.info('#3 saving prev page into cache (CACHE_PAGE reducer)', action.payload);

    const targetKey = action.payload.target;

    if (state.pages[targetKey] === undefined) {
      return state;
    }

    return { ...state,
      pages: { ...state.pages,
        [targetKey]: { ...state.pages[targetKey],
          data: action.payload.data,
          scrollPosition: action.payload.scrollPosition
        }
      }
    };
  }

  // Page cache step #5
  // Save type for next page (if it's a post or a feed)
  let pageType = null;
  let pageUser = null;
  if (action.type === response(GET_SINGLE_POST)) {
    pageType = 'post';
  } else if (isFeedResponse(action)) {
    pageType = 'feed';
    if (isUserFeedResponse(action)) {
      pageUser = action.request.username;
    }
  }
  if (pageType) {
    const currentKey = state.currentKey;

    console.info('#5 save page type (not data) for the next page (DATA RESPONSE), currentKey:', currentKey, ', pageType:', pageType, ', pageUser:', pageUser);

    return { ...state,
      pages: { ...state.pages,
        [currentKey]: { ...state.pages[currentKey],
          pageType,
          pageUser
        }
      }
    };
  }

  return state;
}
