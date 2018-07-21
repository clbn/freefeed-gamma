import { createSelector } from 'reselect';
import _ from 'lodash';

import ARCHIVE_WATERSHED_TIMESTAMP from '../../utils/archive-timestamps';

const emptyArray = [];

const _getMemoizedRecipientsRelatedThings = _.memoize(
  // The function to have its output memoized
  (postedTo, authorId, myId, feeds, users) => {
    const recipients = postedTo
      .map(feedId => {
        const userId = (feeds[feedId] || {}).user;
        const feedType = (feeds[feedId] || {}).name;
        const isDirectToSelf = (userId === authorId && feedType === 'Directs');
        return isDirectToSelf ? false : users[userId];
      })
      .filter(user => user);

    const directRecipients = postedTo
      .filter(feedId => {
        let feedType = (feeds[feedId] || {}).name;
        return (feedType === 'Directs');
      });
    const isDirect = (directRecipients.length > 0);

    const canIEdit = (authorId === myId);

    const managedGroups = _.filter(users, u => (u.type === 'group' && u.administrators.indexOf(myId) > -1));
    const recipientsIAdmin = _.intersectionWith(recipients, managedGroups, (a, b) => (a.id === b.id));
    const canIModerate = canIEdit || (recipientsIAdmin.length > 0);

    return {
      recipients,
      isDirect,
      canIEdit,
      canIModerate
    };
  },

  // The function to resolve the cache key
  (postedTo, authorId, myId, feeds, users) => postedTo // eslint-disable-line no-unused-vars

  // ^ So here we make the cache only rely on the list of feed IDs (recipients).
  // It's not really safe to do, since any particular feed subscription might
  // be changed. However, it's important to keep this cache independent from
  // state.feeds and state.users, because this way updating global user pool
  // doesn't cause re-rendering of cached posts. Let's test it for some time
  // in the hope this trade-off is worth it.
);

const getRecipientsRelatedThings = createSelector(
  [
    (state, props) => state.posts[props.id].postedTo,
    (state, props) => state.posts[props.id].createdBy,
    (state) => state.me.id,
    (state) => state.feeds,
    (state) => state.users
  ],
  (postedTo, authorId, myId, feeds, users) => {
    return _getMemoizedRecipientsRelatedThings(postedTo, authorId, myId, feeds, users);
  }
);

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

    (state, props) => state.postViews[props.id].isEditing,
    (state, props) => state.postViews[props.id].isHiding,
    (state, props) => state.postViews[props.id].isLiking,
    (state, props) => state.postViews[props.id].isModeratingComments,
    (state, props) => state.postViews[props.id].isSaving,
    (state, props) => state.postViews[props.id].errorMessage,

    (state, props) => {
      const authorId = state.posts[props.id].createdBy;
      return state.users[authorId] && state.users[authorId].username;
    },
    (state, props) => {
      const authorId = state.posts[props.id].createdBy;
      return state.users[authorId] && state.users[authorId].profilePictureLargeUrl;
    },
    (state, props) => {
      const authorId = state.posts[props.id].createdBy;
      return state.users[authorId] && state.users[authorId].profilePictureMediumUrl;
    },

    (state) => state.me.id,
    getRecipientsRelatedThings,
    getPostAttachments
  ],
  (post, isEditing, isHiding, isLiking, isModeratingComments, isSaving, errorMessage,
   authorUsername, authorLargePic, authorMediumPic, myId, recipientsRelatedThings, attachments) => {
    if (!post) {
      return {};
    }

    const { recipients, isDirect, canIEdit, canIModerate } = recipientsRelatedThings;

    const isArchive = (+post.createdAt < ARCHIVE_WATERSHED_TIMESTAMP);

    const canILike = !!myId && !canIEdit;

    const haveILiked = ((post.likes || []).indexOf(myId) > -1);

    return {
      ...post,

      isEditing,
      isHiding,
      isLiking,
      isModeratingComments,
      isSaving,
      errorMessage,

      authorUsername,
      authorLargePic,
      authorMediumPic,

      myId,

      recipients,
      isDirect,
      canIEdit,
      canIModerate,

      isArchive,
      canILike,
      haveILiked,

      attachments
    };
  }
);

export default makeGetPost;
