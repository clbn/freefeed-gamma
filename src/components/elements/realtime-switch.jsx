import React from 'react';
import { connect } from 'react-redux';

import { updateUserPreferences, home } from '../../redux/action-creators';

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
    myId: state.me.id,
    frontendPreferences: state.me.frontendPreferences
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggle: (myId, frontendPreferences) => {
      const realtimeActive = !frontendPreferences.realtimeActive;

      // Submit new preferences
      dispatch(updateUserPreferences(myId, null, { ...frontendPreferences, realtimeActive }));

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
    handleClick: () => dispatchProps.toggle(stateProps.myId, stateProps.frontendPreferences)
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(RealtimeSwitch);
