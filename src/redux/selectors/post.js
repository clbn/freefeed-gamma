import { createSelector } from 'reselect';
import _ from 'lodash';

import ARCHIVE_WATERSHED_TIMESTAMP from '../../utils/archive-timestamps';

const emptyArray = [];

const _getMemoizedPostAttachments = _.memoize(
  // The function to have its output memoized
  (postAttachmentIds, stateAttachments) => postAttachmentIds.map(attachmentId => stateAttachments[attachmentId]),

  // The function to resolve the cache key
  (postAttachmentIds, stateAttachments) => postAttachmentIds // eslint-disable-line no-unused-vars

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

const makeGetPost = () => createSelector(
  [
    (state, props) => state.posts[props.id],
    (state, props) => state.postViews[props.id],
    (state, props) => {
      const authorId = state.posts[props.id].createdBy;
      return state.users[authorId] || { id: authorId };
    },
    (state) => state.me.id,
    (state) => state.feeds,
    (state) => state.users,
    getPostAttachments
  ],
  (post, postView, createdBy, myId, feeds, users, attachments) => {
    if (!post) {
      return {};
    }

    const recipients = post.postedTo
      .map((feedId) => {
        const userId = (feeds[feedId] || {}).user;
        const feedType = (feeds[feedId] || {}).name;
        const isDirectToSelf = (userId  === post.createdBy && feedType === 'Directs');
        return !isDirectToSelf ? userId : false;
      })
      .map(userId => users[userId])
      .filter(user => user);

    const directRecipients = post.postedTo
      .filter((feedId) => {
        let feedType = (feeds[feedId] || {}).name;
        return (feedType === 'Directs');
      });
    const isDirect = (directRecipients.length > 0);

    const isArchive = (+post.createdAt < ARCHIVE_WATERSHED_TIMESTAMP);

    const canIEdit = (createdBy.id === myId);
    const canILike = !!myId && !canIEdit;
    const haveILiked = ((post.likes || []).indexOf(myId) > -1);

    const managedGroups = _.filter(users, u => (u.type === 'group' && u.administrators.indexOf(myId) > -1));
    const recipientsIAdmin = _.intersectionWith(recipients, managedGroups, (a, b) => (a.id === b.id));
    const canIModerate = canIEdit || (recipientsIAdmin.length > 0);

    return {
      ...post,
      ...postView,
      createdBy,
      recipients,
      isDirect,
      isArchive,
      attachments,
      myId,
      canIEdit,
      canILike,
      haveILiked,
      canIModerate
    };
  }
);

export default makeGetPost;
