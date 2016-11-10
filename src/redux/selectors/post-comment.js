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
    (state) => state.user.subscriptions,
    (state) => state.user.id
  ],
  (comment, commentView, createdBy, post, mySubscriptions, myId) => {
    if (!comment) {
      return {};
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
      amISubscribedToAuthor
    };
  }
);

export default makeGetPostComment;
