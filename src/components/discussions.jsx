import React from 'react';
import { connect } from 'react-redux';

import { getVisibleEntriesWithHidden } from '../redux/selectors';
import { getCurrentRouteName } from '../utils';

import PostCreateForm from './elements/post-create-form';
import Feed from './elements/feed';
import PaginatedView from './elements/paginated-view';

const Discussions = (props) => {
  const postCreateForm = <PostCreateForm defaultRecipient={props.defaultRecipient} peopleFirst={props.peopleFirst}/>;

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
  const boxHeader = state.boxHeader;

  const currentRoute = getCurrentRouteName(ownProps);
  const defaultRecipient = (currentRoute === 'discussions' ? state.user.username : null);
  const peopleFirst = (currentRoute !== 'discussions');

  return { isLoading, authenticated, visibleEntries, boxHeader, defaultRecipient, peopleFirst };
}

export default connect(mapStateToProps)(Discussions);
