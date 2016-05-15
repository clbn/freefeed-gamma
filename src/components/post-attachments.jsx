import React from 'react';
import ImageAttachment from './post-attachment-image';
import AudioAttachment from './post-attachment-audio';
import GeneralAttachment from './post-attachment-general';

export default class PostAttachments extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isExpanded: !!props.isExpanded
    };
  }

  attachmentMargins = 2 + 2 + 8; // border+padding + padding+border + margin
  toggleWidth = 24; // "chevron-circle" width

  getImageAttachments(images) {
    let showToggle = false;

    if (
      images.length > 1 &&
      !this.state.isExpanded &&
      (this.getImageAttachmentsWidth(images) > this.getContainerWidth())
    ) {
      const firstRowCapacity = this.getFirstRowCapacity(images);
      images = images.slice(0, firstRowCapacity);
      showToggle = true;
    }

    images = images
      .map(attachment => (
        <ImageAttachment
          key={attachment.id}
          isEditing={this.props.isEditing}
          removeAttachment={this.props.removeAttachment}
          {...attachment}/>
      ));

    if (showToggle) {
      images.push(
        <a key="show-more-images"
           className="show-more-images fa"
           title="Show more"
           onClick={this.expandImages.bind(this)}></a>
      );
    }

    return images;
  }

  getImageAttachmentsWidth(images) {
    return images.reduce((acc, item) => {
      const w = +(item.imageSizes && item.imageSizes.t && item.imageSizes.t.w);
      return acc + w + this.attachmentMargins;
    }, 0);
  }

  getContainerWidth() {
    return 600;
  }

  getFirstRowCapacity(images) {
    const maxWidth = this.getContainerWidth() - this.toggleWidth;
    const margins = this.attachmentMargins;

    let accWidth = 0;
    let capacity = 0;

    for (let i=0; i < images.length; i++) {
      const item = images[i];
      const itemWidth = +(item.imageSizes && item.imageSizes.t && item.imageSizes.t.w);

      if (accWidth + itemWidth + margins < maxWidth) {
        accWidth += itemWidth + margins;
        capacity++;
      } else {
        break;
      }
    }

    return capacity;
  }

  expandImages() {
    this.setState({isExpanded: true});
  }

  render() {
    const props = this.props;
    const attachments = props.attachments || [];

    const imageAttachments = this.getImageAttachments(
      attachments.filter(attachment => attachment.mediaType === 'image')
    );

    const audioAttachments = attachments
      .filter(attachment => attachment.mediaType === 'audio')
      .map(attachment => (
        <AudioAttachment
          key={attachment.id}
          isEditing={this.props.isEditing}
          removeAttachment={this.props.removeAttachment}
          {...attachment}/>
      ));

    const generalAttachments = attachments
      .filter(attachment => attachment.mediaType === 'general')
      .map(attachment => (
        <GeneralAttachment
          key={attachment.id}
          isEditing={this.props.isEditing}
          removeAttachment={this.props.removeAttachment}
          {...attachment}/>
      ));

    return (attachments.length > 0 ? (
      <div className="attachments">
        <div className="image-attachments">
          {imageAttachments}
        </div>
        <div className="audio-attachments">
          {audioAttachments}
        </div>
        <div className="general-attachments">
          {generalAttachments}
        </div>
      </div>
    ) : <div/>);
  }
};
