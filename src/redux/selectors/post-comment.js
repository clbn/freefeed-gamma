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
      return state.users[authorId] || { id: authorId };
    },
    (state, props) => state.posts[props.postId],
    (state) => state.user.subscriptions,
    (state) => state.user.id,
    (state, props) => state.routing.locationBeforeTransitions.hash === '#comment-' + props.id
  ],
  (comment, commentView, createdBy, post, mySubscriptions, myId, isTargeted) => {
    if (!comment) {
      // Usually, it's not an error, just a "race condition" during deleting comments
      return {
        notFound: true
      };
    }

    const isEditable = (comment.createdBy === myId);
    const isDeletable = post.createdBy === myId;
    const amISubscribedToAuthor = ((mySubscriptions || emptyArray).indexOf(comment.createdBy) > -1);

    return {
      ...comment,
      ...commentView,
      createdBy,
      isEditable,
      isDeletable,
      amISubscribedToAuthor,
      isTargeted
    };
  }
);

export default makeGetPostComment;
