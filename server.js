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

        const statusCode = resolveStatusCode(error);
        const friendlyMessage = getFriendlyGeminiError(error);

        return res.status(statusCode).json({
            success:false,
            error: friendlyMessage
        })
    }
})


const resolveStatusCode = (error) => {
    const rawStatus = error?.status ?? error?.code ?? error?.statusCode ?? error?.error?.status ?? error?.error?.code;
    const numericStatus = Number(rawStatus);

    if (Number.isFinite(numericStatus)) {
        return numericStatus;
    }

    const normalized = String(rawStatus ?? "").toUpperCase();

    if (normalized.includes("UNAVAILABLE") || normalized.includes("SERVICE_UNAVAILABLE")) return 503;
    if (normalized.includes("RESOURCE_EXHAUSTED") || normalized.includes("RATE_LIMIT")) return 429;
    if (normalized.includes("INVALID_ARGUMENT") || normalized.includes("BAD_REQUEST")) return 400;
    if (normalized.includes("UNAUTHENTICATED") || normalized.includes("PERMISSION_DENIED") || normalized.includes("AUTH")) return 401;

    return 500;
};

const getFriendlyGeminiError = (error) => {
    const rawStatus = error?.status ?? error?.code ?? error?.statusCode ?? error?.error?.status ?? error?.error?.code;
    const numericStatus = Number(rawStatus);
    const message = String(error?.message ?? error?.error?.message ?? "").toLowerCase();

    if (
        numericStatus === 503 ||
        String(rawStatus ?? "").toUpperCase().includes("UNAVAILABLE") ||
        message.includes("unavailable") ||
        message.includes("temporarily busy") ||
        message.includes("service unavailable")
    ) {
        return "Gemini is temporarily busy. Please try again in a moment.";
    }

    if (
        numericStatus === 429 ||
        String(rawStatus ?? "").toUpperCase().includes("RESOURCE_EXHAUSTED") ||
        message.includes("rate limit") ||
        message.includes("too many requests")
    ) {
        return "Too many requests right now. Please wait a moment and try again.";
    }

    if (
        numericStatus === 400 ||
        String(rawStatus ?? "").toUpperCase().includes("INVALID_ARGUMENT") ||
        message.includes("invalid") ||
        message.includes("bad request")
    ) {
        return "Please check your input and try again.";
    }

    if (
        numericStatus === 401 ||
        numericStatus === 403 ||
        String(rawStatus ?? "").toUpperCase().includes("UNAUTHENTICATED") ||
        String(rawStatus ?? "").toUpperCase().includes("PERMISSION_DENIED") ||
        message.includes("unauthorized") ||
        message.includes("forbidden") ||
        message.includes("api key") ||
        message.includes("authentication")
    ) {
        return "There is a problem with the AI service configuration.";
    }

    if (
        numericStatus === 500 ||
        numericStatus === 502 ||
        numericStatus === 504 ||
        message.includes("internal") ||
        message.includes("server error")
    ) {
        return "Something went wrong while generating your idea. Please try again.";
    }

    return "Something went wrong while generating your idea. Please try again.";
};
//! export app for vercel
export default app;