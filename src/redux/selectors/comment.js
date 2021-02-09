import { createSelector } from 'reselect';

const emptyArray = [];

const makeGetComment = () => createSelector(
  [
    (state, id) => state.comments[id],
    (state, id) => state.commentViews[id],
    (state, id) => {
      const comment = state.comments[id];
      if (!comment) {
        return false;
      }
      const authorId = comment.createdBy;
      return state.users[authorId] && state.users[authorId].username;
    },
    (state) => state.me.subscriptions,
    (state) => state.me.id,
    (state, id) => state.routing.locationBeforeTransitions.hash === '#comment-' + id
  ],
  (comment, commentView, authorUsername, mySubscriptions, myId, isTargeted) => {
    if (!comment) {
      // Usually, it's not an error, just a "race condition" during deleting comments
      return {
        notFound: true
      };
    }

    const canIEdit = (comment.createdBy === myId);
    const amISubscribedToAuthor = ((mySubscriptions || emptyArray).indexOf(comment.createdBy) > -1);

    return {
      ...comment,
      ...commentView,
      authorUsername,
      canIEdit,
      amISubscribedToAuthor,
      isTargeted
    };
  }
);

export default makeGetComment;
