import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { fromNowOrNow } from '../../utils';

const GROUPS_SIDEBAR_LIST_LENGTH = 4;

const renderRecentGroup = recentGroup => {
  const updatedAgo = fromNowOrNow(parseInt(recentGroup.updatedAt));
  return (
    <li key={recentGroup.id}>
      <Link to={`/${recentGroup.username}`}>
        {recentGroup.screenName}
        <div className="updated-ago">{updatedAgo}</div>
      </Link>
    </li>
  );
};

const RecentGroups = (props) => {
  const recentGroups = props.recentGroups.map(renderRecentGroup);

  return (
    <ul>
      {recentGroups}
    </ul>
  );
};

const mapStateToProps = (state) => {
  const recentGroups = (state.user.subscriptions || [])
    .map((id) => state.users[id] || {})
    .filter((u) => u.type === 'group')
    .sort((a, b) => parseInt(b.updatedAt) - parseInt(a.updatedAt))
    .slice(0, GROUPS_SIDEBAR_LIST_LENGTH);

  return {
    recentGroups
  };
};

export default connect(mapStateToProps)(RecentGroups);
