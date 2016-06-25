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

const dummyText = (minWords, maxWords, wordLength, wordLengthVolatility) => {
  const randomWordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
  let wordList = [];
  for (let i = 0; i < randomWordCount; i++) {
    wordList.push(dummyWord(wordLength, wordLengthVolatility));
  }
  return wordList.join(' ');
};

export default (props) => {
  const postClass = classnames({
    'post': true,
    'dummy-post': true,
    'single-post': props.isSinglePost
  });

  const userpicClass = classnames({
    'userpic': true,
    'userpic-loading': true,
    'userpic-large': props.isSinglePost
  });

  const author = <a>{dummyWord(8, 4)}</a>;
  const recipients = (Math.random() < 0.5 ? (<span>{' ' + dummyWord(2) + ' '}<a>{dummyText(1, 2, 10, 3)}</a></span>) : false);
  const text = dummyText(3, 30, 5, 3);

  const attachments = (Math.random() < 0.5 ? (
    <div className="attachments">
      <div className="image-attachments">
        {Math.random() < 0.5 ? (
          <div className={`attachment dummy-attachment-` + Math.floor(Math.random() * 3)}></div>
        ) : false}
        {Math.random() < 0.5 ? (
          <div className={`attachment dummy-attachment-` + Math.floor(Math.random() * 3)}></div>
        ) : false}
        {Math.random() < 0.5 ? (
          <div className={`attachment dummy-attachment-` + Math.floor(Math.random() * 3)}></div>
        ) : false}
      </div>
    </div>
  ) : false);

  const dateTime = dummyWord(10, 2);
  const commentLink = (Math.random() < 0.75 ? (<span>{' - '}<a>{dummyWord(7)}</a></span>) : false);
  const likeLink = (Math.random() < 0.75 ? (<span>{' - '}<a>{dummyWord(4)}</a></span>) : false);
  const hideLink = (Math.random() < 0.75 ? (<span>{' - '}<a>{dummyWord(4)}</a></span>) : false);
  const moreLink = (Math.random() < 0.75 ? (<span>{' - '}<a>{dummyWord(4)}</a></span>) : false);

  const likes = (Math.random() < 0.75 ? (
    <div className="likes">
      <span className="likes-icon">{dummyWord(2) + ' '}</span>
      <a>{dummyText(1, 3, 10, 3)}</a>
      {' ' + dummyWord(4) + ' ' + dummyWord(3)}
    </div>
  ) : false);

  return (
    <div className={postClass}>
      <div className="post-userpic">
        <div className={userpicClass}></div>
      </div>
      <div className="post-top">
        <div className="post-header">
          {author}
          {recipients}
        </div>

        <div className="post-text">
          {text}
        </div>
      </div>

      <div className="post-bottom">
        {attachments}

        <div className="post-footer">
          {dateTime}
          {commentLink}
          {likeLink}
          {hideLink}
          {moreLink}
        </div>

        {likes}
      </div>
    </div>
  );
};
