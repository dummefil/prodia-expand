import React from 'react';

const Image = ({ image, openModal, setFields }) => {
    const { imageUrl } = image;
    return <div className="image-container">
        {/*<button className="use-prompt" onClick={setFields}></button>*/}
        <img
            // data-json={params.prompt}
            src={imageUrl}
            className="generated-image"
            onClick={openModal}
        />
    </div>
}

const ImageContainer = ({ images, openModal, setFields }) => {

    return (
        <div id="image-container">
            {
                images.map((image, index) => {
                    return <Image key={image.imageUrl} openModal={() => openModal(index)} image={image}/>;
                })
            }
        </div>
    );
};

export default ImageContainer;
