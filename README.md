# SparkIdeas

SparkIdeas is an AI-powered app idea generator built with Express.js and Google Gemini. It helps users describe a niche, audience, or business problem and turns it into a structured app concept with product details, value proposition, monetization ideas, and technology suggestions.

## Project overview

This project includes:

- A Node.js + Express server
- An EJS front end for user input and results
- A Gemini-powered AI generation endpoint
- Quick prompt chips for common niches
- Copy-to-clipboard support for generated app ideas

## Tech stack

- Node.js
- Express.js
- EJS
- Google GenAI SDK
- dotenv
- Vercel-ready deployment config

## Requirements

- Node.js 18 or later
- A Google Gemini API key
- A terminal or command prompt

## Step-by-step setup

1. Open the project folder in your terminal.

2. Install the project dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root if it is not already present.

   Add your Gemini API key there using the variable name `GEMINI_API_KEY`.

   Example structure:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   > Do not commit the `.env` file to version control.

4. Start the app:

   ```bash
   npm start
   ```

5. Open the app in your browser:

   ```text
   http://localhost:3000
   ```

6. Enter an app idea prompt, or use one of the quick example chips, and click Generate App Idea.

7. The app sends your request to the Gemini API and displays a structured blueprint for the app idea.

## How the app works

- The homepage is served by Express and rendered with EJS.
- The frontend sends a POST request to `/generate`.
- The server validates the prompt.
- The prompt is sent to Gemini with system instructions to generate a practical startup-style app concept.
- The response is returned as JSON and rendered into cards on the page.

## API endpoint

### POST /generate

Request body:

```json
{
  "customPrompt": "A fitness app for remote workers who sit all day"
}
```

Successful response:

```json
{
  "success": true,
  "idea": "..."
}
```

Error responses:

- Empty prompt: `400`
- Gemini or server failure: `500`

## Project files

- `server.js` — Express server and Gemini integration
- `views/index.ejs` — main UI layout
- `public/script.js` — frontend logic and result parsing
- `public/style.css` — styling for the interface
- `vercel.json` — Vercel deployment config
- `.env` — local environment variables for API keys

## Deployment

This project is configured for deployment on Vercel via `vercel.json`.

Before deployment, set the environment variable `GEMINI_API_KEY` in your Vercel project settings.

## Scripts

- `npm start` — runs the Express server
- `npm install` — installs dependencies

## Notes

- The app uses `PORT` from the environment if it is provided; otherwise it defaults to `3000`.
- The generated output is designed to look like a complete app blueprint, including app name, audience, features, value proposition, monetization, and technology stack.
- Keep the `.env` file local to your machine and do not expose it in shared or public repositories.