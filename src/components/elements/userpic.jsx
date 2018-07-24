import React from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import defaultMediumPic from 'assets/images/default-userpic-50.png';
import defaultLargePic from 'assets/images/default-userpic-75.png';

const Userpic = ({ size, largePic, mediumPic }) => (
  <img src={size <= 50 ? (mediumPic || defaultMediumPic) : (largePic || defaultLargePic)} width={size} height={size}/>
);

Userpic.propTypes = {
  id: PropTypes.string,
  size: PropTypes.number
};

const getUserpic = createSelector(
  [
    (state, props) => props.id && state.users[props.id] && state.users[props.id].profilePictureLargeUrl,
    (state, props) => props.id && state.users[props.id] && state.users[props.id].profilePictureMediumUrl
  ],
  (largePic, mediumPic) => ({ largePic, mediumPic })
);

const mapStateToProps = (state, ownProps) => ({
  ...getUserpic(state, ownProps)
});

export default connect(mapStateToProps)(Userpic);
