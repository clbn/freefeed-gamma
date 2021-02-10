import React, { useCallback } from 'react';
import numeral from 'numeral';

import Icon from './icon';

export default (props) => {
  const formattedFileSize = numeral(props.fileSize).format('0.[0] b');

  let artistAndTitle = '';
  if (props.title && props.artist) {
    artistAndTitle = props.artist + ' – ' + props.title + ' (' + formattedFileSize + ')';
  } else if (props.title) {
    artistAndTitle = props.title + ' (' + formattedFileSize + ')';
  } else {
    artistAndTitle = props.fileName + ' (' + formattedFileSize + ')';
  }

  const removeAttachment = useCallback(() => props.removeAttachment(props.id), [props.id]);

  return (
    <div className="attachment">
      {!props.isEditing && <>
        <audio src={props.url} title={artistAndTitle} preload="none" controls></audio>
        <br/>
      </>}

      <a href={props.url} title={artistAndTitle} target="_blank" rel="noopener">
        <Icon name="file-audio"/>
        {artistAndTitle}
      </a>

      {props.isEditing ? (
        <span className="remove-attachment" title="Remove audio file" onClick={removeAttachment}>
          <Icon name="times"/>
        </span>
      ) : false}
    </div>
  );
};
