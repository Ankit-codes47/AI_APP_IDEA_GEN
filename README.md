# SparkIdeas

SparkIdeas is an AI-powered app idea generator. Describe a niche, audience, or problem and Google Gemini creates a structured app blueprint with features, a value proposition, monetization ideas, and technology suggestions.

## Features

- Generate app concepts from a custom prompt
- Use quick-start prompts for wellness, food, travel, and fashion ideas
- Receive structured output from Google Gemini
- Copy generated ideas to the clipboard

## Requirements

- Node.js 18 or newer
- A Google Gemini API key

## Local setup

1. Install dependencies:

	```bash
	npm install
	```

2. Create a `.env` file in the project root:

	```env
	GEMINI_API_KEY=your_gemini_api_key
	```

3. Start the server:

	```bash
	npm start
	```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

The server uses the `PORT` environment variable when it is provided; otherwise it defaults to `3000`.

## API

### `POST /generate`

Request body:

```json
{
  "customPrompt": "A fitness app for remote workers who sit all day"
}
```

Successful responses contain the generated idea:

```json
{
  "success": true,
  "idea": "..."
}
```

An empty prompt returns `400`. Gemini or server errors return `500`.

## Deployment

The project includes a `vercel.json` configuration for deployment to Vercel. Add `GEMINI_API_KEY` as a Vercel project environment variable, then deploy with the Vercel CLI or by importing the repository into Vercel.

## Available scripts

- `npm start` - start the Express server