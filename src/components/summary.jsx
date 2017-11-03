import React from 'react';
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
