import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import _ from 'lodash';

import {pluralForm} from '../utils';
import {acceptGroupRequest, rejectGroupRequest} from '../redux/action-creators';
import {tileUserListFactory, WITH_REQUEST_HANDLES, PLAIN} from './tile-user-list';

const TileListWithAcceptAndReject = tileUserListFactory({type: WITH_REQUEST_HANDLES, displayQuantity: true});
const TileList = tileUserListFactory({type: PLAIN, displayQuantity: true});

const renderRequestsByGroup = (groupRequests, accept, reject) => {
  let groups = groupRequests.map((r) => ({id: r.groupId, username: r.groupName}));
  groups = _.uniqBy(groups, 'id');

  return groups.map((g) => {
    const users = groupRequests.filter((r) => r.groupName === g.username);
    const header = `${pluralForm(users.length, 'Request', null, 'w')} to join @${g.username}`;

    const acceptGroupRequest = (username) => accept(g.username, username);
    const rejectGroupRequest = (username) => reject(g.username, username);

    return (
      <div key={g.id}>
        <TileListWithAcceptAndReject
          header={header}
          users={users}
          acceptRequest={acceptGroupRequest}
          rejectRequest={rejectGroupRequest}/>
      </div>
    );
  });
};

const GroupsHandler = (props) => {
  const groupRequests = renderRequestsByGroup(props.groupRequests, props.acceptGroupRequest, props.rejectGroupRequest);

  return (
    <div className="box">
      <div className="box-header-timeline">
        Groups
      </div>
      <div className="box-body">
        <div className="row">
          <div className="col-md-8">
            All the groups you are subscribed to, sorted alphabetically
          </div>
          <div className="col-md-4 text-right">
            <Link to="/groups/create">Create a group</Link>
          </div>
        </div>

        {groupRequests ? (
          <div>
            {groupRequests}
          </div>
        ) : false}

        <TileList {...props.managedGroups}/>

        <TileList {...props.otherGroups}/>
      </div>
      <div className="box-footer"></div>
    </div>
  );
};

function selectState(state) {
  const groupRequests = state.groupRequests;

  const managedGroups = {
    header: 'Groups I admin',
    users: _.sortBy(state.managedGroups, 'username')
  };

  const groups = state.user.subscriptions
    .map((id) => state.users[id] || {})
    .filter((u) => u.type === 'group');

  const otherGroupsList = _.differenceWith(
    _.toArray(groups),
    state.managedGroups,
    (a, b) => (a.id == b.id)
  );

  const otherGroups = {
    header: "Groups I'm in",
    users: _.sortBy(otherGroupsList, 'username')
  };

  return { groupRequests, managedGroups, otherGroups };
}

function selectActions(dispatch) {
  return {
    acceptGroupRequest: (...args) => dispatch(acceptGroupRequest(...args)),
    rejectGroupRequest: (...args) => dispatch(rejectGroupRequest(...args))
  };
}

export default connect(selectState, selectActions)(GroupsHandler);
