const { promisify } = require('util');

const INSERT_HISTORY_QUERY = `
  INSERT INTO history(prompt, negativePrompt, created_at, cfgScale, steps, seed, model) 
  VALUES (?, ?, datetime('now'), ?, ?, ?, ?)
`;

const INSERT_IMAGE_QUERY = `
  INSERT INTO images(path, created_at, history_id)
  VALUES (?, datetime('now'), ?)
`;

const SELECT_HISTORY_QUERY = `
    SELECT id
    FROM history
    WHERE prompt = ? 
        AND negativePrompt = ?
        AND cfgScale = ? 
        AND steps = ? 
        AND seed = ? 
        AND model = ?
`;

const insertHistory = (db, historyData) => {
    const selectParams = [...Object.values(historyData)];
    const insertParams = [...selectParams];

    return new Promise((resolve, reject) => {
        db.get(SELECT_HISTORY_QUERY, selectParams, (err, row) => {
            if (err) return reject(err);
            if (row) return resolve(row.id);

            db.run(INSERT_HISTORY_QUERY, insertParams, function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    });
};

const insertImage = async (db, imageData, history_id) => {
    const run = promisify(db.run).bind(db);
    await run(INSERT_IMAGE_QUERY, [...Object.values(imageData), history_id]);
};


const createHistoryWithImage = async (db, historyData, image) => {
    try {
        const history_id = await insertHistory(db, historyData);
        await insertImage(db, {image}, history_id);

        console.log(`History inserted successfully.`);
    } catch (error) {
        console.error('Error inserting history:', error);
    }
};
const createHistoryWithImages = async (db, historyData, images) => {
    try {
        const history_id = await insertHistory(db, historyData);
        for (let image of images) {
            await insertImage(db, {image}, history_id);
        }

        console.log(`History and images inserted successfully.`);
    } catch (error) {
        console.error('Error inserting inserting history:', error);
    }
};

module.exports = {createHistoryWithImage, createHistoryWithImages};
