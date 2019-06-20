import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { toggleHiddenPosts } from '../redux/action-creators';
import { getVisibleEntriesWithHidden, getHiddenEntriesWithHidden } from '../redux/selectors';
import { pluralForm } from '../utils';

import PostCreateForm from './elements/post-create-form';
import Feed from './elements/feed';
import PaginatedView from './elements/paginated-view';
import RealtimeSwitch from './elements/realtime-switch';
import Welcome from './elements/welcome';

const Home = (props) => {
  const userRequestsCount = props.userRequestsCount;
  const groupRequestsCount = props.groupRequestsCount;
  const totalRequestsCount = userRequestsCount + groupRequestsCount;

  const userRequestsText = pluralForm(userRequestsCount, 'subscription request');
  const groupRequestsText = pluralForm(groupRequestsCount, 'group subscription request');
  const bothRequestsDisplayed = userRequestsCount > 0 && groupRequestsCount > 0;

  const postCreateForm = <PostCreateForm defaultRecipients={props.defaultRecipients}/>;

  return (
    <div className="box">
      {props.authenticated ? <>
        {totalRequestsCount > 0 ? (
          <div className="box-message alert alert-info">
            {'You have '}
            {userRequestsCount > 0 ? <Link to="/people">{userRequestsText}</Link> : false}
            {bothRequestsDisplayed ? ' and ' : false}
            {groupRequestsCount > 0 ? <Link to="/groups">{groupRequestsText}</Link> : false}
          </div>
        ) : false}

        <div className="box-header-timeline">
          {props.pageView.header}

          <div className="pull-right">
            {props.isFirstPage && props.authenticated ? <RealtimeSwitch/> : false}

            {props.pageView.number > 1 ? (
              <span className="subheader">Page {props.pageView.number}</span>
            ) : false}
          </div>
        </div>

        <PaginatedView firstPageHead={postCreateForm} {...props}>
          <Feed {...props} isInHomeFeed={true}/>
        </PaginatedView>
      </> : (
        <Welcome/>
      )}
    </div>
  );
};

function mapStateToProps(state) {
  const isLoading = state.routeLoadingState;

  const authenticated = state.authenticated;

  const visibleEntries = getVisibleEntriesWithHidden(state);
  const hiddenEntries = getHiddenEntriesWithHidden(state);
  const isHiddenRevealed = state.feedViewState.isHiddenRevealed;

  const pageView = state.pageView;
  const userRequestsCount = state.userRequests.length;
  const groupRequestsCount = state.groupRequests.length;

  const isFirstPage = !state.routing.locationBeforeTransitions.query.offset;

  const defaultRecipients = [state.me.username];

  return {
    isLoading,
    authenticated,
    visibleEntries, hiddenEntries, isHiddenRevealed,
    pageView, userRequestsCount, groupRequestsCount,
    isFirstPage, defaultRecipients
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleHiddenPosts: () => dispatch(toggleHiddenPosts())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
