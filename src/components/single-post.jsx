import React from 'react';
import {connect} from 'react-redux';

import {joinPostData, postActions} from '../redux/select-utils';
import DummyPost from './elements/dummy-post';
import Post from './elements/post';

const SinglePost = (props) => {
  let post = props.post;

  let postBody = <div></div>;

  if (props.isLoading && !post) {
    postBody = <DummyPost isSinglePost={true}/>;
  }

  if (props.errorStatus) {
    postBody = (
      <div>
        <h2>{props.errorStatus}</h2>
        <p><i>{props.errorMessage}</i></p>
      </div>
    );
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
    <div className="box">
      <div className="box-body">
       {postBody}
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
  const errorStatus = viewState && viewState.errorStatus || null;
  const errorMessage = viewState && viewState.errorMessage || null;

  return { isLoading, post, user, boxHeader, errorStatus, errorMessage };
}

function selectActions(dispatch) {
  return { ...postActions(dispatch) };
}

export default connect(selectState, selectActions)(SinglePost);
