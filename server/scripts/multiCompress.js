const archiver = require("archiver");

const fs = require('fs');
const path = require('path');
const os = require('os');
const cluster = require('cluster');

const compressImage = require('../compressImage');

const folderPath = './public/images'; // Replace with the path to your folder
const compressedFolderPath = './compressed/images';


const numWorkers = os.cpus().length; // Number of worker processes to use (defaults to the number of CPUs)

const compressImages = async () => {
    const files = await fs.promises.readdir(folderPath);
    const startTimer = process.hrtime();

    if (cluster.isMaster) {
        // Master process
        setupMasterProcess(files.length, startTimer);
    } else {
        // Worker process
        setupWorkerProcess(files);
    }
};

const setupMasterProcess = (numFiles, startTimer) => {
    // Create a worker for each CPU core
    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    let compressionsCompleted = 0;

    cluster.on('message', (worker, message) => {
        if (message.event === 'compressionCompleted') {
            compressionsCompleted++;

            const {file, originalSize, compressedSize} = message;
            logCompressionResult(file, originalSize, compressedSize);

            if (compressionsCompleted === numFiles) {
                createArchive(startTimer);
            }
        }
    });
};

const setupWorkerProcess = async (files) => {
    const workerId = cluster.worker.id;
    const filesPerWorker = Math.ceil(files.length / numWorkers);
    const startIdx = (workerId - 1) * filesPerWorker;
    const endIdx = Math.min(startIdx + filesPerWorker, files.length);

    for (let i = startIdx; i < endIdx; i++) {
        const file = files[i];

        if (path.extname(file) === '.png') {
            const filePath = path.join(folderPath, file);
            const compressedFilePath = path.join(compressedFolderPath, file);

            try {
                await compressImage(filePath, compressedFilePath, compressedFolderPath);
            } catch (error) {
                console.error(`Error compressing image: ${file}`, error);
            }
        }
    }

    process.disconnect();
};

const createArchive = (startTimer) => {
    const archivePath = './compressed-folder.zip';
    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', {
        zlib: {level: 9}, // Compression level (0-9)
    });

    archive.pipe(output);

    // Append the compressed images folder to the archive
    archive.directory(compressedFolderPath, false);

    archive.finalize();
    output.on('close', () => {
        console.log('Archive created successfully:', archivePath);
        calculateAndDisplayCompressionStats(archivePath, startTimer);
    })
}

const logCompressionResult = (file, originalSize, compressedSize) => {
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;
    console.log(`Compressed ${file} (${originalSize}B to ${compressedSize}B) - ${compressionRatio.toFixed(2)}% compression`);
};

const calculateAndDisplayCompressionStats = (archivePath, startTimer) => {
    const uncompressedFolderSize = calculateFolderSizeSync(folderPath);
    const compressedArchiveSize = fs.statSync(archivePath).size;
    const compressionRatio = ((uncompressedFolderSize - compressedArchiveSize) / uncompressedFolderSize) * 100;

    const endTimer = process.hrtime(startTimer);
    const executionTime = (endTimer[0] * 1000) + (endTimer[1] / 1000000); // Convert to milliseconds

    console.log(`Compressed (${uncompressedFolderSize}B to ${compressedArchiveSize}B) - ${compressionRatio.toFixed(2)}% compression`);
    console.log(`Execution time: ${executionTime.toFixed(2)}ms`);
};

const calculateFolderSize = async (folderPath) => {
    let totalSize = 0;

    const files = await fs.promises.readdir(folderPath);

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stats = await fs.promises.stat(filePath);
        if (stats.isFile()) {
            totalSize += stats.size;
        } else if (stats.isDirectory()) {
            totalSize += await calculateFolderSize(filePath);
        }
    }

    return totalSize;
};

const calculateFolderSizeSync = (folderPath) => {
    let totalSize = 0;

    const files = fs.readdirSync(folderPath);

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
            totalSize += stats.size;
        } else if (stats.isDirectory()) {
            totalSize += calculateFolderSizeSync(filePath);
        }
    }

    return totalSize;
};

compressImages().catch((error) => {
    console.error('Error compressing images:', error);
});
