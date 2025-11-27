"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";
import Layout from "@/components/Layout";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// ----------------------------
// Text Normalizer
// ----------------------------
function normalizeText(str = "") {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const navigationPatterns = ["navigate to", "go to", "take me to", "directions to"];

// ----------------------------
// Extract Location
// ----------------------------
async function extractLocation(spokenRaw = "") {
  const spoken = spokenRaw.toLowerCase().trim();
  const normalized = normalizeText(spoken);

  // 1) Magic Phrase
  try {
    const phrase = await api.findPhraseMatch({ phrase: normalized });
    if (phrase?.status === "success" && phrase.data?.target_location_id) {
      const loc = await api.getLocation(phrase.data.target_location_id);
      if (loc?.status === "success" && loc.data) {
        return { type: "saved_location", location: loc.data };
      }
    }
  } catch { }

  // 2) Exact Saved
  try {
    const found = await api.findLocationByName(normalized);
    if (found?.status === "success" && found.data) {
      return { type: "saved_location", location: found.data };
    }
  } catch { }

  // 3) Partial in DB
  try {
    const res = await api.searchLocations(normalized);
    if (res?.status === "success" && res.data.length > 0) {
      return { type: "saved_location", location: res.data[0] };
    }
  } catch { }

  // 4) Navigation phrase “navigate to X”
  for (const p of navigationPatterns) {
    if (normalized.includes(p)) {
      const q = normalized.replace(p, "").trim();
      if (q.length > 1) return { type: "geocode", query: q };
    }
  }

  // 5) Zoom
  if (normalized.includes("zoom in")) return { type: "zoom_in" };
  if (normalized.includes("zoom out")) return { type: "zoom_out" };

  return null;
}

// ----------------------------
// Geocode (Nominatim)
// ----------------------------
async function geocodeLocation(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  const res = await fetch(url);
  const [data] = await res.json();
  if (!data) throw new Error("Location not found");
  return { lat: parseFloat(data.lat), lon: parseFloat(data.lon), label: data.display_name };
}

// =====================================================================
// MAIN PAGE COMPONENT
// =====================================================================
export default function Page() {
  const [status, setStatus] = useState("Say something...");
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [aiActive, setAiActive] = useState(false);

  const recognitionRef = useRef(null);
  const aiRecRef = useRef(null);
  const navWasActiveRef = useRef(false);

  // Map refs
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

  // ----------------------------
  // Initialize MapTiler MapLibre
  // ----------------------------
  const initializeMap = useCallback(() => {
    if (mapRef.current) return;

    if (!mapContainerRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=5QVLIfOu3xcqUN4biCB2`,
      center: [77.5, 13],
      zoom: 4,
      pitch: 45,
      bearing: 10,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");
  }, []);

  // Load map on page load
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // ----------------------------
  // Show Location on Map
  // ----------------------------
  const showLocationOnMap = useCallback(
    async (locData) => {
      try {
        await initializeMap();

        // ---- ZOOM IN / ZOOM OUT ----
        if (locData.type === "zoom_in") {
          mapRef.current.zoomIn();
          toast.success("Zoomed In");
          return;
        }
        if (locData.type === "zoom_out") {
          mapRef.current.zoomOut();
          toast.success("Zoomed Out");
          return;
        }

        // ---- NAVIGATION ----
        let lat, lon, label;

        if (locData.type === "saved_location") {
          lat = Number(locData.location.latitude);
          lon = Number(locData.location.longitude);
          label = locData.location.location_name;
        } else {
          const geo = await geocodeLocation(locData.query);
          lat = geo.lat;
          lon = geo.lon;
          label = geo.label;
        }

        if (!isFinite(lat) || !isFinite(lon)) throw new Error("Invalid coordinates");

        // MOVE MAP
        mapRef.current.flyTo({
          center: [lon, lat],
          zoom: 15,
          speed: 1.2,
          pitch: 45,
        });

        // MARKER
        if (markerRef.current) {
          markerRef.current.remove();
        }
        markerRef.current = new maplibregl.Marker().setLngLat([lon, lat]).addTo(mapRef.current);

        setStatus(`Showing: ${label}`);
        toast.success(`Navigating to ${label}`);
      } catch (err) {
        console.error(err);
        toast.error("Cannot show location");
      }
    },
    [initializeMap]
  );

  // ----------------------------
  // Navigation Speech Recognizer
  // ----------------------------
  const ensureRecognizer = useCallback(() => {
    if (recognitionRef.current) return true;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setStatus("Speech recognition not supported");
      return false;
    }

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);

    rec.onresult = async (e) => {
      if (aiActive) return;

      const text = e.results[0][0].transcript;
      setTranscript(text);
      setStatus("Processing...");

      const loc = await extractLocation(text);
      if (loc) showLocationOnMap(loc);
      else toast.error("Location not recognized");
    };

    recognitionRef.current = rec;
    return true;
  }, [aiActive, showLocationOnMap]);

  const toggleListening = () => {
    if (!ensureRecognizer()) return;

    const rec = recognitionRef.current;
    if (isListening) rec.stop();
    else rec.start();
  };

  // =====================================================================
  // AI ASSISTANT (Ask AI)
  // =====================================================================
  useEffect(() => {
    const btn = document.getElementById("ai-btn");

    function showPopup(text) {
      const box = document.getElementById("ai-popup");
      box.innerText = text;
      box.style.display = "block";
      setTimeout(() => (box.style.display = "none"), 7000);
    }

    async function askAI(prompt) {
      try {
        const res = await fetch("http://localhost:5000/ai/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        return data.reply || "I couldn't understand.";
      } catch {
        return "AI server not responding.";
      }
    }

    function speak(text) {
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = "en-GB";
      window.speechSynthesis.speak(msg);
    }

    function startAI() {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return;

      navWasActiveRef.current = isListening;
      if (recognitionRef.current && isListening) recognitionRef.current.stop();

      setAiActive(true);
      setStatus("AI Listening...");

      const rec = new SR();
      aiRecRef.current = rec;
      rec.lang = "en-US";
      rec.interimResults = false;

      rec.onresult = async (e) => {
        const text = e.results[0][0].transcript;
        setTranscript(text);

        const reply = await askAI(text);
        showPopup(reply);
        speak(reply);

        setAiActive(false);
        setStatus("Say something…");

        if (navWasActiveRef.current) {
          recognitionRef.current.start();
        }
      };

      rec.start();
    }

    if (btn) btn.onclick = startAI;

    return () => {
      if (btn) btn.onclick = null;
    };
  }, [isListening]);

  // =====================================================================
  // RENDER UI
  // =====================================================================
  return (
    <Layout>
      <Toaster />

      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="glass-panel w-full max-w-4xl rounded-[32px] p-10 text-white space-y-6">
          <h1 className="text-3xl font-bold">Voice Navigation Assistant</h1>

          <p>Status: {status}</p>
          <p>Transcript: {transcript}</p>

          <div ref={mapContainerRef} className="h-80 w-full rounded-xl bg-slate-900" />

          <div className="flex gap-4">
            <button
              onClick={toggleListening}
              className="px-6 py-3 bg-emerald-500 rounded-xl text-black font-bold"
            >
              {isListening ? "Stop" : "Start Listening"}
            </button>

            <div
              id="ai-btn"
              className="px-6 py-3 bg-blue-500 rounded-xl cursor-pointer"
            >
              🎤 Ask AI
            </div>
          </div>
        </div>
      </div>

      <div
        id="ai-popup"
        style={{
          display: "none",
          position: "fixed",
          bottom: "80px",
          right: "20px",
          background: "white",
          padding: "14px",
          borderRadius: "12px",
          maxWidth: "250px",
          color: "black",
          fontSize: "14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          zIndex: 9999,
        }}
      />
    </Layout>
  );
}
