const host = 'http://localhost:3001';

export async function fetchLatestImages() {
    const response = await fetch(`${host}/latest`);
    if (!response.ok) {
        throw new Error('Failed to fetch latest images');
    }
    const data = await response.json();
    return data.images.map(imgPath => `${host}${imgPath}`);
}

export async function fetchImages(settings) {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
    };

    const response = await fetch(`${host}/fetch-images`, requestOptions);
    if (!response.ok) {
        throw new Error('Failed to fetch images');
    }
    return await response.json();
}
