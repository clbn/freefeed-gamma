import React, { Fragment, useState, useCallback } from 'react';
import Linkify from './linkify';
import Spoiler from './spoiler';
import 'styles/piece-of-text.scss';

// Regex for spoilers
// (copied from the official FreeFeed client to make sure it affects the same parts of text)
const spoilerRegex = /<(spoiler|спойлер)>(?:(?!(<(spoiler|спойлер)>|<\/(spoiler|спойлер)>)).)*<\/(spoiler|спойлер)>/gi;
const openingSpoilerTagLength = '<spoiler>'.length;
const closingSpoilerTagLength = '</спойлер>'.length;

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
// Replace spoilers with spoiler objects
//
const addSpoilers = (chunk) => {
  if (typeof chunk !== 'string') {
    return [chunk];
  }

  const spoilers = [...chunk.matchAll(spoilerRegex)];

  if (spoilers.length === 0) {
    return [chunk];
  }

  const pieces = [];
  let index = 0;

  spoilers.forEach(match => {
    const spoilerText = match[0];
    const spoilerPosition = match.index;

    // Push text before the spoiler
    if (spoilerPosition > index) {
      pieces.push(chunk.slice(index, spoilerPosition));
    }

    // Push the spoiler object
    const openingTag = spoilerText.slice(0, openingSpoilerTagLength);
    const content = spoilerText.slice(openingSpoilerTagLength, -closingSpoilerTagLength);
    const closingTag = spoilerText.slice(-closingSpoilerTagLength);
    pieces.push({ type: 'spoiler', openingTag, content, closingTag });

    index = spoilerPosition + spoilerText.length;
  });

  // Push text after the last spoiler
  if (index < chunk.length) {
    pieces.push(chunk.slice(index));
  }

  return pieces;
};

//
// Get "length" of the chunk
//
const getLength = (chunk) => {
  if (typeof chunk === 'string') {
    return chunk.length;
  }
  if (chunk.type === 'spoiler') {
    return chunk.content.length; // Not including `chunk.openingTag.length` and `chunk.closingTag.length` on purpose
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
        || (typeof chunk !== 'string' && !chunk.content)) {
      aggLength += chunkLength;
      newChunks.push(chunk);
      continue;
    }

    // Now that it doesn't fit, let's shorten it and exit

    const text = (typeof chunk === 'string' ? chunk : chunk.content);
    const maxLengthLeft = shortenedTextLength - aggLength; // How much room left
    const lastSpacePosition = text.lastIndexOf(' ', maxLengthLeft + 1); // The last space before the limit

    // Handle the case with a very long first word (i.e., no spaces before maxLengthLeft)
    // Note, we only let an inside-word cut happen in the very first chunk (i === 0).
    let cutIndex = lastSpacePosition > -1 ? lastSpacePosition : (i === 0 ? maxLengthLeft : 0);

    const newText = text.substr(0, cutIndex);

    if (newText.length > 0) {
      const newChunk = (typeof chunk === 'string' ? newText : { ...chunk, content: newText, closingTag: null });
      newChunks.push(newChunk);
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
    case 'spoiler': return <Spoiler key={i} {...chunk}>{chunk.content}</Spoiler>;
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

  // 4. Handle spoilers
  chunks = chunks.flatMap(c => addSpoilers(c));

  // 5. Shorten if it's too long (and add "Read more" if shortened)
  if (!expanded) {
    chunks = shortenText(chunks, expandFn);
  }

  // 6. Return chunk contents prepared for React rendering
  return chunks.map(prepareForRendering);
};

const PieceOfText = ({ text, isExpanded, userHover, arrowHover }) => {
  const [expanded, setExpanded] = useState(!!isExpanded);
  const handleExpand = useCallback(() => setExpanded(true), []);

  const chunks = formatText(text, expanded, handleExpand);

  return (
    <span className="piece-of-text" dir="auto">
      <Linkify userHover={userHover} arrowHover={arrowHover}>
        {chunks}
      </Linkify>
    </span>
  );
};

export default PieceOfText;
