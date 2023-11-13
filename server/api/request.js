import axios from 'axios'

export const apiUrl = 'https://api.prodia.com/v1';
export const GET_METHOD = 'GET';
export const POST_METHOD = 'POST';

const getModels =  async () => {
    const data = await request(`${apiUrl}/models`);
    return data.json()
}

const upscale = () => {
    const path = '/upscale';
    const body = {
        "resize": 2,
        "imageUrl": "https://images.prodia.xyz/56192f0a-73d5-4016-b8ee-5cb8d6662fc1.png",
    }
    const options = {
        method: POST_METHOD,
        body,
    }
    return request(path, options)
}

export const request =  async (path, options = {}) => {
    try {

    const url  = `${apiUrl}${path}`;
    const { body, ...rest } = options;

    const init = {
        headers: {
            'X-Prodia-Key': '905054b7-6162-480a-9189-f4f0411e7882',
            'User-Agent': 'ReadMe-API-Explorer',
            'Content-type': 'application/json',
            ...options.headers
        }
    }

    if (options.method === POST_METHOD) {
        const {data} = await axios.post(url, body, init)
        return data;
    }

    const {data} = await axios.get(url, init);
    return data;
    } catch(error) {
        throw new Error(error.message + ' ' + error.name + ' ' + error.code);
    }

}
