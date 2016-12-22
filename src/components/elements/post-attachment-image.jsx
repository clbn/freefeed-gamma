import React from 'react';
import numeral from 'numeral';

import { preventDefault } from '../../utils';

export default (props) => {
  const formattedFileSize = numeral(props.fileSize).format('0.[0] b');
  const formattedImageSize = (props.imageSizes.o ? `, ${props.imageSizes.o.w}×${props.imageSizes.o.h}px` : '');
  const nameAndSize = props.fileName + ' (' + formattedFileSize + formattedImageSize + ')';

  const removeAttachment = () => props.removeAttachment(props.id);

  let srcSet;
  if (props.imageSizes.t2 && props.imageSizes.t2.url) {
    srcSet = props.imageSizes.t2.url + ' 2x';
  } else if (props.imageSizes.o && props.imageSizes.t && props.imageSizes.o.w <= props.imageSizes.t.w * 2) {
    srcSet = (props.imageSizes.o.url || props.url) + ' 2x';
  }

  const imageAttributes = {
    src: props.imageSizes.t && props.imageSizes.t.url || props.thumbnailUrl,
    srcSet,
    alt: nameAndSize,
    width: props.imageSizes.t && props.imageSizes.t.w || props.imageSizes.o && props.imageSizes.o.w || undefined,
    height: props.imageSizes.t && props.imageSizes.t.h || props.imageSizes.o && props.imageSizes.o.h || undefined
  };

  // Make sure the image is not wider than viewport (it makes sense for mobile screens)
  const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  const attachmentMargins = 15 + 2 + 2 + 15; // app margin + border+padding + padding+border + app margin
  const maxWidth = viewportWidth - attachmentMargins;
  imageAttributes.style = {
    maxWidth: maxWidth,
    maxHeight: imageAttributes.width && imageAttributes.height && Math.round(maxWidth / imageAttributes.width * imageAttributes.height)
  };

  return (
    <div className="attachment">
      <a href={props.url} title={nameAndSize} onClick={preventDefault(props.handleClick)} target="_blank" rel="noopener">
        {props.thumbnailUrl ? (
          <img {...imageAttributes}/>
        ) : (
          props.id
        )}
      </a>

      {props.isEditing ? (
        <a className="remove-attachment fa fa-times" title="Remove image" onClick={removeAttachment}></a>
      ) : false}
    </div>
  );
};
