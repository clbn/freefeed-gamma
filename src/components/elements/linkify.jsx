import React from 'react';
import { Link } from 'react-router';
import URLFinder from 'ff-url-finder';

import config from '../../../config/app';
import UserName from './user-name';

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

class Linkify extends React.Component {
  createLinkElement({ type, username }, displayedLink, href) {
    const props = {
      key: `match${++this.idx}`,
      dir: 'ltr'
    };

    switch (type) {
      case AT_LINK: {
        props['user'] = { username };
        props['display'] = displayedLink;
        if (this.userHover) {
          props['onMouseEnter'] = () => this.userHover.hover(username);
          props['onMouseLeave'] = this.userHover.leave;
        }
        return React.createElement(UserName, props);
      }
      case LOCAL_LINK:
      case HASHTAG: {
        props['to'] = href;
        return React.createElement(Link, props, displayedLink);
      }
      case ARROW: {
        props['className'] = 'reference-arrow';
        props['onClick'] = () => this.arrowHover.hover(displayedLink.length);
        props['onMouseEnter'] = () => this.arrowHover.hover(displayedLink.length);
        props['onMouseLeave'] = this.arrowHover.leave;
        return React.createElement('span', props, displayedLink);
      }
      default: {
        props['href'] = href;
        props['target'] = '_blank';
        props['rel'] = 'noopener';
        return React.createElement('a', props, displayedLink);
      }
    }
  }

  parseCounter = 0;
  idx = 0;

  parseString(string) {
    let elements = [];
    if (string === '') {
      return elements;
    }

    this.idx = 0;

    try {
      finder.parse(string).map(it => {
        let displayedLink;
        let href;

        if (it.type === LINK) {
          displayedLink = URLFinder.shorten(it.text, MAX_URL_LENGTH);
          href = it.url;
        } else if (it.type === AT_LINK) {
          displayedLink = it.text;
          href = `/${it.username}`;
        } else if (it.type === LOCAL_LINK) {
          displayedLink = URLFinder.shorten(it.text, MAX_URL_LENGTH);
          href = it.uri;
        } else if (it.type === HASHTAG) {
          displayedLink = it.text;
          href = { pathname: '/search', query: { q: it.text } };
        } else if (it.type === EMAIL) {
          displayedLink = it.text;
          href = `mailto:${it.address}`;
        } else if (it.type === ARROW && this.arrowHover) {
          displayedLink = it.text;
        } else {
          elements.push(it.text);
          return;
        }

        let linkElement = this.createLinkElement(it, displayedLink, href);

        elements.push(linkElement);
      });

      return (elements.length === 1) ? elements[0] : elements;
    } catch (err) {
      console.log('Error while linkifying text', string, err);
    }
    return [string];
  }

  parse(children) {
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
  }

  render() {
    this.parseCounter = 0;
    this.userHover = this.props.userHover;
    this.arrowHover = this.props.arrowHover;
    const parsedChildren = this.parse(this.props.children);

    return <span className="Linkify" dir="auto">{parsedChildren}</span>;
  }
}

export default Linkify;
