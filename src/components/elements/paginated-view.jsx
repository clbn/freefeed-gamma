import React from 'react';
import { connect } from 'react-redux';
import { bindRouteActions } from '../../redux/route-actions';
import PaginationLinks from './pagination-links';

const PaginatedView = props => (
  <div className="box-body">
    {props.showPaginationHeader ? (
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
