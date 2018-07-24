import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { getRecentGroups } from '../../redux/selectors';
import { getRelativeDate } from '../../utils';
import Userpic from './userpic';

const renderRecentGroup = recentGroup => {
  const updatedAgo = getRelativeDate(+recentGroup.updatedAt);
  return (
    <li key={recentGroup.id}>
      <Link to={`/${recentGroup.username}`}>
        <div className="userpic">
          <Userpic id={recentGroup.id} size={33}/>
        </div>

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
  return {
    recentGroups: getRecentGroups(state)
  };
};

export default connect(mapStateToProps)(RecentGroups);
