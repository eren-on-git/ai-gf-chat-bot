import { GoogleGenAI } from '@google/genai';

/**
 * Vercel Serverless Function to securely handle chat requests and communicate with the Gemini API.
 * * @param {object} request - The incoming HTTP request object.
 * @param {object} response - The outgoing HTTP response object.
 */
export default async function handler(request, response) {

    if (request.method !== 'POST') {
        return response.status(405).json({ 
            error: 'Method Not Allowed. Please use POST.',
            message: 'Nilanjana says: "Eta ki kor6is? Tui ki amake avoid kor6is? Method ta thik kor!" 😠'
        });
    }


    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY is missing! Check .env (local) or Vercel Environment Variables (deployment).");
        return response.status(500).json({ 
            error: 'Server Misconfiguration: API Key missing.',
            message: 'Nilanjana says: "Rahul! Ki kor6is? Amar chabi kothay! 😡 Check your environment variable!"'
        });
    }

    try {
        const ai = new GoogleGenAI(apiKey); 


        const { contents, systemInstruction, model = 'gemini-2.5-flash' } = request.body || {};
        

        if (!contents || !systemInstruction) {
            return response.status(400).json({ 
                error: 'Missing required parameters: contents (chat history) or systemInstruction.',
                message: 'Nilanjana says: "Kichu details missing, Rahul. Ki bolte chaichis clear kore bol! 🤔"' 
            });
        }
        

        const geminiResponse = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                
                systemInstruction: { parts: [{ text: systemInstruction }] }, 
                temperature: 0.8,
                maxOutputTokens: 800,
                
            }
        });
        
    
        const botText = geminiResponse.text || "Jani na, Rahul... tui i bole de 🤔 (No text response received from model.)";

        response.status(200).json({ response: botText });

    } catch (error) {
    
        console.error("Gemini API Error:", error);
        response.status(500).json({ 
            error: 'An internal server error occurred while contacting the AI model.',
            message: `Nilanjana says: "Oh no! Server issue ho6ee 🥺. (${error.message || 'Unknown error'})"`
        });
    }
}
