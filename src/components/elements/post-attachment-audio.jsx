import React, { useCallback } from 'react';
import numeral from 'numeral';

import Icon from './icon';

export default ({ id, fileName, fileSize, title, artist, url, isEditing, removeAttachment }) => {
  const formattedFileSize = numeral(fileSize).format('0.[0] b');

  let artistAndTitle;
  if (title && artist) {
    artistAndTitle = artist + ' – ' + title + ' (' + formattedFileSize + ')';
  } else if (title) {
    artistAndTitle = title + ' (' + formattedFileSize + ')';
  } else {
    artistAndTitle = fileName + ' (' + formattedFileSize + ')';
  }

  const handleRemove = useCallback(() => removeAttachment(id), [id, removeAttachment]);

  return (
    <div className="attachment">
      {!isEditing && <>
        <audio src={url} title={artistAndTitle} preload="none" controls></audio>
        <br/>
      </>}

      <a href={url} title={artistAndTitle} target="_blank" rel="noopener">
        <Icon name="file-audio"/>
        {artistAndTitle}
      </a>

      {isEditing ? (
        <span className="remove-attachment" title="Remove audio file" onClick={handleRemove}>
          <Icon name="times"/>
        </span>
      ) : false}
    </div>
  );
};
