import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import { unsubscribeFromGroup, promoteGroupAdmin, demoteGroupAdmin } from '../../redux/action-creators';
import { tileUserListFactory, WITH_REMOVE_AND_MAKE_ADMIN_HANDLES, WITH_REMOVE_ADMIN_RIGHTS } from './tile-user-list';
import throbber100 from 'assets/images/throbber.gif';

const AdminsList = tileUserListFactory({ type: WITH_REMOVE_ADMIN_RIGHTS });
const OtherSubsList = tileUserListFactory({ type: WITH_REMOVE_AND_MAKE_ADMIN_HANDLES });

const UserManageSubscribers = (props) => {
  const unsubscribe = (username) => props.unsubscribeFromGroup(props.viewUser.username, username);

  const promoteToAdmin = (user) => props.promoteGroupAdmin(props.viewUser.username, user);

  const demoteFromAdmin = (user) => {
    const isItMe = (props.myId === user.id);
    props.demoteGroupAdmin(props.viewUser.username, user, isItMe);
  };

  return (
    <div className="box-body">
      <h4 className="user-subheader">
        Manage subscribers

        {props.viewUser.amIGroupAdmin ? (
          <div className="user-subheader-sidelinks">
            <Link to={`/${props.viewUser.username}/subscribers`}>Browse subscribers</Link>
          </div>
        ) : false}
      </h4>

      {props.isLoading ? (
        <img width="100" height="100" src={throbber100}/>
      ) : (
        <div>
          {props.amILastGroupAdmin ? (
            <div>
              <h3>Admins</h3>
              <div>You are the only Admin for this group. Before you can drop administrative privileges
                or leave this group, you have to promote another group member to Admin first.</div>
            </div>
          ) : (
            <AdminsList
              header="Admins"
              users={props.groupAdmins}
              removeAdminRights={demoteFromAdmin}/>
          )}

          {props.users.length == 0 ? (
            <div>
              <h3>Other subscribers</h3>
              <div>There are none. You might want to invite a few friends.</div>
            </div>
          ) : (
            <OtherSubsList
              header="Other subscribers"
              users={props.users}
              makeAdmin={promoteToAdmin}
              remove={unsubscribe}/>
          )}
        </div>
      )}
    </div>
  );
};

function mapStateToProps(state, ownProps) {
  const myId = state.user.id;

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
    groupAdmins.find(u => u.username === state.user.username) != null &&
    groupAdmins.length == 1
  );

  return { myId, isLoading, groupAdmins, users, amILastGroupAdmin };
}

function mapDispatchToProps(dispatch) {
  return {
    unsubscribeFromGroup: (...args) => dispatch(unsubscribeFromGroup(...args)),
    promoteGroupAdmin: (...args) => dispatch(promoteGroupAdmin(...args)),
    demoteGroupAdmin: (...args) => dispatch(demoteGroupAdmin(...args))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserManageSubscribers);
