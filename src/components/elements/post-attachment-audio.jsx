import React from 'react';
import numeral from 'numeral';

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

  const removeAttachment = () => props.removeAttachment(props.id);

  return (
    <div className="attachment">
      <div>
        <audio src={props.url} title={artistAndTitle} preload="none" controls></audio>
      </div>
      <div>
        <a href={props.url} title={artistAndTitle} target="_blank" rel="noopener">
          <i className="fa fa-file-audio-o"></i>
          <span>{artistAndTitle}</span>
        </a>

        {props.isEditing ? (
          <i className="remove-attachment fa fa-times" title="Remove audio file" onClick={removeAttachment}></i>
        ) : false}
      </div>
    </div>
  );
};
