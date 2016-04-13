import React from 'react';
import {connect} from 'react-redux';

import {toggleRealtime, updateFrontendRealtimePreferences, home} from '../redux/action-creators';

const RealtimeSwitch = props => (
  <div className={'realtime-switch' + (props.realtimeActive ? ' on' : ' off')}>
    <div className="realtime-switch-label">Realtime updates</div>
    <div className="realtime-switch-range" onClick={() => props.toggle(props.userId, !props.realtimeActive)}>
      <div className="realtime-switch-state">{props.realtimeActive ? 'on' : 'off'}</div>
      <div className="realtime-switch-toggle"></div>
    </div>
  </div>
);

const mapStateToProps = (state) => {
  return {
    userId: state.user.id,
    realtimeActive: state.frontendRealtimePreferencesForm.realtimeActive,
    status: state.frontendRealtimePreferencesForm.status
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggle: (userId, settingActive) => {
      //send a request to change flag
      dispatch(updateFrontendRealtimePreferences(userId, {realtimeActive: settingActive}));
      //set a flag to show
      dispatch(toggleRealtime());
      if (settingActive) {
        dispatch(home());
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RealtimeSwitch);
