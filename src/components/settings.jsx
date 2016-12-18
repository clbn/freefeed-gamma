import React from 'react';
import { connect } from 'react-redux';
import { updateUser, resetUserSettingsForm, updateUserPicture, updateFrontendPreferences, updatePassword } from '../redux/action-creators';
import UserSettingsForm from './elements/user-settings-form';
import UserPictureForm from './elements/user-picture-form';
import UserFrontendPreferencesForm from './elements/user-frontend-preferences-form';
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
          user={props.user}
          updateUser={props.updateUser}
          resetUserSettingsForm={props.resetUserSettingsForm}
          {...props.userSettingsForm}/>

        <hr/>

        <UserPictureForm
          user={props.user}
          updateUserPicture={props.updateUserPicture}
          {...props.userPictureForm}/>

        <hr/>

        <UserFrontendPreferencesForm
          userId={props.user.id}
          preferences={props.user.frontendPreferences}
          updateFrontendPreferences={props.updateFrontendPreferences}
          {...props.frontendPreferencesForm}/>

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
    user: state.user,
    userSettingsForm: state.userSettingsForm,
    userPictureForm: state.userPictureForm,
    frontendPreferencesForm: state.frontendPreferencesForm,
    passwordForm: state.passwordForm
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateUser: (...args) => dispatch(updateUser(...args)),
    resetUserSettingsForm: (...args) => dispatch(resetUserSettingsForm(...args)),
    updateUserPicture: (...args) => dispatch(updateUserPicture(...args)),
    updateFrontendPreferences: (...args) => dispatch(updateFrontendPreferences(...args)),
    updatePassword: (...args) => dispatch(updatePassword(...args))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
