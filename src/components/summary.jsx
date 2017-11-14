import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { getVisibleEntriesWithHidden } from '../redux/selectors';
import Feed from './elements/feed';

class Summary extends React.Component {
  render() {
    const props = this.props;

    return (
      <div className="box">
        <div className="box-header-timeline">
          {props.boxHeader.title}

          <div className="sidelinks">
            {'View best of: '}
            {+props.params.days === 1 ? <b>day</b> : <Link to={`/summary/1`}>day</Link>}
            {' - '}
            {+props.params.days === 7 ? <b>week</b> : <Link to={`/summary/7`}>week</Link>}
            {' - '}
            {+props.params.days === 30 ? <b>month</b> : <Link to={`/summary/30`}>month</Link>}
          </div>
        </div>

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
  const boxHeader = state.boxHeader;

  return { isLoading, visibleEntries, boxHeader };
}

export default connect(mapStateToProps)(Summary);
