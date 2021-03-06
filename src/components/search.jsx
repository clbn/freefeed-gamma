import React from 'react';
import { connect } from 'react-redux';

import { getVisibleEntriesWithHidden } from '../redux/selectors';
import SearchForm from './elements/search-form';
import PaginatedView from './elements/paginated-view';
import Feed from './elements/feed';

class Search extends React.Component {
  render() {
    const props = this.props;

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

        <SearchForm position="in-results" buttonText="Search"/>

        {props.query ? (
          props.isLoading || props.visibleEntries.length ? (
            <PaginatedView {...props}>
              <Feed {...props}/>
            </PaginatedView>
          ) : (
            <div className="search-no-results">
              <h4>No results</h4>
              <p>Please make sure that all words are spelled correctly or try different keywords.</p>
            </div>
          )
        ) : (
          <div className="search-operators">
            <h4>Advanced operators</h4>
            <ul>
              <li>Use <code>"quotes"</code> to search for exact words: <code>open-source "social network"</code></li>
              <li>There's also <code>from</code> operator to get entries authored by a specific user: <code>borsch recipe from:clbn</code></li>
              <li>And you can add <code>group</code> operator to search for posts in a specific group: <code>north korea group:travel</code></li>
            </ul>
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const isLoading = state.routeLoadingState;
  const authenticated = state.authenticated;
  const visibleEntries = getVisibleEntriesWithHidden(state);
  const pageView = state.pageView;

  const query = state.routing.locationBeforeTransitions.query.q || state.routing.locationBeforeTransitions.query.qs || '';

  return { isLoading, authenticated, visibleEntries, pageView, query };
}

export default connect(mapStateToProps)(Search);
