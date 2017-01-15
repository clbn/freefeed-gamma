import React from 'react';
import { PhotoSwipe } from 'react-photoswipe';

import ImageAttachment from './post-attachment-image';
import AudioAttachment from './post-attachment-audio';
import GeneralAttachment from './post-attachment-general';

export default class PostAttachments extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isExpanded: !!props.isExpanded,
      containerWidth: 0,
      isLightboxOpen: false,
      lightboxIndex: 0
    };
  }

  attachmentMinWidth = 32; // tiny image has container of the same size as image of 32×32
  attachmentMargins = 2 + 2 + 8; // border+padding + padding+border + margin
  toggleWidth = 24; // "chevron-circle" width

  lightboxOptions = {
    fullscreenEl: false,
    shareEl: false,
    zoomEl: false,
    clickToCloseNonZoomable: false,
    bgOpacity: 0.9,
    barsSize: { top: 0, bottom: 0 },
    getThumbBoundsFn: this.getThumbBounds()
  };
  lightboxThumbnailElement = null;

  refAttachmentsContainer = (element) => {
    this.attachmentsContainer = element;
  };

  getImageAttachments(images) {
    let showToggle = false;

    if (
      images.length > 1 &&
      !this.state.isExpanded &&
      (this.getImagesWidth(images) > this.getContainerWidth())
    ) {
      const firstRowCapacity = this.getFirstRowCapacity(images);
      images = images.slice(0, firstRowCapacity);
      showToggle = true;
    }

    images = images
      .map((attachment, i) => (
        <ImageAttachment
          key={attachment.id}
          isEditing={this.props.isEditing}
          handleClick={this.handleClickThumbnail(i)}
          removeAttachment={this.props.removeAttachment}
          {...attachment}/>
      ));

    if (showToggle) {
      images.push(
        <a key="show-more-images"
           className="show-more-images fa"
           title="Show more"
           onClick={this.handleExpandImages}></a>
      );
    }

    return images;
  }

  getImageWidth(image) {
    const realWidth = +(image.imageSizes && (
      image.imageSizes.t && image.imageSizes.t.w ||
      image.imageSizes.o && image.imageSizes.o.w
    ));
    return Math.max(realWidth, this.attachmentMinWidth);
  }

  getImagesWidth(images) {
    return images.reduce((acc, item) => {
      const w = this.getImageWidth(item);
      return acc + w + this.attachmentMargins;
    }, 0);
  }

  getContainerWidth() {
    if (this.state.containerWidth) {
      return this.state.containerWidth;
    }
    return 0;
  }

  getFirstRowCapacity(images) {
    const maxWidth = this.getContainerWidth() - this.toggleWidth;
    const margins = this.attachmentMargins;

    let accWidth = 0;
    let capacity = 0;

    for (let i=0; i < images.length; i++) {
      const itemWidth = this.getImageWidth(images[i]);

      if (accWidth + itemWidth + margins < maxWidth) {
        accWidth += itemWidth + margins;
        capacity++;
      } else {
        break;
      }
    }

    return Math.max(capacity, 1);
  }

  getImageLightboxItems(imageList) {
    return imageList.map((attachment, i) => {
      // Check if that's the same image that triggered initial lightbox opening
      const isTrigger = (i === this.state.lightboxIndex && this.lightboxThumbnailElement);

      const thumbnailSrc = (isTrigger ? this.lightboxThumbnailElement.currentSrc : null);
      const thumbnailWidth = (isTrigger ? this.lightboxThumbnailElement.naturalWidth : null);
      const thumbnailHeight = (isTrigger ? this.lightboxThumbnailElement.naturalHeight : null);

      const originalWidth = attachment.imageSizes && attachment.imageSizes.o && attachment.imageSizes.o.w;
      const originalHeight = attachment.imageSizes && attachment.imageSizes.o && attachment.imageSizes.o.h;

      return {
        src: attachment.url,

        // Use the trigger thumbnail as a loading placeholder during "lightbox opening" process
        msrc: thumbnailSrc,

        // If no original size, use thumbnail size temporarily (until original image is loaded)...
        w: originalWidth || thumbnailWidth,
        h: originalHeight || thumbnailHeight,

        // ...and set a reminder to check that original image for actual w and h
        needsSizeUpdate: (!originalWidth || !originalHeight)
      };
    });
  }

  getThumbBounds() {
    return (index) => {
      // If closing lightbox not on the same image we opened it
      if (index !== this.state.lightboxIndex) {
        return null;
      }

      const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
      const rect = this.lightboxThumbnailElement.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top + pageYScroll,
        w: rect.width
      };
    };
  }

  handleLightboxImageLoaded(gallery, index, item) {
    if (item.needsSizeUpdate) {
      const img = new Image();
      img.onload = function() {
        item.needsSizeUpdate = false;
        item.w = this.width;
        item.h = this.height;
        gallery.updateSize(true);
      };
      img.src = item.src;
    }
  }

  handleClickThumbnail(index) {
    return (e) => {
      this.lightboxThumbnailElement = e.target;
      this.setState({
        isLightboxOpen: true,
        lightboxIndex: index
      });
    };
  }

  handleCloseLightbox = () => this.setState({ isLightboxOpen: false });

  handleExpandImages = () => this.setState({ isExpanded: true });

  componentDidMount() {
    this.setState({
      containerWidth: +(this.attachmentsContainer && this.attachmentsContainer.offsetWidth)
    });
  }

  render() {
    const props = this.props;
    const attachments = props.attachments || [];

    const imageList = attachments.filter(attachment => attachment.mediaType === 'image');
    const imageAttachments = this.getImageAttachments(imageList);
    const imageLightboxItems = this.getImageLightboxItems(imageList);

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
      <div className="attachments" ref={this.refAttachmentsContainer}>
        <div className="image-attachments">
          {imageAttachments}
          <PhotoSwipe
            items={imageLightboxItems}
            options={{ ...this.lightboxOptions, index: this.state.lightboxIndex }}
            imageLoadComplete={this.handleLightboxImageLoaded}
            isOpen={this.state.isLightboxOpen}
            onClose={this.handleCloseLightbox}/>
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
