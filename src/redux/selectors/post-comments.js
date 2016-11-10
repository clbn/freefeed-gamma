import {createSelector} from 'reselect';

const emptyArray = [];

const makeGetPostComments = () => createSelector(
  [
    (state, props) => state.posts[props.postId],
    (state, props) => state.postViews[props.postId],
    (state) => state.user.id
  ],
  (post, postView, myId) => {
    const postCombined = {
      comments: emptyArray,
      ...post,
      ...postView,
      isEditable: (post.createdBy === myId)
    };

    return {
      post: postCombined
    };
  }
);

export default makeGetPostComments;
