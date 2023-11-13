const logger = require('./logger');
const generatePositiveValues = require("./generatePositiveValues");
const db = require("./database");
const {request, imageUrl, POST_METHOD} = require("./api/request");
const submitGeneration = async ({prompt, negative, cfgScale, steps, seed}) => {
    try {
        const body = {
            prompt,
            negative_prompt: negative,
            model: 'anythingV5_PrtRE.safetensors [893e49b9]',
            steps: parseInt(steps),
            cfg_scale: parseInt(cfgScale),
            seed: parseInt(seed),
            sampler: 'DPM++ 2M Karras',
            upscale: true
        }

        const path = `/sd/generate`;
        logger.info(`Submitting generation request for url: ${path}`);
        const data = await request(path, { method: POST_METHOD, body });
        console.log(data);
        logger.info(`Generation request submitted with jobId: ${data.job}`);
        return data;
    } catch (error) {
        logger.info(`Error submitting generation request: ${error}`);
        throw error;
    }
};

const sleep = (seconds) => {
    return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1000);
    });
};

const checkGeneration = async (jobId,options) => {
    try {
        const path = `/job/${jobId}`;
        logger.info(`Checking generation status for jobId: ${jobId}`);
        const data = await request(path);

        const { status } = data;

        if (status === 'failed') {
            logger.info(`Job ${jobId} failed. Resubmitting.`);
            const { job } = await submitGeneration(options);
            return checkGeneration(job);
        }

        if (status !== 'succeeded') {
            const time = 0.5;
            logger.info(`Job ${jobId} still queued. Sleeping for ${time} seconds and retrying.`);
            await sleep(time);
            return checkGeneration(jobId);
        }

        logger.info(`Job ${jobId} completed with status: ${data.status}`);
        return data;
    } catch (error) {
        logger.info(`Error checking generation status for jobId ${jobId}: ${error}`);
        throw error;
    }
};

const start = async (count, args) => {
    const promises = [];
    const startTime = performance.now();

    for (let i = 0; i < count; i++) {
        const prompt = '(best quality), (highres:1.1),' + (args.prompt ? args.prompt : await generatePositiveValues(20, db));
        const options = {
            ...args,
            prompt,
        }

        promises.push(submitGeneration(options)
            .then(({job}) => checkGeneration(job, options))
            .then((data) => ({ ...data }))
        );
    }

    logger.info(`Started ${count} generation jobs.`);
    const completedJobs = await Promise.all(promises);

    const endTime = performance.now();
    const timeElapsed = endTime - startTime;
    logger.info(`${completedJobs.length} generation jobs completed.`);
    logger.info(`${timeElapsed} time elapsed.`);

    return completedJobs.map((data) => {
        return {
            ...data
        };
    })
};

module.exports = start;
