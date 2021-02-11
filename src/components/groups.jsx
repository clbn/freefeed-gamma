import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import _ from 'lodash';

import { pluralForm } from '../utils';
import { acceptGroupRequest, rejectGroupRequest } from '../redux/action-creators';
import { tileUserListFactory, WITH_REQUEST_HANDLES, PLAIN } from './elements/tile-user-list';

const TileListWithAcceptAndReject = tileUserListFactory({ type: WITH_REQUEST_HANDLES, displayQuantity: true });
const TileList = tileUserListFactory({ type: PLAIN, displayQuantity: true });

const GroupRequestsSection = ({ users, accept, reject }) => {
  const groupName = users[0].groupName;
  const header = `${pluralForm(users.length, 'Request', null, 'w')} to join @${groupName}`;

  const acceptGroupRequest = useCallback(username => accept(groupName, username), [accept, groupName]);
  const rejectGroupRequest = useCallback(username => reject(groupName, username), [reject, groupName]);

  return (
    <TileListWithAcceptAndReject
      header={header}
      users={users}
      acceptRequest={acceptGroupRequest}
      rejectRequest={rejectGroupRequest}/>
  );
};
GroupRequestsSection.propTypes = {
  users: PropTypes.array.isRequired,
  accept: PropTypes.func.isRequired,
  reject: PropTypes.func.isRequired
};

const GroupRequestsList = ({ groupRequests, accept, reject }) => {
  const groupedGroupRequests = _.groupBy(groupRequests, 'groupId');
  return _.map(groupedGroupRequests, (users, groupId) => (
    <GroupRequestsSection key={groupId} users={users} accept={accept} reject={reject}/>
  ));
};
GroupRequestsList.propTypes = {
  groupRequests: PropTypes.array.isRequired,
  accept: PropTypes.func.isRequired,
  reject: PropTypes.func.isRequired
};

const Groups = ({ groupRequests, managedGroups, otherGroups, acceptGroupRequest, rejectGroupRequest }) => {
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

        <GroupRequestsList groupRequests={groupRequests} accept={acceptGroupRequest} reject={rejectGroupRequest}/>

        <TileList {...managedGroups}/>

        <TileList {...otherGroups}/>
      </div>
    </div>
  );
};
Groups.propTypes = {
  groupRequests: PropTypes.array.isRequired,
  managedGroups: PropTypes.object.isRequired,
  otherGroups: PropTypes.object.isRequired,
  acceptGroupRequest: PropTypes.func.isRequired,
  rejectGroupRequest: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  const groupRequests = state.groupRequests;

  const me = state.me;

  const groups = me.subscriptions
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

const mapDispatchToProps = {
  acceptGroupRequest,
  rejectGroupRequest
};

export default connect(mapStateToProps, mapDispatchToProps)(Groups);
