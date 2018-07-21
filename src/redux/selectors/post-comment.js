import { createSelector } from 'reselect';

const emptyArray = [];

const makeGetPostComment = () => createSelector(
  [
    (state, props) => state.comments[props.id],
    (state, props) => state.commentViews[props.id],
    (state, props) => {
      const comment = state.comments[props.id];
      if (!comment) {
        return false;
      }
      const authorId = comment.createdBy;
      return state.users[authorId] && state.users[authorId].username;
    },
    (state) => state.me.subscriptions,
    (state) => state.me.id,
    (state, props) => state.routing.locationBeforeTransitions.hash === '#comment-' + props.id
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

export default makeGetPostComment;
