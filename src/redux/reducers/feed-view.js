import _ from 'lodash';

import * as ActionTypes from '../action-types';
import * as ActionHelpers from '../action-helpers';

const { response, fail } = ActionHelpers;

const initFeed = {
  visibleEntries: [],
  hiddenEntries: [],
  isHiddenRevealed: false,
  isLastPage: false
};

const addPostToFeed = (state, postId) => {
  // Add it to visibleEntries, but check first if it's already in there,
  // since realtime event might come first.
  const itsAlreadyThere = (state.visibleEntries.indexOf(postId) > -1);
  if (itsAlreadyThere) {
    return state;
  }
  return { ...state,
    visibleEntries: [postId, ...state.visibleEntries]
  };
};

const hidePostInFeed = (state, postId) => {
  // Check if it's even in the currently visible entries, since it might be
  // a realtime event for a non-present post. So then there's no post to hide.
  const itsNotInVisible = (state.visibleEntries.indexOf(postId) === -1);
  if (itsNotInVisible) {
    return state;
  }

  // Check if it's already in hiddenEntries, since realtime event might come
  // first. So then it's done already.
  const itsAlreadyInHidden = (state.hiddenEntries.indexOf(postId) > -1);
  if (itsAlreadyInHidden) {
    return state;
  }

  // Add it to hiddenEntries, but don't remove from visibleEntries just yet
  // (for the sake of "Undo").
  return { ...state,
    hiddenEntries: [postId, ...state.hiddenEntries]
  };
};

const unhidePostInFeed = (state, postId) => {
  // Check if it's even in the currently hidden entries, since it might be
  // a realtime event for a non-present post. So then there's no post to un-hide.
  const itsNotInHidden = (state.hiddenEntries.indexOf(postId) === -1);
  if (itsNotInHidden) {
    return state;
  }

  // Remove it from hiddenEntries and add to visibleEntries
  // (but check first if it's already in there, since this might be an "Undo" happening,
  // and/or realtime event might come first).
  const itsAlreadyInVisible = (state.visibleEntries.indexOf(postId) > -1);
  return { ...state,
    visibleEntries: (itsAlreadyInVisible ? state.visibleEntries : [...state.visibleEntries, postId]),
    hiddenEntries: _.without(state.hiddenEntries, postId)
  };
};

export default function feedViewState(state = initFeed, action) {
  if (ActionHelpers.isFeedRequest(action)) {
    return initFeed;
  }
  if (ActionHelpers.isFeedResponse(action)) {
    if (action.isCached) {
      return action.payload.cachedFeedView;
    }
    let visibleEntries, hiddenEntries;
    if (action.type === response(ActionTypes.HOME)) {
      visibleEntries = (action.payload.posts || []).filter(post => !post.isHidden).map(post => post.id);
      hiddenEntries = (action.payload.posts || []).filter(post => post.isHidden).map(post => post.id);
    } else {
      visibleEntries = (action.payload.posts || []).map(post => post.id);
      hiddenEntries = [];
    }
    const isHiddenRevealed = false;
    const isLastPage = action.payload.isLastPage;
    return {
      visibleEntries,
      hiddenEntries,
      isHiddenRevealed,
      isLastPage
    };
  }
  if (ActionHelpers.isFeedFail(action)) {
    return initFeed;
  }

  switch (action.type) {
    case ActionTypes.UNAUTHENTICATED: {
      return initFeed;
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      const postId = action.request.postId;
      return { ...initFeed,
        visibleEntries: [postId]
      };
    }
    case fail(ActionTypes.GET_SINGLE_POST): {
      return initFeed;
    }
    case response(ActionTypes.CREATE_POST): {
      return addPostToFeed(state, action.payload.posts.id);
    }
    case ActionTypes.REALTIME_POST_NEW: {
      // It might be a previously hidden post, brought here by a new third-party comment
      if (action.post.isHidden) {
        return hidePostInFeed(state, action.post.id);
      }
      return addPostToFeed(state, action.post.id);
    }
    case response(ActionTypes.DELETE_POST): {
      // It might be deleting from the group (moderation)
      if (action.payload.postStillAvailable) {
        return state;
      }
      const postId = action.request.postId;
      return { ...state,
        visibleEntries: _.without(state.visibleEntries, postId),
        hiddenEntries: _.without(state.hiddenEntries, postId)
      };
    }
    case ActionTypes.REALTIME_POST_DESTROY: {
      return { ...state,
        visibleEntries: _.without(state.visibleEntries, action.postId),
        hiddenEntries: _.without(state.hiddenEntries, action.postId)
      };
    }
    case response(ActionTypes.HIDE_POST): {
      return hidePostInFeed(state, action.request.postId);
    }
    case ActionTypes.REALTIME_POST_HIDE: {
      return hidePostInFeed(state, action.postId);
    }
    case response(ActionTypes.UNHIDE_POST): {
      return unhidePostInFeed(state, action.request.postId);
    }
    case ActionTypes.REALTIME_POST_UNHIDE: {
      return unhidePostInFeed(state, action.postId);
    }
    case ActionTypes.TOGGLE_HIDDEN_POSTS: {
      return { ...state,
        isHiddenRevealed: !state.isHiddenRevealed
      };
    }
  }
  return state;
}
