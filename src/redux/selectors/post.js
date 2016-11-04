import {createSelector} from 'reselect';
import _ from 'lodash';

const emptyArray = [];

const _getMemoizedPostAttachments = _.memoize(
  // The function to have its output memoized
  (postAttachmentIds, stateAttachments) => postAttachmentIds.map(attachmentId => stateAttachments[attachmentId]),

  // The function to resolve the cache key
  (postAttachmentIds, stateAttachments) => postAttachmentIds

  // ^ So here we make the cache only rely on the list of attachment IDs. It's
  // safe to do, since any particular attachment is immutable. And it's important
  // to keep this cache independent from state.attachments, because this way
  // adding an attachment to some post doesn't cause re-rendering of other cached
  // posts.
);

const getPostAttachments = createSelector(
  [
    (state, props) => (state.posts[props.id] && state.posts[props.id].attachments) || emptyArray,
    (state) => state.attachments || emptyArray
  ],
  (postAttachmentIds, stateAttachments) => {
    return _getMemoizedPostAttachments(postAttachmentIds, stateAttachments);
  }
);

const _getMemoizedPostLikes = _.memoize(
  // The function to have its output memoized
  (postLikeIds, stateUsers) => {
    // API has a bug when banned users involved, so sometimes there are
    // duplicates in likes that cause JS errors (duplicate keys in React)
    postLikeIds = _.uniq(postLikeIds);

    return _.uniq(postLikeIds).map(userId => stateUsers[userId]);
  },

  // The function to resolve the cache key
  (postLikeIds, stateUsers) => postLikeIds

  // ^ So here we make the cache only rely on the list of user IDs. It's not
  // really safe to do, since any particular user might be changed. However,
  // it's important to keep this cache independent from state.users, because
  // this way updating global user pool doesn't cause re-rendering of cached
  // posts. Let's test it for some time in the hope this trade-off is worth it.
);

const getPostLikes = createSelector(
  [
    (state, props) => (state.posts[props.id] && state.posts[props.id].likes) || emptyArray,
    (state) => state.users || emptyArray
  ],
  (postLikeIds, stateUsers) => {
    return _getMemoizedPostLikes(postLikeIds, stateUsers);
  }
);

export const makeGetPost = () => createSelector(
  [
    (state, props) => state.posts[props.id],
    (state, props) => state.postViews[props.id],
    (state, props) => {
      const authorId = state.posts[props.id].createdBy;
      return state.users[authorId] || {id: authorId};
    },
    (state) => state.subscriptions,
    (state) => state.subscribers,
    getPostAttachments,
    getPostLikes
  ],
  (post, postView, createdBy, subscriptions, subscribers, attachments, usersLikedPost) => {
    if (!post) {
      return {};
    }

    const recipients = post.postedTo
      .map((subscriptionId) => {
        const userId = (subscriptions[subscriptionId] || {}).user;
        const subscriptionType = (subscriptions[subscriptionId] || {}).name;
        const isDirectToSelf = (userId === post.createdBy && subscriptionType === 'Directs');
        return !isDirectToSelf ? userId : false;
      })
      .map(userId => subscribers[userId])
      .filter(user => user);

    const directRecipients = post.postedTo
      .filter((subscriptionId) => {
        let subscriptionType = (subscriptions[subscriptionId] || {}).name;
        return (subscriptionType === 'Directs');
      });
    const isDirect = (directRecipients.length > 0);

    return {
      ...post,
      ...postView,
      createdBy,
      recipients,
      isDirect,
      attachments,
      usersLikedPost,
      comments: emptyArray,
      omittedComments: 0
    };
  }
);
