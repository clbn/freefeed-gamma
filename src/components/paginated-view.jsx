import React from 'react';
import {connect} from 'react-redux';
import {bindRouteActions} from '../redux/route-actions';
import PaginationLinks from './pagination-links';
import {getCurrentRouteName} from '../utils';

const PaginatedView = props => (
  <div className="box-body">
    {props.showPaginationHeader ? (
      <h4 className="pagination-header">
        {props.boxHeader.title}

        {props.boxHeader.page > 1 ? (
          <div className="pagination-header-page">Page {props.boxHeader.page}</div>
        ) : false}
      </h4>
    ) : false}

    {props.offset > 0 ? props.children ? <PaginationLinks {...props}/> : false : props.firstPageHead}

    {props.children}

    <PaginationLinks {...props}/>
  </div>
);

const mapStateToProps = (state, ownProps) => {
  const offset = +state.routing.locationBeforeTransitions.query.offset || 0;
  const routename = getCurrentRouteName(ownProps);
  return { offset, routename };
};

const mapDispatchToProps = dispatch => ({
  routingActions: bindRouteActions(dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(PaginatedView);
