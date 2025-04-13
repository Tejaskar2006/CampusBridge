const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: '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',
    baseURL: 'https://api.openai.com/v1'
});

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('Sending request to OpenAI...');
        console.log('Message:', message);

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful AI assistant for students.'
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 500,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        console.log('OpenAI Response:', completion);

        if (!completion.choices || completion.choices.length === 0) {
            throw new Error('No response received from OpenAI');
        }

        res.json({ 
            response: completion.choices[0].message.content,
            status: 'success'
        });

    } catch (error) {
        console.error('Detailed Error:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });

        res.status(500).json({ 
            error: 'Failed to get response from AI',
            details: error.message,
            status: 'error'
        });
    }
});

module.exports = router;