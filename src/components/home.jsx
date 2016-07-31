import React from 'react';
import {connect} from 'react-redux';
import {createPost, resetPostCreateForm, toggleHiddenPosts} from '../redux/action-creators';
import {joinPostData, joinCreatePostData, postActions} from './select-utils';
import {getQuery, pluralForm} from '../utils';
import {Link} from 'react-router';

import CreatePost from './create-post';
import Feed from './feed';
import PaginatedView from './paginated-view';
import RealtimeSwitch from './realtime-switch';
import Welcome from './welcome';

const Home = (props) => {
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
                {userRequestsCount > 0 ? (<Link to="/friends">{userRequestsText}</Link>) : false}
                {bothRequestsDisplayed ? (<span> and </span>) : false}
                {groupRequestsCount > 0 ? (<Link to="/groups">{groupRequestsText}</Link>) : false}
              </span>
            ):false}
          </span>
        </div>
      ) : false}

      <div className="box-header-timeline">
        {props.boxHeader.title}

        <div className="pull-right">
          {props.areOnFirstHomePage && props.authenticated ? <RealtimeSwitch/> : false}

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
    </div>);
};

function mapStateToProps(state) {
  const isLoading = state.routeLoadingState;
  const user = state.user;
  const authenticated = state.authenticated;
  const visibleEntries = state.feedViewState.visibleEntries.map(joinPostData(state));
  const hiddenEntries = state.feedViewState.hiddenEntries.map(joinPostData(state));
  const isHiddenRevealed = state.feedViewState.isHiddenRevealed;
  const createPostForm = joinCreatePostData(state);
  const boxHeader = state.boxHeader;
  const sendTo = {...state.sendTo, defaultFeed: user.username};
  const userRequestsCount = state.userRequests.length;
  const groupRequestsCount = state.groupRequests.length;

  return {
    isLoading,
    user, authenticated,
    visibleEntries, hiddenEntries, isHiddenRevealed,
    createPostForm, boxHeader, sendTo, userRequestsCount, groupRequestsCount,
    areOnFirstHomePage: !state.routing.locationBeforeTransitions.query.offset,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...postActions(dispatch),
    createPost: (...args) => dispatch(createPost(...args)),
    resetPostCreateForm: (...args) => dispatch(resetPostCreateForm(...args)),
    toggleHiddenPosts: () => dispatch(toggleHiddenPosts())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
