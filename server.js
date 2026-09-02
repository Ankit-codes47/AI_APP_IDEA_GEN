import express from "express";
import {GoogleGenAI} from "@google/genai";
import * as dotenv from "dotenv";
import path from "path";
import {fileURLToPath} from "url";
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

//*PORT
const PORT = process.env.PORT || 3000
//*Authenticate with Gemini
const ai = new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
})

//*Pass incoming data
app.use(express.json())

//*Routes

app.get("/", (req, res) => {
    res.render("index");
});

//*Route:Generate app idea
app.post("/generate", async(req, res) => {
    try {
        //*Extract the custom prompt from the request body
        const {customPrompt} =req.body
        //*Validations
        if(!customPrompt || !customPrompt.trim()){
            //return 400
            return res.status(400).json({
                success:false,
                error: "Please provide a prompt"
            })
        }
        //Build the complete prompt vy adding structure instruction to user's input
        const prompt = `${customPrompt}
        Please provide a comprehensive app idea with the following detail 
        1.App Name (creative and catchy)
        2.One-line Description
        3.Target Audience 
        4.Core features (list 3-5 key features)
        5.Unique Value Proposition
        6.Monetization Strategy
        7.Technology Stack Suggestions

        Format the response in a clear, structured way.
        `
        //call Gemini API to generate the app idea
        const response = await ai.models.generateContent({
            model:"gemini-3.5-flash-lite",

            contents: prompt,

            config:{
                systemInstruction:"You are a creative product manager and entrepreneur who generates innovative, practicle, and unique app ideas. Your ideas are well-thought-out and consider market viability. Always provide detailed, structured responses.",
                    
                temperature:0.9,
                maxOutputTokens:1000
            }
        })
        const idea = response.text;
        return res.json({
            success:true,
            idea
        })
    } catch (error) {
        console.error("Gemini API Error:", error);
        return res.status(500).json({
            success:false,
            error: error.message
        })
    }
})



//! export app for vercel
export default app;