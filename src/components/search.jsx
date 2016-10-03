import React from 'react';
import {connect} from 'react-redux';

import {getSearchResults} from '../redux/action-creators';
import {joinPostData, postActions} from './select-utils';
import PaginatedView from './paginated-view';
import Feed from './feed';

class Search extends React.Component {
  componentWillReceiveProps(newProps) {
    if (newProps.query !== this.props.query || newProps.offset !== this.props.offset) {
      this.props.getSearchResults(newProps.query, newProps.offset);
    }
  }

  render() {
    const props = this.props;

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

        <PaginatedView {...props}>
          <Feed {...props}/>
        </PaginatedView>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const isLoading = state.routeLoadingState;
  const user = state.user;
  const authenticated = state.authenticated;
  const visibleEntries = state.feedViewState.visibleEntries.map(joinPostData(state));
  const boxHeader = state.boxHeader;

  const query = state.routing.locationBeforeTransitions.query.q;
  const offset = state.routing.locationBeforeTransitions.query.offset;

  return { isLoading, user, authenticated, visibleEntries, boxHeader, query, offset };
}

function mapDispatchToProps(dispatch) {
  return {
    getSearchResults: (...args) => dispatch(getSearchResults(...args)),
    ...postActions(dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Search);
