import React from 'react';
import { Link } from 'react-router';
import {
  combine, withText,
  hashTags, emails, mentions, foreignMentions, links, arrows,
  HashTag, Email, Mention, ForeignMention, Link as TLink, Arrows
} from 'social-text-tokenizer';

import config from '../../../config/config';
import UserName from './user-name';

const MAX_URL_LENGTH = 50;

const getLocalPart = (url) => {
  const m = url.match(/^https?:\/\/([^/]+)(.*)/i);
  let hostname, path;

  if (m) {
    hostname = m[1].toLowerCase();
    path = m[2] || '/';
  }

  const p = config.siteDomains.indexOf(hostname);

  if (p > -1 && path !== '/') {
    return path;
  }

  return null;
};

const splitLink = (linkToken, maxLength) => {
  let visiblePart = linkToken.shorten(maxLength);
  if (visiblePart.slice(-1) === '\u2026') {
    visiblePart = visiblePart.slice(0, -1);
  }

  const hiddenPart = linkToken.pretty.slice(visiblePart.length);

  return {
    visiblePart,
    hiddenPart
  };
};

// Break down the string into hashTags, emails, mentions, foreignMentions, links and arrows,
// then include Text tokens in between
const tokenize = withText(combine(hashTags(), emails(), mentions(), foreignMentions(), links(), arrows(/\u2191+|\^([1-9]\d*|\^*)/g)));

const Linkify = ({ userHover, arrowHover, children }) => tokenize(children).map((token, i) => {
  if (token instanceof TLink) {
    let Component;
    const props = { key: i };
    const { visiblePart, hiddenPart } = splitLink(token, MAX_URL_LENGTH);

    const localURL = getLocalPart(token.text);

    if (localURL) {
      Component = Link;
      props.to = localURL;
    } else {
      Component = (props) => <a {...props}>{props.children}</a>;
      props.href = token.href;
      props.target = '_blank';
      props.rel = 'noopener';
    }

    if (hiddenPart.length > 0) {
      props.className = 'shortened-link';
      return <Component {...props}>{visiblePart}<del>{hiddenPart}</del></Component>;
    }

    return <Component {...props}>{visiblePart}</Component>;
  }

  if (token instanceof Mention) {
    return (
      <UserName
        key={i}
        username={token.text.slice(1).toLowerCase()}
        display={token.text}
        userHover={userHover}/>
    );
  }

  if (token instanceof Arrows && arrowHover) {
    const length = Number(token.text.match(/\d+/)?.[0]) || token.text.length; // Support both "^^^" and "^12"
    return (
      <span
        key={i}
        className={'reference-arrow'}
        onClick={() => arrowHover.click(length)} // eslint-disable-line react/jsx-no-bind
        onMouseEnter={() => arrowHover.hover(length)} // eslint-disable-line react/jsx-no-bind
        onMouseLeave={arrowHover.leave}
      >
        {token.text}
      </span>
    );
  }

  if (token instanceof Email) {
    return <a key={i} href={`mailto:${token.text}`}>{token.pretty}</a>;
  }

  if (token instanceof HashTag) {
    return <Link key={i} to={{ pathname: '/search', query: { q: token.text } }}>{token.text}</Link>;
  }

  return token.text;
});

export default Linkify;
