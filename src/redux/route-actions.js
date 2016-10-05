import {
  // Private (content depends on current user)
  home,
  discussions,
  direct,

  // Public (content depends on URL params)
  getSearchResults,
  getUserInfo,
  getUserFeed,
  getUserComments,
  getUserLikes,
  getUserSubscribers,
  getUserSubscriptions,
  getSinglePost
} from './action-creators';

const getOffset = nextRoute => +nextRoute.location.query.offset || 0; // "+" converts string to number

const getSearchQuery = nextRoute => nextRoute.location.query.q || nextRoute.location.query.qs || '';

const getUserName = nextRoute => nextRoute.params.userName;

export const routeActions = {
  'home': next => home(getOffset(next)),
  'discussions': next => discussions(getOffset(next)),
  'direct': next => direct(getOffset(next)),

  'search': next => getSearchResults(getSearchQuery(next), getOffset(next)),
  'getUserInfo': next => getUserInfo(getUserName(next)),
  'userFeed': next => getUserFeed(next.params.userName, getOffset(next)),
  'userComments': next => getUserComments(next.params.userName, getOffset(next)),
  'userLikes': next => getUserLikes(next.params.userName, getOffset(next)),
  'userSubscribers': next => getUserSubscribers(getUserName(next)),
  'userSubscriptions': next => getUserSubscriptions(getUserName(next)),
  'post': next => getSinglePost(next.params.postId)
};

export const bindRouteActions = dispatch => route => next => {
  return dispatch(routeActions[route](next));
};
