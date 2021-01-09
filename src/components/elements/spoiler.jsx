import React, { useCallback, useState } from 'react';
import classnames from 'classnames';

const Blurred = ({ children, off = false, backward = false }) => off ? children : (
  children.split('').map((char, i) =>
    <span key={i} className={`blur-${backward ? 9-i : i}`}>{char}</span>
  )
);

const Spoiler = ({ openingTag, closingTag, children }) => {
  if (!children) {
    return openingTag;
  }

  const [visible, setVisible] = useState(false);
  const handleToggle = useCallback(() => setVisible(!visible), [visible]);

  const classes = classnames({
    'spoiler': true,
    'spoiler-hidden': !visible,
  });

  return (
    <span className={classes} title={visible ? null : 'This is a spoiler (click to reveal)'}>
      <span onClick={handleToggle}><Blurred off={visible}>{openingTag}</Blurred></span>
      <u onClick={visible ? null : handleToggle}>{children}</u>
      {closingTag && <span onClick={handleToggle}><Blurred off={visible} backward>{closingTag}</Blurred></span>}
    </span>
  );
};

export default Spoiler;
