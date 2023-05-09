const path = require('path');
const fs = require('fs');
const compressImage = async (file, outputFile, outputFolder) => {
    const {default: imagemin} = await import('imagemin');
    const {default: imageminPngquant} = await import('imagemin-pngquant');

    const originalSize = fs.statSync(file).size;

    await imagemin([file], {
        destination: outputFolder,
        plugins: [
            imageminPngquant.default({
                strip: true,
                quality: [0.5, 1.0], // Adjust the quality range as per your requirement
            }),
        ],
    });

    const compressedSize = fs.statSync(outputFile).size;

    return {
        file: path.basename(file),
        originalSize,
        compressedSize,
    }
};

module.exports = compressImage;
