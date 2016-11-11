import {createSelector} from 'reselect';

const emptyArray = [];

const makeGetPostComments = () => createSelector(
  [
    (state, props) => state.posts[props.postId].id,
    (state, props) => state.posts[props.postId].comments || emptyArray,
    (state, props) => state.posts[props.postId].omittedComments || 0,
    (state, props) => state.posts[props.postId].commentsDisabled,

    (state, props) => state.postViews[props.postId].isLoadingComments,
    (state, props) => state.postViews[props.postId].isModeratingComments,
    (state, props) => state.postViews[props.postId].isCommenting,
    (state, props) => state.postViews[props.postId].isSavingComment,
    (state, props) => state.postViews[props.postId].commentError,

    (state, props) => (state.posts[props.postId].createdBy === state.user.id)
  ],
  (
    id, comments, omittedComments, commentsDisabled,
    isLoadingComments, isModeratingComments, isCommenting, isSavingComment, commentError,
    isEditable
  ) => {
    const granularPostData = {
      id,
      comments,
      omittedComments,
      commentsDisabled,

      isLoadingComments,
      isModeratingComments,
      isCommenting,
      isSavingComment,
      commentError,

      isEditable
    };

    return {
      post: granularPostData
    };
  }
);

export default makeGetPostComments;
