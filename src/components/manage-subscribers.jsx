import React from 'react';
import {connect} from 'react-redux';

import {Link} from 'react-router';
import {unsubscribeFromGroup, promoteGroupAdmin, demoteGroupAdmin} from '../redux/action-creators';

import {tileUserListFactory, WITH_REMOVE_AND_MAKE_ADMIN_HANDLES, WITH_REMOVE_ADMIN_RIGHTS} from './tile-user-list';
const SubsList = tileUserListFactory({type: WITH_REMOVE_AND_MAKE_ADMIN_HANDLES});
const AdminsList = tileUserListFactory({type: WITH_REMOVE_ADMIN_RIGHTS});

const ManageSubscribers = (props) => {
  const remove = (username) => props.unsubscribeFromGroup(props.groupName, username);
  const makeAdmin = (user) => props.promoteGroupAdmin(props.groupName, user);
  const removeAdminRights = (user) => {
    const isItMe = props.user.id === user.id;
    props.demoteGroupAdmin(props.groupName, user, isItMe);
  };

  return (
    <div className="box">
      <div className="box-header-timeline">
        {props.boxHeader.title}
      </div>
      <div className="box-body">
        <div className="row">
          <div className="col-md-6">
            <Link to={`/${props.groupName}`}>{props.groupName}</Link> › Manage subscribers
          </div>
          <div className="col-md-6 text-right">
            <Link to={`/${props.groupName}/subscribers`}>Browse subscribers</Link>
          </div>       
        </div>

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
            removeAdminRights={removeAdminRights}/>
        )}

        {props.users.length == 0 ? (
          <div>
            <h3>Other subscribers</h3>
            <div>There are none. You might want to invite a few friends.</div>
          </div>
        ) : (
          <SubsList
            header="Other subscribers"
            users={props.users}
            makeAdmin={makeAdmin}
            remove={remove}/>
        )}
      </div>
    </div>
  );
};

function mapStateToProps(state, ownProps) {
  const boxHeader = state.boxHeader;
  const groupName = ownProps.params.userName;
  const user = state.user;

  const foundGroup = _.find(state.users, {username: groupName}) || {};
  const groupAdmins = (foundGroup && foundGroup.administrators
    ? (foundGroup.administrators.map((userId) => state.users[userId]))
    : []);

  const usersWhoAreNotAdmins = _.filter(state.usernameSubscribers.payload, user => {
    return groupAdmins.find(u => u.username == user.username) == null;
  });
  const users = _.sortBy(usersWhoAreNotAdmins, 'username');

  const amILastGroupAdmin = (
    groupAdmins.find(u => u.username == state.user.username ) != null &&
    groupAdmins.length == 1
  );

  return { boxHeader, groupName, user, groupAdmins, users, amILastGroupAdmin };
}

function mapDispatchToProps(dispatch) {
  return {
    unsubscribeFromGroup: (...args) => dispatch(unsubscribeFromGroup(...args)),
    promoteGroupAdmin: (...args) => dispatch(promoteGroupAdmin(...args)),
    demoteGroupAdmin: (...args) => dispatch(demoteGroupAdmin(...args))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageSubscribers);
