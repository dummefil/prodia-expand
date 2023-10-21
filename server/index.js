const fastify = require('fastify')({logger: true});
const path = require('path');
const fs = require("fs");
const collectPositiveValues = require("./collectPositiveValues");
const generatePositiveValues = require("./generatePositiveValues");
const generateImages = require('./generateImages');
const logger = require('./logger');


const db = require('./database');
const createHistoryWithImages = require("./createHistoryWithImages");

fastify.register(require('@fastify/cors'), (instance) => {
    return (req, callback) => {
        const corsOptions = {
            // This is NOT recommended for production as it enables reflection exploits
            origin: !/^localhost$/m.test(req.headers.origin)
        };

        // callback expects two parameters: error and options
        callback(null, corsOptions)
    }
})

fastify.register(require('@fastify/formbody'));
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
});

fastify.post('/save', async (req, reply) => {
    const {id, positive, negative} = req.body;
    const path = `/public/images/${id}.png`;
    const size = fs.statSync(path).size;

    db.run(
        'INSERT INTO images (id, path, positive, negative, size) VALUES (?, ?, ?, ?, ?)',
        [id, path, positive, negative, size],
        function (err) {
            if (err) {
                console.error(err);
                reply.status(500).send({error: 'Failed to save image metadata.'});
            } else {
                reply.send({success: true});
            }
        }
    );
});



fastify.post('/fetch-images', async (req, reply) => {
    try {
        const {body} = req;
        let {positive} = body;
        const {negative, cfgScale, steps, seed, count} = body;

        if (!positive) {
            positive = await generatePositiveValues(20, db);
        } else {
            await collectPositiveValues(positive, db);
        }

        const errors = [];
        //todo populate errors :)

        positive = '(best quality), (highres:1.1), ' + positive;
        const model =  'anything-v4.5-pruned.ckpt [65745d25]';
        const images = await generateImages(count, positive, negative, cfgScale, steps, seed, model)

        const historyData = {
            prompt: positive,
            negativePrompt: negative,
            cfgScale,
            steps,
            seed,
            model
        }

        await createHistoryWithImages(db, historyData, images);

        reply.type('application/json').code(200);
        return {
            images,
            error: null,
            errors,
            prompt: positive
        };
    } catch (error) {
        console.error('Error generating images:', error);
        return {
            images: [],
            error: error.message,
        }
    }
});

fastify.get('/latest', async (request, reply) => {
    const imagesPath = './public/images';
    const numLatestFiles = 10;

    try {
        const files = await fs.promises.readdir(imagesPath);
        const sortedFiles = files
            .filter((file) => file.endsWith('.png'))
            .sort((a, b) => fs.statSync(`${imagesPath}/${b}`).mtimeMs - fs.statSync(`${imagesPath}/${a}`).mtimeMs)
            .slice(0, numLatestFiles);

        const images = sortedFiles.map((file) => {
            return `/images/${file}`
        });

        reply.send({images});
    } catch (error) {
        logger.error(error);
        reply.status(500).send({error: 'Internal Server Error'});
    }
});

const start = async () => {
    try {
        await fastify.listen({port: 3001, host: '0.0.0.0'});
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
