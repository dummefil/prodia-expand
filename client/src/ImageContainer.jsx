import React from 'react';

const Image = ({ image, openModal, setFields }) => {
    return <div className="image-container">
        <button className="use-prompt" onClick={setFields}></button>
        <img
            src={image}
            className="generated-image"
            onClick={openModal}
        />
    </div>
}

const ImageContainer = ({ images, openModal, setFields }) => {
    return (
        <div id="image-container">
            {images.map((image, index) => <Image key={image} openModal={() => openModal(index)} image={image} setFields={setFields}/>)}
        </div>
    );
};

export default ImageContainer;
