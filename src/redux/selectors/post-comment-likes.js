import { createSelector } from 'reselect';
import _ from 'lodash';

const emptyArray = [];

const _getMemoizedUsers = _.memoize(
  // The function to have its output memoized
  (userIds, stateUsers) => {
    // We use uniq() because API has a bug when banned users involved,
    // so sometimes there are duplicates in likes that cause JS errors
    // (duplicate keys in React)
    return _.uniq(userIds).map(userId => stateUsers[userId]);
  },

  // The function to resolve the cache key
  (userIds, stateUsers) => userIds // eslint-disable-line no-unused-vars

  // ^ So here we make the cache only rely on the list of user IDs. It's not
  // really safe to do, since any particular display name might be changed.
  // However, it's important to keep this cache independent from state.users,
  // because this way updating global user pool doesn't cause re-rendering of
  // cached posts. Let's test it for some time in the hope this trade-off is
  // worth it.
);

const getUsers = createSelector(
  [
    (state, props) => state.commentLikesViews[props.commentId] && state.commentLikesViews[props.commentId].userIds || emptyArray,
    (state) => state.users
  ],
  (userIds, stateUsers) => {
    return _getMemoizedUsers(userIds, stateUsers);
  }
);

const makeGetClikes = () => createSelector(
  [
    (state, props) => state.comments[props.commentId] && state.comments[props.commentId].likes || 0,
    (state, props) => state.comments[props.commentId] && state.comments[props.commentId].hasOwnLike || false,
    (state, props) => state.commentViews[props.commentId] && state.commentViews[props.commentId].isLiking || false,
    (state, props) => state.commentLikesViews[props.commentId] && state.commentLikesViews[props.commentId].status || false,
    (state, props) => state.commentLikesViews[props.commentId] && state.commentLikesViews[props.commentId].errorMessage || false,
    getUsers
  ],
  (quantity, hasOwnLike, isLiking, status, errorMessage, users) => {
    return {
      quantity,
      hasOwnLike,
      isLiking,
      status,
      errorMessage,
      users
    };
  }
);

export default makeGetClikes;
