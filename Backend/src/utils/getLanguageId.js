const axios = require('axios');

const getLanguageId = (language) => {
    const languageId = {
        'c++': 54,
        'java': 62,
        'javascript': 63,
        'python': 71
    }
    return languageId[language.toLowerCase().trim()];

}

const submitBatch = async (submissions) => {
    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            base64_encoded: 'false'
        },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            submissions
        }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);
            if (Array.isArray(response.data)) {
                return response.data;
            }

            if (Array.isArray(response.data?.submissions)) {
                return response.data.submissions;
            }

            throw new Error('Invalid response from Judge0 while submitting batch');
        } catch (error) {
            console.error(error.response?.data || error.message);
            throw error;
        }
    }

    return await fetchData();


}

const waiting = () => new Promise((resolve) => setTimeout(resolve, 1000));

const submitToken = async (resultToken) => {

    const options = {
        method: 'GET',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            tokens: resultToken.join(","),
            base64_encoded: 'false',
            fields: '*'
        },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        },
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);

            return response.data;

        } catch (error) {
            console.error(error.response?.data || error.message);
            throw error;
        }
    }

    while (true) {

        await waiting();

        const result = await fetchData();

        if (!result || !result.submissions) {
            throw new Error('Invalid response from Judge0 while fetching submissions');
        }

        const isResultObtained = result.submissions.every((r) => r.status_id > 2);

        if (isResultObtained) return result.submissions;

    }



}

const getStatus = (status_id) => {
    const status = {
        4: 'Wrong Answer',
        5: 'Time Limit Exceeded',
        6: 'Compilation Error',
        7: 'Runtime Error',
        8: 'Runtime Error',
        9: 'Runtime Error',
        10: 'Runtime Error',
        11: 'Runtime Error',
        12: 'Runtime Error',
        13: 'Runtime Error',
        14: 'Runtime Error',
        

    }
    return status[status_id];

}

module.exports = { getLanguageId, submitBatch, submitToken, getStatus };

//



