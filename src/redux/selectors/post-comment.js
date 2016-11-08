import {createSelector} from 'reselect';

const emptyArray = [];

const makeGetPostComment = () => createSelector(
  [
    (state, props) => state.comments[props.id],
    (state, props) => state.commentViews[props.id],
    (state, props) => {
      const authorId = state.comments[props.id].createdBy;
      return state.users[authorId] || {id: authorId};
    },
    (state, props) => state.posts[props.postId],
    (state, props) => props.checkIfCommentHighlighted,
    (state) => state.user.subscriptions,
    (state) => state.user.id
  ],
  (comment, commentView, createdBy, post, checkIfCommentHighlighted, mySubscriptions, myId) => {
    if (!comment) {
      return {};
    }

    const isEditable = (comment.createdBy === myId);
    const isDeletable = post.createdBy === myId;
    const isHighlighted = checkIfCommentHighlighted(comment.id, createdBy);
    const amISubscribedToAuthor = ((mySubscriptions || emptyArray).indexOf(comment.createdBy) > -1);

    return {
      ...comment,
      ...commentView,
      createdBy,
      isEditable,
      isDeletable,
      isHighlighted,
      amISubscribedToAuthor
    };
  }
);

export default makeGetPostComment;
