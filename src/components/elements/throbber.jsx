import React from 'react';
import PropTypes from 'prop-types';

import throbber16 from 'assets/images/throbber-16.gif';
import 'styles/throbber.scss';

const Throbber = ({ name, size = 16 }) => (
  <img className={name ? 'throbber-' + name : ''} width={size} height={size} src={throbber16}/>
);

Throbber.propTypes = {
  name: PropTypes.string,
  size: PropTypes.number
};

export default Throbber;
