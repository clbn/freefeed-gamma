import React from 'react';
import {connect} from 'react-redux';

import {joinPostData, postActions} from './select-utils';
import DummyPost from './dummy-post';
import Post from './post';

const SinglePostHandler = (props) => {
  let post = props.post;

  let postBody = <div></div>;

  if (props.isLoading && !post) {
    postBody = <DummyPost isSinglePost={true}/>;
  }

  if (props.errorString) {
    postBody = <h2>{props.errorString}</h2>;
  }

  if (post) {
    postBody = (
      <Post {...post}
        key={post.id}
        isSinglePost={true}
        user={props.user}
        showMoreComments={props.showMoreComments}
        showMoreLikes={props.showMoreLikes}
        toggleEditingPost={props.toggleEditingPost}
        cancelEditingPost={props.cancelEditingPost}
        saveEditingPost={props.saveEditingPost}
        deletePost={props.deletePost}
        addAttachmentResponse={props.addAttachmentResponse}
        removeAttachment={props.removeAttachment}
        toggleCommenting={props.toggleCommenting}
        addComment={props.addComment}
        likePost={props.likePost}
        unlikePost={props.unlikePost}
        toggleModeratingComments={props.toggleModeratingComments}
        disableComments={props.disableComments}
        enableComments={props.enableComments}
        commentEdit={props.commentEdit} />
    );
  }

  return (
    <div className='box'>
      <div className='box-body'>
       {postBody}
      </div>
      <div className='box-footer'>
      </div>
    </div>
  );
};

function selectState(state) {
  const isLoading = state.routeLoadingState;
  const boxHeader = state.boxHeader;
  const user = state.user;

  const post = joinPostData(state)(state.singlePostId);
  const viewState = state.postViews[state.singlePostId];
  const errorString = viewState && viewState.errorMessage || null;

  return { isLoading, post, user, boxHeader, errorString };
}

function selectActions(dispatch) {
  return { ...postActions(dispatch) };
}

export default connect(selectState, selectActions)(SinglePostHandler);
