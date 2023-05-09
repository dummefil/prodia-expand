import React, {useState, useEffect, useCallback} from 'react';
import Modal from "./Modal";
import {fetchImages, fetchLatestImages} from "./imageRequests";

export default function ImageApp() {
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [loopEnabled, setLoopEnabled] = useState(false);
    const [modalWindowOpen, setModalWindowOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(null);
    const [debug, setDebug] = useState(null);

    useEffect(() => {
        console.log(images);
    }, [images])

    const openModal = useCallback(
        (index) => {
            setCurrentImageIndex(index);
            setModalWindowOpen(true);
        },
        []
    );

    const closeModal = useCallback(() => {
        setCurrentImageIndex(null);
        setModalWindowOpen(false);
    }, []);


    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const settings = Object.fromEntries(formData.entries());
        setIsLoading(true);
        const startTime = performance.now();
        const data = await fetchImages(settings);
        if (data.error) {
            setError(data.error)
            return;
        }

        const endTime = performance.now();
        const timeElapsed = endTime - startTime;
        setTimer(timeElapsed);
        setImages(prevImages => [...prevImages, ...data.images]);
        setIsLoading(false);
        setDebug(data);

        if (loopEnabled) {
            handleSubmit(event);
        }
    };

    const [count, setCount] = useState(4);

    return (
        <div className="main-container">
            <div className="form-container">
                <form id="settings-form" onSubmit={handleSubmit}>
                    <label htmlFor="positive">Positive:</label>
                    <textarea id="positive" name="positive"></textarea>
                    <label htmlFor="negative">Negative:</label>
                    <input type="text" id="negative" name="negative"
                           defaultValue="canvas frame, cartoon, 3d, ((disfigured)), ((bad art)), ((deformed)),((extra limbs)),((close up)),((b&w)), weird colors, blurry, (((duplicate))), ((morbid)), ((mutilated)), [out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), out of frame, ugly, extra limbs, (bad anatomy), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), mutated hands, (fused fingers), (too many fingers), (((long neck))), Photoshop, video game, ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, mutation, mutated, extra limbs, extra legs, extra arms, disfigured, deformed, cross-eye, body out of frame, blurry, bad art, bad anatomy, 3d render
"/>
                    <label htmlFor="cfgScale">CFG Scale:</label>
                    <input type="text" id="cfgScale" name="cfgScale" defaultValue="20" max="20"/>
                    <label htmlFor="steps">Steps:</label>
                    <input type="text" id="steps" name="steps" defaultValue="30" max="30"/>
                    <label htmlFor="seed">Seed:</label>
                    <input type="text" id="seed" name="seed" defaultValue="-1"/>
                    <label htmlFor="count">Instances:</label>
                    <input type="number" id="count" name="count" min="1" defaultValue={count} onChange={(event) => setCount(event.target.value)}/>
                    <label>
                        <input type="checkbox" name="loop" id="loop-checkbox"
                               onChange={() => setLoopEnabled(previousValue => !previousValue)}/>
                        Enable Loop
                    </label>
                    <button type="submit" id="generate-button" disabled={isLoading}>
                        {isLoading ? 'Generating...' : 'Fetch Images'}
                    </button>
                    <span id="timer">{timer > 0 && `Last: ${timer}|${timer / count}`}</span>
                    {error && <div id="error-container"><p className="error-message">{error}</p></div>}
                    <br/>
                    <br/>
                    <pre>{JSON.stringify(debug, null, 4)}</pre>
                </form>
            </div>
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
            {modalWindowOpen && <Modal closeModal={closeModal} images={images} index={currentImageIndex}/>}
        </div>
    );
}
