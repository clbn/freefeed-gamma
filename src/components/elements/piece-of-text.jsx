import React from 'react';
import Linkify from './linkify';

// Texts longer than thresholdTextLength should be cut to shortenedTextLength
const thresholdTextLength = 800;
const shortenedTextLength = 600;

// Suffix to add to the shortened text
const suffix = '...';

// Separator element for "paragraphs"
const paragraphBreak = <div className="p-break"><br/></div>;

// Shorten text without cutting words
const shortenText = (text, maxLength) => {
  if (text.length <= maxLength) {
    return text;
  }

  // Calculate max length taking into account the suffix
  const maxTextLength = maxLength - suffix.length;

  // Find the last space before maxTextLength
  const lastSpacePosition = text.lastIndexOf(' ', maxTextLength + 1);

  // Handle the case with a very long first word (i.e., no spaces before maxTextLength)
  const cutIndex = lastSpacePosition > -1 ? lastSpacePosition : maxTextLength;

  const newText = text.substr(0, cutIndex);
  return newText + suffix;
};

// Inject an element between every element in array.
// It's similar to array.join(separator), but returns an array, not a string.
const injectSeparator = (array, separator) => {
  if (array.length < 2) {
    return array;
  }

  const result = [];

  array.forEach((item, i) => {
    result.push(<span key={'item-' + i}>{item}</span>);
    result.push(React.cloneElement(separator, { key: 'separator-' + i }, separator.props.children));
  });

  result.pop();

  return result;
};

// Replace single newlines with <br/> and trim every line
const brAndTrim = (text) => {
  const lines = text.split(/\n/g).map(line => line.trim());
  return injectSeparator(lines, <br/>);
};

// Replace single and double newlines with a clickable pilcrow
function pilcrifyText(text, expandFn) {
  return injectSeparator(text.split(/\s*\n\s*/g), <span className="pilcrow" onClick={expandFn}> ¶ </span>);
}

const getCollapsedText = (text, expandFn) => {
  // Remove whitespace characters in the beginning and the end
  const trimmedText = text.trim();

  // Replace repeated whitespace characters (except newline) with one space
  const normalizedText = trimmedText.replace(/[^\S\n]+/g, ' ');

  if (normalizedText.length <= thresholdTextLength) {
    // The text is short enough, just add pilcrows if needed
    return pilcrifyText(normalizedText, expandFn);
  }

  // The text is too long, shorten it and complete with 'Read more'
  const shortenedText = shortenText(normalizedText, shortenedTextLength);
  return [
    ...pilcrifyText(shortenedText, expandFn),
    ' ',
    <a key="read-more" className="read-more" onClick={expandFn}>Read more</a>
  ];
};

const getExpandedText = (text) => {
  const trimmedText = text.trim();

  if (!/\n/.test(trimmedText)) {
    return trimmedText;
  }

  const paragraphs = trimmedText.split(/\n\s*\n/g).map(brAndTrim);

  return injectSeparator(paragraphs, paragraphBreak);
};

export default class PieceOfText extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isExpanded: !!props.isExpanded
    };
  }

  handleExpandText = () => this.setState({ isExpanded: true });

  render() {
    return (this.props.text ? (
      <Linkify userHover={this.props.userHover} arrowHover={this.props.arrowHover}>
        {this.state.isExpanded
          ? getExpandedText(this.props.text)
          : getCollapsedText(this.props.text, this.handleExpandText)}
      </Linkify>
    ) : <span/>);
  }
}
