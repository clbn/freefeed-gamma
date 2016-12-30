import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

import { getVisibleEntriesWithHidden } from '../redux/selectors';
import { preventDefault } from '../utils';
import PaginatedView from './elements/paginated-view';
import Feed from './elements/feed';

class Search extends React.Component {
  refSearchQuery = (input) => {
    this.searchQuery = input;
  };

  componentWillReceiveProps(newProps) {
    if (newProps.query !== this.props.query) {
      this.searchQuery.value = newProps.query;
    }
  }

  submitForm = () => {
    const query = this.searchQuery.value;
    browserHistory.push(`/search?q=${encodeURIComponent(query)}`);
  };

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

        <form className="search-form" onSubmit={preventDefault(this.submitForm)}>
          <div className="row">
            <div className="col-xs-9">
              <input className="form-control" type="text" name="q" ref={this.refSearchQuery} defaultValue={props.query}/>
            </div>
            <div className="col-xs-3">
              <button className="btn btn-default" type="submit">Search</button>
            </div>
          </div>
        </form>

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
  const user = state.user;
  const authenticated = state.authenticated;
  const visibleEntries = getVisibleEntriesWithHidden(state);
  const boxHeader = state.boxHeader;

  const query = state.routing.locationBeforeTransitions.query.q || state.routing.locationBeforeTransitions.query.qs || '';

  return { isLoading, user, authenticated, visibleEntries, boxHeader, query };
}

export default connect(mapStateToProps)(Search);
