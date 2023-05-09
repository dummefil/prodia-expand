const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const folderPath = './public/images'; // Replace with your folder path

function calculateMD5Hash(filePath) {
    const data = fs.readFileSync(filePath);
    const hash = crypto.createHash('md5').update(data).digest('hex');
    return hash;
}

function removeDuplicates(folderPath) {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading folder:', err);
            return;
        }

        const fileHashes = new Map();
        files.forEach((file) => {
            const filePath = path.join(folderPath, file);
            const fileHash = calculateMD5Hash(filePath);

            if (fileHashes.has(fileHash)) {
                console.log(`Removing duplicate: ${filePath}`);
                fs.unlinkSync(filePath);
            } else {
                fileHashes.set(fileHash, filePath);
            }
        });

        console.log('Finished cleaning duplicates.');
    });
}

removeDuplicates(folderPath);
