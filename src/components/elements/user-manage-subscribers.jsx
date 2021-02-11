import React, { useCallback } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import { unsubscribeFromGroup, promoteGroupAdmin, demoteGroupAdmin } from '../../redux/action-creators';
import { tileUserListFactory, WITH_REMOVE_AND_MAKE_ADMIN_HANDLES, WITH_REMOVE_ADMIN_RIGHTS } from './tile-user-list';
import throbber100 from 'assets/images/throbber.gif';

const AdminsList = tileUserListFactory({ type: WITH_REMOVE_ADMIN_RIGHTS });
const OtherSubsList = tileUserListFactory({ type: WITH_REMOVE_AND_MAKE_ADMIN_HANDLES });

const UserManageSubscribers = ({
  viewUser,
  myId, isLoading, groupAdmins, users, amILastGroupAdmin,
  unsubscribeFromGroup, promoteGroupAdmin, demoteGroupAdmin
}) => {
  const unsubscribe = useCallback(username => (
    unsubscribeFromGroup(viewUser.username, username)
  ), [unsubscribeFromGroup, viewUser.username]);

  const promoteToAdmin = useCallback(user => (
    promoteGroupAdmin(viewUser.username, user)
  ), [promoteGroupAdmin, viewUser.username]);

  const demoteFromAdmin = useCallback(user => {
    const isItMe = (myId === user.id);
    demoteGroupAdmin(viewUser.username, user, isItMe);
  }, [myId, demoteGroupAdmin, viewUser.username]);

  return (
    <div className="box-body">
      <h4 className="user-subheader">
        Manage subscribers

        {viewUser.amIGroupAdmin ? (
          <div className="user-subheader-sidelinks">
            <Link to={`/${viewUser.username}/subscribers`}>Browse subscribers</Link>
          </div>
        ) : false}
      </h4>

      {isLoading ? (
        <img width="100" height="100" src={throbber100}/>
      ) : (
        <>
          {amILastGroupAdmin ? <>
            <h3>Admins</h3>
            <p>You are the only Admin for this group. Before you can drop administrative privileges
              or leave this group, you have to promote another group member to Admin first.</p>
          </> : (
            <AdminsList
              header="Admins"
              users={groupAdmins}
              removeAdminRights={demoteFromAdmin}/>
          )}

          {users.length === 0 ? <>
            <h3>Other subscribers</h3>
            <p>There are none. You might want to invite a few friends.</p>
          </> : (
            <OtherSubsList
              header="Other subscribers"
              users={users}
              makeAdmin={promoteToAdmin}
              remove={unsubscribe}/>
          )}
        </>
      )}
    </div>
  );
};

function mapStateToProps(state, ownProps) {
  const myId = state.me.id;

  const isLoading = state.usernameSubscribers.isPending;

  const group = ownProps.viewUser;
  const groupAdmins = (group && group.administrators
    ? (group.administrators.map((userId) => state.users[userId]))
    : []);

  const usersWhoAreNotAdmins = _.filter(state.usernameSubscribers.payload, (user) => {
    return !groupAdmins.find(u => u.username === user.username);
  });
  const users = _.sortBy(usersWhoAreNotAdmins, 'username');

  const amILastGroupAdmin = (
    groupAdmins.find(u => u.username === state.me.username) !== undefined &&
    groupAdmins.length === 1
  );

  return { myId, isLoading, groupAdmins, users, amILastGroupAdmin };
}

const mapDispatchToProps = {
  unsubscribeFromGroup,
  promoteGroupAdmin,
  demoteGroupAdmin
};

export default connect(mapStateToProps, mapDispatchToProps)(UserManageSubscribers);
