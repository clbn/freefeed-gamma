import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import { updateGroup, updateGroupPicture, resetGroupUpdateForm } from '../redux/action-creators';
import GroupSettingsForm from './elements/group-settings-form';
import GroupPictureForm from './elements/group-picture-form';
import throbber100 from 'assets/images/throbber.gif';

const GroupSettings = (props) => (
  props.groupSettings.status === 'loading' ? (
    <div className="box">
      <div className="box-header-timeline">
        Group settings
      </div>
      <div className="box-body">
        <img width="100" height="100" src={throbber100}/>
      </div>
    </div>
  ) : props.groupSettings.status === 'success' ? (
    <div className="box">
      <div className="box-header-timeline">
        <Link to={`/${props.group.username}`}>{props.group.username}</Link>: group settings
      </div>
      <div className="box-body">
        <br/>

        <GroupSettingsForm
          group={props.group}
          updateGroup={props.updateGroup}
          resetGroupUpdateForm={props.resetGroupUpdateForm}
          {...props.groupSettingsForm}/>

        <hr/>

        <GroupPictureForm
          group={props.group}
          updateGroupPicture={props.updateGroupPicture}
          resetGroupUpdateForm={props.resetGroupUpdateForm}
          {...props.groupPictureForm}/>
      </div>
    </div>
  ) : props.groupSettings.status === 'error' ? (
    <div className="box">
      <div className="box-header-timeline">
        Group settings
      </div>
      <div className="box-body">
        <div className="alert alert-danger">{props.groupSettings.errorMessage}</div>
      </div>
    </div>
  ) : (
    <div/>
  )
);

function mapStateToProps(state, ownProps) {
  return {
    group: (_.find(state.users, { 'username': ownProps.params.userName }) || {}),
    groupSettings: state.groupSettings,
    groupSettingsForm: state.groupSettingsForm,
    groupPictureForm: state.groupPictureForm
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateGroup: (...args) => dispatch(updateGroup(...args)),
    updateGroupPicture: (...args) => dispatch(updateGroupPicture(...args)),
    resetGroupUpdateForm: (...args) => dispatch(resetGroupUpdateForm(...args))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupSettings);
