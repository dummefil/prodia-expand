import React from 'react';

const Image = ({ image, openModal, setFields }) => {
    const { url, params } = image;
    return <div className="image-container">
        {/*<button className="use-prompt" onClick={setFields}></button>*/}
        <img
            data-json={params.prompt}
            src={url}
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
                    return <Image key={image.url} openModal={() => openModal(index)} image={image}/>;
                })
            }
        </div>
    );
};

export default ImageContainer;
