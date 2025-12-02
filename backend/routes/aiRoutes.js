const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const auth = require("../middleware/authMiddleware");

// LLaMA client
const client = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// -------------------------------
// CLEAN TEXT FOR VOICE OUTPUT
// -------------------------------
function cleanForSpeech(text) {
    return text
        .replace(/[*#@{}\[\]\(\)_\-\/\\<>=$%&+`~|]/g, "")  // remove symbols
        .replace(/\s+/g, " ")                               // clean spaces
        .trim();
}

// -------------------------------
// GET LAT/LON from city name
// -------------------------------
async function getCoordinatesFromName(cityName) {
    try {
        const geoUrl =
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`;

        const res = await fetch(geoUrl);
        const data = await res.json();
        if (!data || data.length === 0) return null;

        return {
            name: data[0].display_name,
            lat: data[0].lat,
            lon: data[0].lon
        };
    } catch (err) {
        console.error("Geo Error:", err);
        return null;
    }
}

// -------------------------------
// GET WEATHER using Open-Meteo
// -------------------------------
async function getLiveWeather(lat, lon) {
    try {
        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data || !data.current_weather) return null;

        return {
            temp: data.current_weather.temperature,
            wind: data.current_weather.windspeed,
            code: data.current_weather.weathercode
        };
    } catch (err) {
        console.error("Weather Error:", err);
        return null;
    }
}

// -------------------------------
// MAIN AI ROUTE
// -------------------------------
router.post("/ask", async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.json({ reply: "Please say something." });

        let aiInput = prompt;

        // Detect weather question
        if (prompt.toLowerCase().includes("weather")) {
            const lower = prompt.toLowerCase();

            let city = null;

            if (lower.includes("in ")) {
                city = lower.split("in ")[1].trim();
            } else {
                city = lower.replace("weather", "").trim();
            }

            if (city.length > 0) {
                const geo = await getCoordinatesFromName(city);
                if (geo) {
                    const w = await getLiveWeather(geo.lat, geo.lon);

                    if (w) {
                        aiInput = `
User asked: ${prompt}

Live weather:
Location: ${geo.name}
Temperature: ${w.temp} degrees
Wind Speed: ${w.wind} kilometers per hour

Reply in clean spoken English.
Do NOT use symbols or special characters.
Keep it short unless user says "explain in detail".
            `;
                    }
                }
            }
        }

        // LLaMA Request
        const result = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `
You are a voice assistant.
Always speak in clean English with no symbols:
No *, #, @, /, \\, (, ), [, ], {, }, -, _, =, %, $, & or emojis.
Never use bullet points.
Never speak in markdown.
Give short, simple answers.
Only give long explanations if user says "explain in detail".
          `
                },
                { role: "user", content: aiInput }
            ]
        });

        let reply = result.choices[0].message.content;

        // Clean reply before sending to frontend
        reply = cleanForSpeech(reply);

        res.json({ reply });

    } catch (err) {
        console.error(err);
        return res.json({ reply: "AI assistant is temporarily unavailable." });
    }
});

module.exports = router;
