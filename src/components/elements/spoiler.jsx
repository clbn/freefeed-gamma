import React, { useCallback, useState } from 'react';
import classnames from 'classnames';

const Blurred = ({ children, backward = false }) => (
  children.split('').map((char, i) =>
    <span key={i} className={`blur-${backward ? 9-i : i}`}>{char}</span>
  )
);

const Spoiler = ({ openingTag, closingTag, children }) => {
  const [visible, setVisible] = useState(false);
  const handleToggle = useCallback(() => setVisible(!visible), [visible]);

  if (!children) {
    return openingTag;
  }

  const classes = classnames({
    'spoiler': true,
    'spoiler-hidden': !visible,
  });

  return (
    <span className={classes} title={visible ? null : 'This is a spoiler (click to reveal)'}>
      <span onClick={handleToggle}><Blurred>{openingTag}</Blurred></span>
      <u onClick={visible ? null : handleToggle}>{children}</u>
      {closingTag && <span onClick={handleToggle}><Blurred backward>{closingTag}</Blurred></span>}
    </span>
  );
};

export default Spoiler;
