import {
  // Private (content depends on current user)
  home,
  discussions,
  direct,
  getSaves,
  getSummary,
  blockedByMe,

  // Public (content depends on URL params)
  getSearchResults,
  getUserInfo,
  getUserFeed,
  getUserSummary,
  getUserComments,
  getUserLikes,
  getUserSubscribers,
  getUserSubscriptions,
  getSinglePost
} from './action-creators';

const offset = next => +next.location.query.offset || 0; // "+" converts string to number
const q = next => next.location.query.q || next.location.query.qs || '';
const username = next => next.params.userName;
const days = next => next.params.days;
const postId = next => next.params.postId;

export const routeActions = {
  'home': next => [
    home(offset(next))
  ],
  'discussions': next => [
    discussions(offset(next))
  ],
  'direct': next => [
    direct(offset(next))
  ],
  'saves': next => [
    getSaves(offset(next))
  ],
  'summary': next => [
    getSummary(days(next))
  ],
  'people': () => [
    blockedByMe()
  ],

  'search': next => [
    getSearchResults(q(next), offset(next))
  ],

  'userFeed': next => [
    getUserInfo(username(next)), // Just for fetching `acceptsDirects`
    getUserFeed(username(next), offset(next))
  ],
  'userSummary': next => [
    getUserSummary(username(next), days(next))
  ],
  'userComments': next => [
    getUserComments(username(next), offset(next))
  ],
  'userLikes': next => [
    getUserLikes(username(next), offset(next))
  ],
  'userSubscribers': next => [
    getUserInfo(username(next)),
    getUserSubscribers(username(next))
  ],
  'userSubscriptions': next => [
    getUserInfo(username(next)),
    getUserSubscriptions(username(next))
  ],
  'groupSettings': next => [
    getUserInfo(username(next))
  ],

  'post': next => [
    getSinglePost(postId(next))
  ]
};

export const bindRouteActions = dispatch => route => next => {
  const actions = routeActions[route](next);

  actions.forEach(a => {
    dispatch(a);
  });
};
