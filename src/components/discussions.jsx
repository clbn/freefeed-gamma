import React from 'react';
import { connect } from 'react-redux';

import { getVisibleEntriesWithHidden } from '../redux/selectors';
import { getCurrentRouteName } from '../utils';

import PostCreateForm from './elements/post-create-form';
import Feed from './elements/feed';
import PaginatedView from './elements/paginated-view';

const Discussions = (props) => {
  const postCreateForm = <PostCreateForm defaultRecipients={props.defaultRecipients} peopleFirst={props.peopleFirst}/>;

  return (
    <div className="box">
      <div className="box-header-timeline">
        {props.pageView.header}

        {props.pageView.number > 1 ? (
          <div className="pull-right">
            <span className="subheader">Page {props.pageView.number}</span>
          </div>
        ) : false}
      </div>

      <PaginatedView firstPageHead={postCreateForm} {...props}>
        <Feed {...props}/>
      </PaginatedView>
    </div>
  );
};

function mapStateToProps(state, ownProps) {
  const isLoading = state.routeLoadingState;
  const authenticated = state.authenticated;
  const visibleEntries = getVisibleEntriesWithHidden(state);
  const pageView = state.pageView;

  const currentRoute = getCurrentRouteName(ownProps);
  const recipientFromUrl = state.routing.locationBeforeTransitions.query.to;
  const defaultRecipients = (currentRoute === 'discussions' ? [state.me.username] : (recipientFromUrl ? [recipientFromUrl] : []));
  const peopleFirst = (currentRoute !== 'discussions');

  return { isLoading, authenticated, visibleEntries, pageView, defaultRecipients, peopleFirst };
}

export default connect(mapStateToProps)(Discussions);
