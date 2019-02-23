import React from 'react';
import classnames from 'classnames';

const dummyWord = (length, volatility) => {
  const dummyChar = '\u2586'; // U+2586 LOWER THREE QUARTERS BLOCK
  const charWidthFactor = 0.7; // because that block is much wider than the average latin letter

  let normalizedLength;

  if (!volatility) {
    normalizedLength = Math.round(length * charWidthFactor);
  } else {
    const min = length - volatility;
    const max = length + volatility;
    const randomLength = Math.floor(Math.random() * (max - min + 1)) + min;
    normalizedLength = Math.round(randomLength * charWidthFactor);
  }

  return dummyChar.repeat(normalizedLength);
};

const DummyUserTile = () => {
  const postClass = classnames({
    'user-tile': true,
    'col-xs-3': true,
    'col-sm-2': true,
    'dummy-user': true
  });

  const userpicClass = classnames({
    'userpic': true,
    'userpic-loading': true
  });

  const username = dummyWord(7, 3);

  return (
    <li className={postClass}>
      <div className={userpicClass}></div>

      <div className="user-tile-name">
        {username}
      </div>
    </li>
  );
};

export default () => {
  const tiles = [];
  for (let i=0; i<12; i++) {
    tiles.push(<DummyUserTile key={i}/>);
  }

  return <>
    <h3></h3>

    <ul className="row tile-list">
      {tiles}
    </ul>
  </>;
};
