import {createSelector} from 'reselect';

const emptyArray = [];

const makeGetPostComments = () => createSelector(
  [
    (state, props) => state.posts[props.postId],
    (state, props) => state.postViews[props.postId],
    (state, props) => state.posts[props.postId].comments || emptyArray,
    (state) => state.comments,
    (state) => state.commentViews,
    (state) => state.users,
    (state) => state.user.id
  ],
  (post, postView, commentIds, stateComments, stateCommentViews, stateUsers, myId) => {
    const postCombined = {
      ...post,
      ...postView,
      isEditable: (post.createdBy === myId)
    };

    const comments = commentIds.map(commentId => {
      const comment = stateComments[commentId];
      const commentView = stateCommentViews[commentId];
      const placeholderUser = {id: comment.createdBy};
      const author = stateUsers[comment.createdBy] || placeholderUser;
      if (author === placeholderUser) {
        console.log('We\'ve got comment with unknown author with id', placeholderUser.id);
      }
      const isEditable = (comment.createdBy === myId);
      const isDeletable = post.createdBy === myId;
      const highlighted = false;

      return {...comment, ...commentView, user: author, isEditable, isDeletable, highlighted};
    });

    return {
      post: postCombined,
      comments
    };
  }
);

export default makeGetPostComments;
