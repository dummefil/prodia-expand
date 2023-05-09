import React, {useCallback, useEffect, useState} from 'react';

export default function Modal({ images, index, closeModal }) {

    const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(index);
    const currentImage = images[currentImageIndex];

    const leftButtonDisabled = currentImageIndex === 0;
    const rightButtonDisabled = currentImageIndex === images.length - 1;

    const startAutoScroll = () => {
        setAutoScrollEnabled(true)
    }
    const stopAutoScroll = () => {
        setAutoScrollEnabled(false)
    }

    const changeImage = useCallback((delta) => {
        const newIndex = (currentImageIndex + delta + images.length) % images.length;
        setCurrentImageIndex(newIndex);
    }, [currentImageIndex, images.length]);

    useEffect(() => {
        if (autoScrollEnabled) {
            const interval = setInterval(() => changeImage(1), 2000);
            return () => clearInterval(interval);
        }
    }, [autoScrollEnabled, currentImageIndex, changeImage]);

    return (
        <>
            <div id="modal-overlay" onClick={closeModal}></div>
            <div id="modal-container">
                <div className="modal-content">
                    <button className="modal-close-btn" onClick={closeModal}>
                        X
                    </button>
                    <div className="modal-body">
                        <div className="modal-images-container">
                            <img src={currentImage} alt="" />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="modal-prev-btn" onClick={() => changeImage(-1)} disabled={leftButtonDisabled}>
                            &lt;
                        </button>
                        <button className="modal-next-btn" onClick={() => changeImage(1)} disabled={rightButtonDisabled}>
                            &gt;
                        </button>
                        <button className="modal-autoscroll-btn" onClick={autoScrollEnabled ? stopAutoScroll : startAutoScroll}>
                            {autoScrollEnabled ? 'Stop Auto-Scroll' : 'Start Auto-Scroll'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
