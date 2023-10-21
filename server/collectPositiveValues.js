async function collectPositiveValues(positive, db) {
    try {
        const positiveValues = positive.split(',').map(value => value.trim());

        const stmt = db.prepare('INSERT OR IGNORE INTO positive_values (value) VALUES (?)');

        for (const value of positiveValues) {
            await new Promise((resolve, reject) => {
                stmt.run(value, (error) => {
                    if (error) {
                        console.error(`Error inserting value '${value}':`, error);
                        resolve();  // Resolve anyway to continue the loop
                    } else {
                        resolve();
                    }
                });
            });
        }

        await new Promise((resolve, reject) => {
            stmt.finalize((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        console.log('Positive values updated successfully');
    } catch (error) {
        console.error('Error updating positive values:', error);
    }
}

module.exports = collectPositiveValues;
