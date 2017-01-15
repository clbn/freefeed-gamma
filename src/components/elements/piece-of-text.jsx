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

const getCollapsedText = (text, expandText) => {
  const trimmedText = text.trim();
  const normalizedText = trimmedText.replace(/\s+/g, ' ');

  if (normalizedText.length <= thresholdTextLength) {
    if (!/\n/.test(trimmedText)) {
      // The text is short and has no newlines
      return normalizedText;
    }

    // The text is short but has some newlines
    return [
      <span key="text">{normalizedText}</span>,
      ' ',
      <a key="read-more" className="read-more" onClick={expandText}>Expand</a>
    ];
  }

  // The text is long
  const shortenedText = shortenText(normalizedText, shortenedTextLength);

  return [
    <span key="text">{shortenedText}</span>,
    ' ',
    <a key="read-more" className="read-more" onClick={expandText}>Read more</a>
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
