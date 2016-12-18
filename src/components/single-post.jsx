import React from 'react';
import { connect } from 'react-redux';

import DummyPost from './elements/dummy-post';
import Post from './elements/post';

const SinglePost = (props) => {
  let postBody = <div></div>;

  if (props.isLoading && !props.isPostInStore) {
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

  if (props.isPostInStore) {
    postBody = (
      <Post id={props.postId} isSinglePost={true} />
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

function mapStateToProps(state) {
  const isLoading = state.routeLoadingState;

  const postId = state.singlePostId;
  const isPostInStore = !!state.posts[postId];
  const viewState = state.postViews[state.singlePostId];
  const errorStatus = viewState && viewState.errorStatus || null;
  const errorMessage = viewState && viewState.errorMessage || null;

  return { isLoading, postId, isPostInStore, errorStatus, errorMessage };
}

export default connect(mapStateToProps)(SinglePost);
