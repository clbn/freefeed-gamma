import React from 'react';
import {connect} from 'react-redux';
import {createPost, resetPostCreateForm} from '../redux/action-creators';
import {joinPostData, joinCreatePostData, postActions} from './select-utils';
import {getQuery, getCurrentRouteName} from '../utils';

import CreatePost from './create-post';
import Feed from './feed';
import PaginatedView from './paginated-view';

const FeedHandler = (props) => {
  const createPostComponent = (
    <CreatePost
      createPostViewState={props.createPostViewState}
      sendTo={props.sendTo}
      user={props.user}
      createPost={props.createPost}
      resetPostCreateForm={props.resetPostCreateForm}
      createPostForm={props.createPostForm}
      addAttachmentResponse={props.addAttachmentResponse}
      removeAttachment={props.removeAttachment}/>
  );

  return (
    <div className="box">
      <div className="box-header-timeline">
        {props.boxHeader.title}

        {props.boxHeader.page > 1 ? (
          <div className="pull-right">
            <span className="subheader">Page {props.boxHeader.page}</span>
          </div>
        ) : false}
      </div>

      <PaginatedView firstPageHead={createPostComponent} {...props}>
        <Feed {...props}/>
      </PaginatedView>
    </div>);
};

function selectState(state, ownProps) {
  const isLoading = state.routeLoadingState;
  const user = state.user;
  const authenticated = state.authenticated;
  const visibleEntries = state.feedViewState.visibleEntries.map(joinPostData(state));
  const createPostViewState = state.createPostViewState;
  const createPostForm = joinCreatePostData(state);
  const boxHeader = state.boxHeader;

  const defaultFeed = (getCurrentRouteName(ownProps) === 'discussions' ? user.username : null);
  const sendTo = {...state.sendTo, defaultFeed};

  return { isLoading, user, authenticated, visibleEntries, createPostViewState, createPostForm, boxHeader, sendTo };
}

function selectActions(dispatch) {
  return {
    ...postActions(dispatch),
    createPost: (feeds, postText, attachmentIds, more) => dispatch(createPost(feeds, postText, attachmentIds, more)),
    resetPostCreateForm: (...args) => dispatch(resetPostCreateForm(...args))
  };
}

export default connect(selectState, selectActions)(FeedHandler);
