const {promisify} = require('util');

const generatePositiveValues = async (count, db) => {
    const getAsync = promisify(db.get).bind(db);
    const allAsync = promisify(db.all).bind(db);

    const result = await getAsync(`SELECT COUNT(*) as count FROM positive_values`);

    if (result.count === 0) {
        throw new Error('No positive values found in the database');
    }

    const randomIndices = new Set();
    while (randomIndices.size < count && randomIndices.size < result.count) {
        randomIndices.add(Math.floor(Math.random() * result.count));
    }

    const randomValues = await allAsync(`SELECT value FROM positive_values WHERE id IN (${Array.from(randomIndices).join(',')})`);
    return randomValues.map(row => row.value).join(', ');
};

module.exports = generatePositiveValues;
