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
    (state, props) => state.posts[props.postId].likes || emptyArray,
    (state) => state.users
  ],
  (userIds, stateUsers) => {
    return _getMemoizedUsers(userIds, stateUsers);
  }
);

const makeGetPostLikes = () => createSelector(
  [
    (state, props) => state.posts[props.postId].likes || emptyArray,
    (state, props) => state.posts[props.postId].omittedLikes || 0,
    (state, props) => state.postViews[props.postId].isLoadingLikes || false,
    (state) => state.user.id,
    getUsers
  ],
  (userIds, omittedLikes, isLoadingLikes, myId, unsortedUsers) => {
    const users = [...unsortedUsers];
    users.sort((a, b) => {
      if (a.id == myId) { return -1; }
      if (b.id == myId) { return 1; }
    });

    const didILikePost = (userIds.indexOf(myId) > -1);

    return {
      users,
      omittedLikes,
      isLoadingLikes,
      didILikePost
    };
  }
);

export default makeGetPostLikes;
