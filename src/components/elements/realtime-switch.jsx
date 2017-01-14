import React from 'react';
import { connect } from 'react-redux';

import { updateFrontendPreferences, home } from '../../redux/action-creators';

const RealtimeSwitch = (props) => (
  <div className={'realtime-switch' + (props.frontendPreferences.realtimeActive ? ' on' : ' off')}>
    <div className="realtime-switch-label">Realtime updates</div>
    <div className="realtime-switch-range" onClick={props.handleClick}>
      <div className="realtime-switch-state">{props.frontendPreferences.realtimeActive ? 'on' : 'off'}</div>
      <div className="realtime-switch-toggle"></div>
    </div>
  </div>
);

const mapStateToProps = (state) => {
  return {
    userId: state.user.id,
    frontendPreferences: state.user.frontendPreferences
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggle: (userId, frontendPreferences) => {
      const realtimeActive = !frontendPreferences.realtimeActive;

      // Submit new preferences
      dispatch(updateFrontendPreferences(userId, { ...frontendPreferences, realtimeActive }));

      // Reload home feed if realtime activated
      if (realtimeActive) {
        dispatch(home());
      }
    }
  };
};

const mergeProps = (stateProps, dispatchProps) => {
  return {
    ...stateProps,
    handleClick: () => dispatchProps.toggle(stateProps.userId, stateProps.frontendPreferences)
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(RealtimeSwitch);
