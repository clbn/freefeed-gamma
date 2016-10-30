import React from 'react';
import {connect} from 'react-redux';

import {joinPostData} from '../redux/select-utils';
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
        user={props.user} />
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
  const user = state.user;

  const post = joinPostData(state)(state.singlePostId);
  const viewState = state.postViews[state.singlePostId];
  const errorStatus = viewState && viewState.errorStatus || null;
  const errorMessage = viewState && viewState.errorMessage || null;

  return { isLoading, post, user, errorStatus, errorMessage };
}

export default connect(mapStateToProps)(SinglePost);
