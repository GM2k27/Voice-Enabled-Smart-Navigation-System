"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const savedLocations = ["Home", "Office", "Hospital", "Police Station", "Market"];
const navigationPatterns = ["navigate to", "go to", "take me to", "directions to"];

function extractLocation(text = "") {
  const spoken = text.toLowerCase().trim();

  for (const location of savedLocations) {
    if (spoken === location.toLowerCase()) {
      return location;
    }
  }

  for (const pattern of navigationPatterns) {
    if (spoken.startsWith(pattern)) {
      const destination = spoken.slice(pattern.length).trim();
      if (destination.length) {
        return destination;
      }
    }
  }

  return "";
}

const mapDefaults = {
  center: [20, 0],
  zoom: 2,
};

async function geocodeLocation(query) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
  );

  if (!response.ok) {
    throw new Error("Failed to reach geocoding service.");
  }

  const [result] = await response.json();
  if (!result) {
    throw new Error("No matching location found.");
  }

  return {
    lat: parseFloat(result.lat),
    lon: parseFloat(result.lon),
    label: result.display_name || query,
  };
}

const errorMessages = {
  audio_capture: "Error: Unclear audio.",
  network: "Error: Network issues.",
  no_speech: "Error: No speech input.",
  nomatch: "Error: Speech not recognized.",
};

export default function Page() {
  const [status, setStatus] = useState("Idle");
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [hasSupport, setHasSupport] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  const recognitionRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const markerRef = useRef(null);

  const initializeMap = useCallback(async () => {
    if (mapRef.current) return true;
    if (typeof window === "undefined") return false;
    if (!mapContainerRef.current) return false;

    const L = await import("leaflet");
    leafletRef.current = L;

    mapRef.current = L.map(mapContainerRef.current, {
      center: mapDefaults.center,
      zoom: mapDefaults.zoom,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapRef.current);

    setIsMapReady(true);
    return true;
  }, []);

  const showLocationOnMap = useCallback(
    async (query) => {
      try {
        setStatus(`Finding ${query} on the map...`);
        const mapIsReady = await initializeMap();
        if (!mapIsReady || !mapRef.current || !leafletRef.current) {
          throw new Error("Map is not available.");
        }

        const { lat, lon, label } = await geocodeLocation(query);
        const coords = [lat, lon];

        mapRef.current.setView(coords, 14, { animate: true });

        if (!markerRef.current) {
          markerRef.current = leafletRef.current.marker(coords).addTo(mapRef.current);
        } else {
          markerRef.current.setLatLng(coords);
        }

        markerRef.current.bindPopup(label).openPopup();
        setStatus(`Showing: ${label}`);
      } catch (error) {
        setStatus(error.message || "Unable to display that location.");
      }
    },
    [initializeMap]
  );

  const ensureRecognizer = useCallback(() => {
    if (recognitionRef.current) return true;
    if (typeof window === "undefined") return false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSupport(false);
      setStatus("Web Speech API not supported in this browser.");
      return false;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("Listening...");
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatus((prev) => (prev.startsWith("Showing") ? prev : "Processing..."));
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setStatus(errorMessages[event.error] || "An unknown error occurred.");
    };

    recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setTranscript(resultText);

      const location = extractLocation(resultText);

      if (location) {
        showLocationOnMap(location);
      } else {
        setStatus("Location not recognized. Try 'Home' or 'Navigate to London'.");
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [showLocationOnMap]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const toggleListening = useCallback(() => {
    if (!hasSupport) return;
    if (!ensureRecognizer()) return;

    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setStatus("Idle");
      return;
    }

    try {
      recognition.start();
    } catch {
      // start() may throw if invoked before a previous session fully stops
    }
  }, [ensureRecognizer, hasSupport, isListening]);

  const buttonLabel = hasSupport ? (isListening ? "Stop Listening" : "Start Listening") : "Not Supported";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-panel w-full max-w-4xl space-y-8 rounded-[32px] p-10 text-white">
        <header className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-300">Smart Nav</p>
          <h1 className="text-4xl font-semibold">Voice Navigation Assistant</h1>
          <p className="text-sm text-slate-300">Tap the mic and say “Navigate to Market”.</p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Status</p>
            <div className="mt-3 inline-flex items-center rounded-full bg-slate-900/70 px-4 py-2 text-sm font-semibold text-emerald-300">
              <span className="mr-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
              {status}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Transcript</p>
            <div className="mt-3 min-h-[110px] rounded-2xl bg-slate-950/70 p-4 text-left text-base text-white">
              {transcript ? transcript : <span className="text-slate-500">Your transcript will appear here…</span>}
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Live Map</p>
              <p className="text-sm text-slate-300">Powered by Leaflet & OpenStreetMap</p>
            </div>
            <div
              ref={mapContainerRef}
              className="h-80 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50"
            >
              {!isMapReady && (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Preparing map…
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={toggleListening}
            disabled={!hasSupport}
            className={`grid h-28 w-28 place-items-center rounded-full border border-emerald-300/60 bg-gradient-to-br from-emerald-400 to-emerald-500 text-slate-900 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300 disabled:cursor-not-allowed disabled:border-slate-600 disabled:from-slate-600 disabled:to-slate-500 ${
              isListening ? "shadow-[0_0_45px_rgba(16,185,129,0.7)]" : ""
            }`}
          >
            <svg className="h-11 w-11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 16a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v7a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2zM11 19v3h2v-3h-2z" />
            </svg>
          </button>
          <p className="text-sm text-slate-400">{buttonLabel}</p>
        </div>
      </div>
    </main>
  );
}
