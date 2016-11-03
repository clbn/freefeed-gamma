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
    getPostAttachments
  ],
  (post, postView, createdBy, subscriptions, subscribers, attachments) => {
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
      usersLikedPost: emptyArray,
      comments: emptyArray,
      omittedComments: 0
    };
  }
);
