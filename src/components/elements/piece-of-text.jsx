import React, { Fragment, useState, useCallback } from 'react';
import Linkify from './linkify';

// Texts longer than thresholdTextLength should be cut to shortenedTextLength
const thresholdTextLength = 800;
const shortenedTextLength = 600;

//
// Insert separator between the elements of array
//
const intersperse = (array, separator) => {
  if (array.length < 2) {
    return array;
  }
  return array.flatMap(item => [separator, item]).slice(1);
};

//
// Replace single and double newlines with a clickable pilcrow
//
const addPilcrows = (chunk, expandFn) => {
  if (typeof chunk !== 'string') {
    return [chunk];
  }
  return intersperse(chunk.split(/\s*\n\s*/g), { type: 'pilcrow', onClick: expandFn });
};

//
// Replace double+ newlines with a paragraph break
//
const addParagraphs = (chunk) => {
  if (typeof chunk !== 'string') {
    return [chunk];
  }
  return intersperse(chunk.split(/\n\s*\n/g), { type: 'paragraph' });
};

//
// Replace single newlines with <br/> and trim every line
//
const addLinebreaks = (chunk) => {
  if (typeof chunk !== 'string') {
    return [chunk];
  }
  return intersperse(chunk.split(/\n/g).map(line => line.trim()), { type: 'br' });
};

//
// Get "length" of the chunk
//
const getLength = (chunk) => {
  if (typeof chunk === 'string') {
    return chunk.length;
  }
  return 1;
};

//
// Shorten text (chunk-aware) without cutting words (when possible)
// If shortened, add 'Read more' link.
//
const shortenText = (chunks, expandFn) => {
  const fullLength = chunks.reduce((acc, chunk) => acc + getLength(chunk), 0);
  if (fullLength <= thresholdTextLength) {
    return chunks;
  }

  const newChunks = [];
  for (let i = 0, aggLength = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkLength = getLength(chunk);

    // Keep pushing chunks until it doesn't fit anymore
    // Also, push non-text chunks under any conditions (we can't shorten them)
    if (aggLength + chunkLength <= shortenedTextLength
        || typeof chunk !== 'string') {
      aggLength += chunkLength;
      newChunks.push(chunk);
      continue;
    }

    // Now that it doesn't fit, let's shorten it and exit

    const maxLengthLeft = shortenedTextLength - aggLength; // How much room left
    const lastSpacePosition = chunk.lastIndexOf(' ', maxLengthLeft + 1); // The last space before the limit

    // Handle the case with a very long first word (i.e., no spaces before maxLengthLeft)
    // Note, we only let an inside-word cut happen in the very first chunk (i === 0).
    let cutIndex = lastSpacePosition > -1 ? lastSpacePosition : (i === 0 ? maxLengthLeft : 0);

    const newText = chunk.substr(0, cutIndex);

    if (newText.length > 0) {
      newChunks.push(newText);
    }

    break;
  }

  return [
    ...newChunks,
    '... ',
    { type: 'read-more', onClick: expandFn },
  ];
};

//
// Replace custom chunk objects with React components
//
const prepareForRendering = (chunk, i) => {
  if (typeof chunk === 'string') {
    return <Fragment key={i}>{chunk}</Fragment>;
  }

  switch (chunk.type) {
    case 'pilcrow': return <span key={i} className="pilcrow" onClick={chunk.onClick}> ¶ </span>;
    case 'paragraph': return <div key={i} className="p-break"><br/></div>;
    case 'br': return <br key={i}/>;
    case 'read-more': return <a key={i} className="read-more" onClick={chunk.onClick}>Read more</a>;
  }
};

//
// Combine all the utils above to format the text
//
const formatText = (text, expanded, expandFn) => {
  // 1. Normalize text
  // - Remove whitespace characters in the beginning and the end
  // - Replace repeated whitespace characters (except newline) with one space
  const normalizedText = text.trim().replace(/[^\S\n]+/g, ' ');

  // 2. Create the first big chunk, that's going to be broken up further
  let chunks = [normalizedText];

  // 3. Handle newlines
  if (!expanded) {
    chunks = chunks.flatMap(c => addPilcrows(c, expandFn));
  } else {
    chunks = chunks.flatMap(c => addParagraphs(c)).flatMap(c => addLinebreaks(c));
  }

  // 4. Shorten if it's too long (and add "Read more" if shortened)
  if (!expanded) {
    chunks = shortenText(chunks, expandFn);
  }

  // 5. Return chunk contents prepared for React rendering
  return chunks.map(prepareForRendering);
};

const PieceOfText = ({ text, isExpanded, userHover, arrowHover }) => {
  const [expanded, setExpanded] = useState(!!isExpanded);
  const handleExpand = useCallback(() => setExpanded(true), []);

  const chunks = formatText(text, expanded, handleExpand);

  return (
    <Linkify userHover={userHover} arrowHover={arrowHover}>
      {chunks}
    </Linkify>
  );
};

export default PieceOfText;
