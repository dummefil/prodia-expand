import React from 'react';

const ImageContainer = ({ images, openModal }) => {
    return (
        <div id="image-container">
            {images.map((image, index) => (
                <img
                    key={index}
                    src={image}
                    alt=''
                    className="generated-image"
                    onClick={() => openModal(index)}
                />
            ))}
        </div>
    );
};

export default ImageContainer;
