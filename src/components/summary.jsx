import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { getVisibleEntriesWithHidden } from '../redux/selectors';
import { getSummaryPeriod } from '../utils/index';
import Feed from './elements/feed';

class Summary extends React.Component {
  render() {
    const props = this.props;

    return (
      <div className="box">
        <div className="box-header-timeline">
          {props.pageView.header}

          <div className="sidelinks">
            <span>View best of: </span>
            {+props.params.days === 1 ? <b>day</b> : <Link to={`/summary/1`}>day</Link>}
            {' - '}
            {+(props.params.days||7) === 7 ? <b>week</b> : <Link to={`/summary/7`}>week</Link>}
            {' - '}
            {+props.params.days === 30 ? <b>month</b> : <Link to={`/summary/30`}>month</Link>}
          </div>
        </div>

        <div className="box-subheader">The most popular entries among your friends in the past {getSummaryPeriod(props.params.days)}</div>

        {props.isLoading || props.visibleEntries.length ? (
          <Feed {...props}/>
        ) : (
          <div className="feed-message">
            <p>No entries here yet. You might want to subscribe for more feeds.</p>
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const isLoading = state.routeLoadingState;
  const visibleEntries = getVisibleEntriesWithHidden(state);
  const pageView = state.pageView;

  return { isLoading, visibleEntries, pageView };
}

export default connect(mapStateToProps)(Summary);
