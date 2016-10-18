import React from 'react';
import {connect} from 'react-redux';

import {createPost, resetPostCreateForm} from '../redux/action-creators';
import {joinPostData, joinCreatePostData, postActions} from './select-utils';
import {getQuery, getCurrentRouteName} from '../utils';

import CreatePost from './create-post';
import Feed from './feed';
import PaginatedView from './paginated-view';

const Discussions = (props) => {
  const createPostComponent = (
    <CreatePost
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
    </div>
  );
};

function mapStateToProps(state, ownProps) {
  const isLoading = state.routeLoadingState;
  const user = state.user;
  const authenticated = state.authenticated;
  const visibleEntries = state.feedViewState.visibleEntries.map(joinPostData(state));
  const createPostForm = joinCreatePostData(state);
  const boxHeader = state.boxHeader;

  const currentRoute = getCurrentRouteName(ownProps);
  const defaultFeed = (currentRoute === 'discussions' ? user.username : null);
  const sendTo = {...state.sendTo, defaultFeed};

  return { isLoading, user, authenticated, visibleEntries, createPostForm, boxHeader, sendTo };
}

function mapDispatchToProps(dispatch) {
  return {
    ...postActions(dispatch),
    createPost: (...args) => dispatch(createPost(...args)),
    resetPostCreateForm: (...args) => dispatch(resetPostCreateForm(...args))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Discussions);
