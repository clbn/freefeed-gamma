import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { createPost, resetPostCreateForm, addAttachmentResponse, removeAttachment, toggleHiddenPosts } from '../redux/action-creators';
import { getVisibleEntriesWithHidden, getHiddenEntriesWithHidden } from '../redux/selectors';
import { joinCreatePostData } from '../redux/select-utils';
import { pluralForm } from '../utils';

import PostCreateForm from './elements/post-create-form';
import Feed from './elements/feed';
import PaginatedView from './elements/paginated-view';
import RealtimeSwitch from './elements/realtime-switch';
import Welcome from './elements/welcome';

const Home = (props) => {
  const createPostComponent = (
    <PostCreateForm
      sendTo={props.sendTo}
      user={props.user}
      createPost={props.createPost}
      resetPostCreateForm={props.resetPostCreateForm}
      createPostForm={props.createPostForm}
      addAttachmentResponse={props.addAttachmentResponse}
      removeAttachment={props.removeAttachment}/>
  );

  const userRequestsCount = props.userRequestsCount;
  const groupRequestsCount = props.groupRequestsCount;
  const totalRequestsCount = userRequestsCount + groupRequestsCount;

  const userRequestsText = pluralForm(userRequestsCount, 'subscription request');
  const groupRequestsText = pluralForm(groupRequestsCount, 'group subscription request');
  const bothRequestsDisplayed = userRequestsCount > 0 && groupRequestsCount > 0;

  return (
    <div className="box">
      {props.authenticated && totalRequestsCount > 0 ? (
        <div className="box-message alert alert-info">
          <span className="message">
            {totalRequestsCount > 0 ? (
              <span>
                <span>You have </span>
                {userRequestsCount > 0 ? (<Link to="/people">{userRequestsText}</Link>) : false}
                {bothRequestsDisplayed ? (<span> and </span>) : false}
                {groupRequestsCount > 0 ? (<Link to="/groups">{groupRequestsText}</Link>) : false}
              </span>
            ) : false}
          </span>
        </div>
      ) : false}

      <div className="box-header-timeline">
        {props.boxHeader.title}

        <div className="pull-right">
          {!props.offset && props.authenticated ? <RealtimeSwitch/> : false}

          {props.boxHeader.page > 1 ? (
            <span className="subheader">Page {props.boxHeader.page}</span>
          ) : false}
        </div>
      </div>

      {props.authenticated ? (
        <PaginatedView firstPageHead={createPostComponent} {...props}>
          <Feed {...props} isInHomeFeed={true}/>
        </PaginatedView>
      ) : (
        <Welcome/>
      )}
    </div>
  );
};

function mapStateToProps(state) {
  const isLoading = state.routeLoadingState;

  const user = state.user;
  const authenticated = state.authenticated;

  const visibleEntries = getVisibleEntriesWithHidden(state);
  const hiddenEntries = getHiddenEntriesWithHidden(state);
  const isHiddenRevealed = state.feedViewState.isHiddenRevealed;

  const createPostForm = joinCreatePostData(state);
  const boxHeader = state.boxHeader;
  const sendTo = { ...state.sendTo, defaultFeed: user.username };
  const userRequestsCount = state.userRequests.length;
  const groupRequestsCount = state.groupRequests.length;

  const offset = state.routing.locationBeforeTransitions.query.offset;

  return {
    isLoading,
    user, authenticated,
    visibleEntries, hiddenEntries, isHiddenRevealed,
    createPostForm, boxHeader, sendTo, userRequestsCount, groupRequestsCount,
    offset
  };
}

function mapDispatchToProps(dispatch) {
  return {
    createPost: (...args) => dispatch(createPost(...args)),
    resetPostCreateForm: (...args) => dispatch(resetPostCreateForm(...args)),
    addAttachmentResponse: (...args) => dispatch(addAttachmentResponse(...args)),
    removeAttachment: (...args) => dispatch(removeAttachment(...args)),
    toggleHiddenPosts: () => dispatch(toggleHiddenPosts())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
