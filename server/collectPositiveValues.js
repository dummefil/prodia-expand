const { promisify } = require('util');
async function collectPositiveValues(positive, db) {
    try {
        const positiveValues = positive.split(',').map(value => value.trim());

        const prepare = promisify(db.prepare).bind(db);

        console.log(prepare);

        const stmt = await prepare('INSERT INTO positive_values (value) VALUES (?)');
        const run = promisify(stmt.run).bind(stmt);
        for (const value of positiveValues) {
            await run(value);
        }

        const finalize = promisify(stmt.finalize).bind(stmt);
        await finalize();

        console.log('Positive values updated successfully');
    } catch (error) {
        console.error('Error updating positive values:', error);
    }
}

module.exports = collectPositiveValues;
