import React from 'react';
import PropTypes from 'prop-types';

const Icon = ({ name, title, className }) => (
  <svg className={'icon-' + name + (className ? ' ' + className : '')}>
    {title ? (
      <title>{title}</title>
    ) : false}
    <use xlinkHref={'#icon-' + name}></use>
  </svg>
);

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  className: PropTypes.string
};

export default Icon;
