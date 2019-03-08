import {
  // Private (content depends on current user)
  home,
  discussions,
  direct,
  getSummary,

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
  'summary': next => [
    getSummary(days(next))
  ],

  'search': next => [
    getSearchResults(q(next), offset(next))
  ],

  'getUserInfo': next => [
    getUserInfo(username(next))
  ],
  'userFeed': next => [
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
    getUserSubscribers(username(next))
  ],
  'userSubscriptions': next => [
    getUserSubscriptions(username(next))
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
