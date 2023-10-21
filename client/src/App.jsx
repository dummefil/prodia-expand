import React, { useState, useEffect, useCallback } from 'react';
import Modal from "./Modal";
import { fetchImages, fetchLatestImages } from "./imageRequests";
import FormComponent from './FormComponent';
import ImageContainer from './ImageContainer';
import './index.scss';

const defaultFields = {
    positive: "",
    negative: "canvas frame, cartoon, 3d, ((disfigured)), ((bad art)), ((deformed)),((extra limbs)),((close up)),((b&w)), weird colors, blurry, (((duplicate))), ((morbid)), ((mutilated)), [out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), out of frame, ugly, extra limbs, (bad anatomy), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), mutated hands, (fused fingers), (too many fingers), (((long neck))), Photoshop, video game, ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, mutation, mutated, extra limbs, extra legs, extra arms, disfigured, deformed, cross-eye, body out of frame, blurry, bad art, bad anatomy, 3d render",
    cfgScale: "20",
    steps: "30",
    seed: "-1",
    count: 4,
    loop: false
}

function useFormFields(initialState) {
    const [fields, setValues] = useState(initialState);

    const setFields = (data) => {
        if (!data.target) {
            setValues(data)
            return;
        }

        const { target} = data;
        const  { id } = target;
        const value = target.getAttribute && target.getAttribute('type') === 'checkbox' ? target.checked : target.value;

        setValues({
            ...fields,
            [id]: value,
        });
    };

    const resetFields = () => {
        setValues(initialState);
    };

    return [fields, setFields, resetFields];
}


const ImageApp = () => {
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [modalWindowOpen, setModalWindowOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(null);
    const [lastFields, setLastFields] = useState({});
    const [fields, setFields, resetFields] = useFormFields(defaultFields);
    const [ prompt, setPrompt ] = useState();
    const request = useCallback(async () => {
        const startTime = performance.now();
        try {
            setIsLoading(true);
            const data = await fetchImages(fields);
            if (data.error) {
                setError(data.error);
                return;
            }

            setImages((prevImages) => [...prevImages, ...data.images]);
            setLastFields({
                ...fields,
                positive: fields.positive || data.prompt,
            });
            if (data.prompt) {
                setPrompt(data.prompt);
            }

        } catch (error) {
            setError(error.message);
        } finally {
            const endTime = performance.now();
            const timeElapsed = endTime - startTime;
            setTimer(timeElapsed);
            setIsLoading(false);
        }
    }, [fields]);


    const openModal = useCallback((index) => {
        setCurrentImageIndex(index);
        setModalWindowOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setCurrentImageIndex(null);
        setModalWindowOpen(false);
    }, []);

    const repeatLastFields = useCallback((event) => {
        event.stopPropagation();
        event.preventDefault();
        setFields({ target: { id: 'positive', value: lastFields.positive || '' } });
    }, [request, setFields, lastFields.positive]);

    const handleSubmit = useCallback(        (event) => {
            event.preventDefault();
            request();
        },
        [request]
    );

    const handleResetFilters = useCallback(
        (event) => {
            event.preventDefault();
            resetFields();
        },
        [resetFields, request]
    );

    useEffect(() => {
        if (!isLoading && fields.loop) {
            request();
        }
    }, [isLoading, fields.loop, request]);

    return (
        <div className="main-container">
            <FormComponent
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                repeatLastFields={repeatLastFields}
                resetFields={handleResetFilters}
                timer={timer}
                error={error}
                fields={fields}
                setFields={setFields}
            />
            <ImageContainer images={images} openModal={openModal} setFields={()=> setFields({...fields, positive: prompt })} />
            {modalWindowOpen && <Modal closeModal={closeModal} images={images} index={currentImageIndex} autoScroll={fields.loop} />}
        </div>
    );
};

export default ImageApp;
