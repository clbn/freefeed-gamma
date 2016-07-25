import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';

import {Link} from 'react-router';
import SubsList from './subs-list';

const SubscribersHandler = (props) => {
  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader.title}
      </div>
      <div className='box-body'>
        <div className="row">
          <div className="col-md-6">
            <Link to={`/${props.username}`}>{props.username}</Link> › Subscribers
          </div>
          {props.amIGroupAdmin
          ? <div className="col-md-6 text-right">
              <Link to={`/${props.username}/manage-subscribers`}>Manage subscribers</Link>
            </div>
          : false}          
        </div>
        <SubsList {...props} title='Subscribers' />
      </div>
      <div className='box-footer'></div>
    </div>
  );
};

function selectState(state, ownProps) {
  const boxHeader = state.boxHeader;
  const username = ownProps.params.userName;
  const users = _.sortBy(state.usernameSubscribers.payload, 'username');
  const isPending = state.usernameSubscribers.isPending;
  const errorString = state.usernameSubscribers.errorString;

  const me = state.user;
  const user = (_.find(state.users, {username}) || {});
  const amIGroupAdmin = (user.type === 'group' && (user.administrators || []).indexOf(me.id) > -1);

  return { boxHeader, username, amIGroupAdmin, users, isPending, errorString };
}

export default connect(selectState)(SubscribersHandler);
