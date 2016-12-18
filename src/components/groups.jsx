import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import _ from 'lodash';

import { pluralForm } from '../utils';
import { acceptGroupRequest, rejectGroupRequest } from '../redux/action-creators';
import { tileUserListFactory, WITH_REQUEST_HANDLES, PLAIN } from './elements/tile-user-list';

const TileListWithAcceptAndReject = tileUserListFactory({ type: WITH_REQUEST_HANDLES, displayQuantity: true });
const TileList = tileUserListFactory({ type: PLAIN, displayQuantity: true });

const renderRequestsByGroup = (groupRequests, accept, reject) => {
  let groups = groupRequests.map((r) => ({ id: r.groupId, username: r.groupName }));
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

const Groups = (props) => {
  const groupRequests = renderRequestsByGroup(props.groupRequests, props.acceptGroupRequest, props.rejectGroupRequest);

  return (
    <div className="box">
      <div className="box-header-timeline">
        Groups
      </div>
      <div className="box-body">
        <div className="row">
          <div className="col-md-8">
            All the groups you are subscribed to
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

function mapStateToProps(state) {
  const groupRequests = state.groupRequests;

  const me = state.user;

  const groups = state.user.subscriptions
    .map((id) => state.users[id] || {})
    .filter((u) => u.type === 'group');

  const managedGroupsList = groups.filter((g) => g.administrators.indexOf(me.id) > -1);
  const otherGroupsList = groups.filter((g) => g.administrators.indexOf(me.id) === -1);

  const managedGroups = {
    header: 'Groups I admin',
    sorting: [
      { key: 'updatedAt', label: 'date they updated (most recent first)', isReverse: true },
      { key: 'username', label: 'username' },
      { key: 'screenName', label: 'display name' }
    ],
    users: managedGroupsList
  };

  const otherGroups = {
    header: "Groups I'm in",
    sorting: [
      { key: 'updatedAt', label: 'date they updated (most recent first)', isReverse: true },
      { key: 'username', label: 'username' },
      { key: 'screenName', label: 'display name' }
    ],
    users: otherGroupsList
  };

  return { groupRequests, managedGroups, otherGroups };
}

function mapDispatchToProps(dispatch) {
  return {
    acceptGroupRequest: (...args) => dispatch(acceptGroupRequest(...args)),
    rejectGroupRequest: (...args) => dispatch(rejectGroupRequest(...args))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Groups);
