import React from 'react';
import { connect } from 'react-redux';
import { updateUser, resetUserSettingsForm, updateUserPicture, updateUserPreferences, updatePassword } from '../redux/action-creators';
import UserSettingsForm from './elements/user-settings-form';
import UserPictureForm from './elements/user-picture-form';
import UserPreferencesForm from './elements/user-preferences-form';
import UserChangePasswordForm from './elements/user-change-password-form';

const Settings = (props) => (
  <div className="content">
    <div className="box">
      <div className="box-header-timeline">
        Settings
      </div>
      <div className="box-body">
        <br/>

        <UserSettingsForm
          user={props.me}
          updateUser={props.updateUser}
          resetUserSettingsForm={props.resetUserSettingsForm}
          {...props.userSettingsForm}/>

        <hr/>

        <UserPictureForm
          user={props.me}
          updateUserPicture={props.updateUserPicture}
          {...props.userPictureForm}/>

        <hr/>

        <UserPreferencesForm
          userId={props.me.id}
          preferences={props.me.preferences}
          frontendPreferences={props.me.frontendPreferences}
          update={props.updateUserPreferences}
          {...props.userPreferencesForm}/>

        <hr/>

        <UserChangePasswordForm
          updatePassword={props.updatePassword}
          {...props.passwordForm}/>
      </div>
    </div>
  </div>
);

function mapStateToProps(state) {
  return {
    me: state.me,
    userSettingsForm: state.userSettingsForm,
    userPictureForm: state.userPictureForm,
    userPreferencesForm: state.userPreferencesForm,
    passwordForm: state.passwordForm
  };
}

const mapDispatchToProps = {
  updateUser,
  resetUserSettingsForm,
  updateUserPicture,
  updateUserPreferences,
  updatePassword
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
