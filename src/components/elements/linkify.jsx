import React from 'react';
import { Link } from 'react-router';
import URLFinder from 'ff-url-finder';

import config from '../../../config/config';
import UserName from './user-name';
import 'styles/linkify.scss';

const MAX_URL_LENGTH = 50;

const LINK = 'link';
const AT_LINK = 'atLink';
const LOCAL_LINK = 'localLink';
const HASHTAG = 'hashTag';
const EMAIL = 'email';
const ARROW = 'arrow';

const finder = new URLFinder(
  ['ru', 'com', 'net', 'org', 'info', 'gov', 'edu', 'рф', 'ua'],
  config.siteDomains
);

finder.withHashTags = true;
finder.withArrows = true;

const splitLink = (url, maxLength) => {
  let visiblePart = URLFinder.shorten(url, maxLength);
  if (visiblePart.slice(-1) === '\u2026') {
    visiblePart = visiblePart.slice(0, -1);
  }

  const hiddenPart = url.slice(visiblePart.length);

  return {
    visiblePart,
    hiddenPart
  };
};

class Linkify extends React.Component {
  parseCounter = 0;
  idx = 0;

  getElementByType = (it) => {
    const props = {
      key: `match${++this.idx}`,
      dir: 'ltr'
    };

    switch (it.type) {

      case LINK: {
        props.href = it.url;
        props.target = '_blank';
        props.rel = 'noopener';

        const { visiblePart, hiddenPart } = splitLink(it.text, MAX_URL_LENGTH);

        if (hiddenPart.length > 0) {
          props.className = 'shortened-link';
          return <a {...props}>{visiblePart}<del>{hiddenPart}</del></a>;
        }

        return <a {...props}>{visiblePart}</a>;
      }

      case LOCAL_LINK: {
        props.to = it.uri;

        const { visiblePart, hiddenPart } = splitLink(it.text, MAX_URL_LENGTH);

        if (hiddenPart.length > 0) {
          props.className = 'shortened-link';
          return <Link {...props}>{visiblePart}<del>{hiddenPart}</del></Link>;
        }

        return <Link {...props}>{visiblePart}</Link>;
      }

      case AT_LINK: {
        props.username = it.username;
        props.display = it.text;
        if (this.userHover) {
          props.onMouseEnter = () => this.userHover.hover(it.username);
          props.onMouseLeave = this.userHover.leave;
        }
        return <UserName {...props}/>;
      }

      case EMAIL: {
        props.href = `mailto:${it.address}`;
        return <a {...props}>{it.text}</a>;
      }

      case HASHTAG: {
        props.to = { pathname: '/search', query: { q: it.text } };
        return <Link {...props}>{it.text}</Link>;
      }

      case ARROW: {
        if (!this.arrowHover) {
          return it.text;
        }

        props.className = 'reference-arrow';
        props.onClick = () => this.arrowHover.click(it.text.length);
        props.onMouseEnter = () => this.arrowHover.hover(it.text.length);
        props.onMouseLeave = this.arrowHover.leave;

        return <span {...props}>{it.text}</span>;
      }

    }

    return it.text;
  };

  parseString = (string) => {
    let elements = [];

    if (string === '') {
      return elements;
    }

    this.idx = 0;

    try {
      finder.parse(string).map(it => {
        elements.push(this.getElementByType(it));
      });

      return (elements.length === 1) ? elements[0] : elements;
    } catch (err) {
      console.log('Error while linkifying text', string, err);
    }

    return [string];
  };

  parse = (children) => {
    let parsed = children;

    if (typeof children === 'string') {
      parsed = this.parseString(children);
    } else if (React.isValidElement(children) && (children.type !== 'a') && (children.type !== 'button')) {
      parsed = React.cloneElement(
        children,
        { key: `parse${++this.parseCounter}` },
        this.parse(children.props.children)
      );
    } else if (children instanceof Array) {
      parsed = children.map(child => {
        return this.parse(child);
      });
    }

    return parsed;
  };

  render() {
    this.parseCounter = 0;
    this.userHover = this.props.userHover;
    this.arrowHover = this.props.arrowHover;

    const parsedChildren = this.parse(this.props.children);

    return <span dir="auto">{parsedChildren}</span>;
  }
}

export default Linkify;
