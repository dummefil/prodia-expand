const logger = require('./logger');
const submitGeneration = async (prompt, negativePrompt, cfg, steps, seed) => {
    try {
        const params = new URLSearchParams({
            new: true,
            prompt: '(masterpiece:1.3), (best quality), (highres:1.1), ((absurdres)), (incredibly detailed), nude ' + prompt,
            model: 'anything-v4.5-pruned.ckpt [65745d25]',
            negative_prompt: negativePrompt,
            steps,
            cfg,
            seed,
            sampler: 'Euler',
            aspect_ratio: 'landscape',
            upscale: '2'
        });

        const url = `https://api.prodia.com/generate?${params.toString()}`;

        logger.info(`Submitting generation request for url: ${url}`);
        const response = await fetch(url);
        const data = await response.json();
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

const checkGeneration = async (jobId) => {
    try {
        const url = `https://api.prodia.com/job/${jobId}`;
        logger.info(`Checking generation status for jobId: ${jobId}`);
        const response = await fetch(url);
        const data = await response.json();

        const {status} = data;

        if (status === 'failed') {
            logger.info(`Job ${jobId} failed. Resubmitting.`);
            const {job} = await submitGeneration();
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

const start = async (count, ...args) => {
    const promises = [];
    const startTime = performance.now();

    for (let i = 0; i < count; i++) {
        promises.push(submitGeneration(...args).then(({job}) => checkGeneration(job)));
    }

    logger.info(`Started ${count} generation jobs.`);
    const completedJobs = await Promise.all(promises);

    const endTime = performance.now();
    const timeElapsed = endTime - startTime;
    logger.info(`${completedJobs.length} generation jobs completed.`);
    logger.info(`${timeElapsed} time elapsed.`);

    return completedJobs.map((data) => {
        return `https://images.prodia.xyz/${data.job}.png`;
    })
};

module.exports = start;
