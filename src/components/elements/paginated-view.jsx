import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { bindRouteActions } from '../../redux/route-actions';
import PaginationLinks from './pagination-links';

const PaginatedView = props => (
  <div className="box-body">
    {props.showSummaryHeader ? (
      <h4 className="user-subheader">
        {props.boxHeader.title}

        <div className="user-subheader-sidelinks">
          {'View best of: '}
          {+props.params.days === 1 ? <b>day</b> : <Link to={`/${props.viewUser.username}/summary/1`}>day</Link>}
          {' - '}
          {+props.params.days === 7 ? <b>week</b> : <Link to={`/${props.viewUser.username}/summary/7`}>week</Link>}
          {' - '}
          {+props.params.days === 30 ? <b>month</b> : <Link to={`/${props.viewUser.username}/summary/30`}>month</Link>}
        </div>
      </h4>
    ) : props.showPaginationHeader ? (
      <h4 className="user-subheader">
        {props.boxHeader.title}

        {props.boxHeader.page > 1 ? (
          <div className="user-subheader-page-number">Page {props.boxHeader.page}</div>
        ) : false}
      </h4>
    ) : false}

    {props.offset > 0 ? props.children ? <PaginationLinks {...props}/> : false : props.firstPageHead}

    {props.children}

    <PaginationLinks {...props}/>
  </div>
);

const mapStateToProps = (state) => {
  const offset = +state.routing.locationBeforeTransitions.query.offset || 0;
  const isLastPage = state.feedViewState.isLastPage;
  return { offset, isLastPage };
};

const mapDispatchToProps = dispatch => ({
  routingActions: bindRouteActions(dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(PaginatedView);
