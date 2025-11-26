// "use client";

// import { useCallback, useEffect, useRef, useState } from "react";
// import { api } from "@/lib/api";
// import toast, { Toaster } from "react-hot-toast";
// import Layout from "@/components/Layout";
// import GoogleMapView from "@/components/GoogleMapView";

// const navigationPatterns = ["navigate to", "go to", "take me to", "directions to"];

// function normalizeText(str = "") {
//   return str
//     .toLowerCase()
//     .replace(/[^\w\s]/g, "")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// async function extractLocation(spokenRaw = "") {
//   const spoken = spokenRaw.toLowerCase().trim();
//   const normalizedSpoken = normalizeText(spoken);

//   // -------------------------------
//   // 1) MAGIC PHRASE (Backend)
//   // -------------------------------
//   try {
//     const result = await api.findPhraseMatch({ phrase: spoken });

//     if (result?.status === "success" && result?.data?.target_location_id) {
//       const loc = await api.getLocation(result.data.target_location_id);

//       if (loc.status === "success") {
//         return {
//           type: "magic_phrase",
//           location: loc.data,
//           label: loc.data.location_name,
//         };
//       }
//     }
//   } catch (err) {
//     console.error("Magic match error:", err);
//   }

//   // -------------------------------
//   // 2) Saved Location Match (exact)
//   // -------------------------------
//   try {
//     const loc = await api.findLocationByName(spoken);
//     if (loc?.id) {
//       return { type: "saved_location", location: loc, label: loc.location_name };
//     }

//     const locNorm = await api.findLocationByName(normalizedSpoken);
//     if (locNorm?.id) {
//       return { type: "saved_location", location: locNorm, label: locNorm.location_name };
//     }
//   } catch (err) {}

//   // -------------------------------
//   // 3) Partial DB Search
//   // -------------------------------
//   try {
//     const search = await api.searchLocations(spoken);
//     if (Array.isArray(search?.data) && search.data.length > 0) {
//       return { type: "saved_location", location: search.data[0], label: search.data[0].location_name };
//     }
//   } catch (err) {}

//   // -------------------------------
//   // 4) “navigate to ___”
//   // -------------------------------
//   for (const pattern of navigationPatterns) {
//     if (spoken.includes(pattern)) {
//       const destination = spoken.slice(spoken.indexOf(pattern) + pattern.length).trim();
//       if (destination.length > 0) {
//         return { type: "geocode", query: destination, label: destination };
//       }
//     }
//   }

//   return null;
// }

// // ---------------------------------
// // Simple Geocode Fallback
// // ---------------------------------
// async function geocodeLocation(query) {
//   const res = await fetch(
//     `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
//   );
//   const [data] = await res.json();
//   if (!data) throw new Error("No location found");

//   return {
//     lat: parseFloat(data.lat),
//     lon: parseFloat(data.lon),
//     label: data.display_name || query,
//   };
// }

// export default function Page() {
//   const [status, setStatus] = useState("Say something…");
//   const [transcript, setTranscript] = useState("");
//   const [coords, setCoords] = useState(null);
//   const [label, setLabel] = useState("");
//   const [isListening, setIsListening] = useState(false);
//   const [hasSupport, setHasSupport] = useState(true);

//   const recognitionRef = useRef(null);

//   // ---------------------------------
//   // SHOW LOCATION ON GOOGLE MAP
//   // ---------------------------------
//   const showLocationOnMap = useCallback(async (data) => {
//     try {
//       let lat, lon, name;

//       if (data.type === "magic_phrase" || data.type === "saved_location") {
//         lat = Number(data.location.latitude);
//         lon = Number(data.location.longitude);
//         name = data.label;
//       } else {
//         const geo = await geocodeLocation(data.query);
//         lat = geo.lat;
//         lon = geo.lon;
//         name = geo.label;
//       }

//       setCoords({ lat, lng: lon });
//       setLabel(name);

//       setStatus(`Showing: ${name}`);
//       toast.success(`Navigating to ${name}`);
//     } catch (err) {
//       console.error(err);
//       toast.error("Unable to display location");
//     }
//   }, []);

//   // ---------------------------------
//   // SPEECH RECOGNIZER SETUP
//   // ---------------------------------
//   const setupSpeech = useCallback(() => {
//     if (recognitionRef.current) return true;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

//     if (!SpeechRecognition) {
//       setHasSupport(false);
//       setStatus("Speech API not supported");
//       return false;
//     }

//     const rec = new SpeechRecognition();
//     rec.lang = "en-US";
//     rec.interimResults = false;

//     rec.onstart = () => setIsListening(true);
//     rec.onend = () => setIsListening(false);

//     rec.onresult = async (e) => {
//       const spoken = e.results[0][0].transcript;
//       setTranscript(spoken);

//       setStatus("Processing...");
//       const loc = await extractLocation(spoken);
//       if (loc) showLocationOnMap(loc);
//       else toast.error("Location not recognized");
//     };

//     recognitionRef.current = rec;
//     return true;
//   }, [showLocationOnMap]);

//   const toggleListening = () => {
//     if (!setupSpeech()) return;

//     const rec = recognitionRef.current;
//     if (isListening) rec.stop();
//     else rec.start();
//   };

//   return (
//     <Layout>
//       <Toaster />
//       <div className="flex min-h-screen items-center justify-center p-10">
//         <div className="glass-panel max-w-4xl w-full p-10 rounded-[32px] text-white space-y-8">

//           <header className="text-center space-y-2">
//             <h1 className="text-3xl font-bold">Voice Navigation Assistant</h1>
//             <p className="text-slate-300">Tap the mic and speak a command</p>
//           </header>

//           <section>
//             <p className="text-xs uppercase tracking-widest text-slate-400">Status</p>
//             <div className="mt-2 rounded-xl bg-slate-900/70 px-4 py-2">
//               {status}
//             </div>
//           </section>

//           <section>
//             <p className="text-xs uppercase tracking-widest text-slate-400">Transcript</p>
//             <div className="mt-2 rounded-xl bg-slate-900/70 px-4 py-2 min-h-[70px]">
//               {transcript || "Your words will appear here..."}
//             </div>
//           </section>

//           <section className="h-80 rounded-2xl overflow-hidden border border-white/10">
//             <GoogleMapView coords={coords} label={label} />
//           </section>

//           <div className="flex flex-col items-center">
//             <button
//               onClick={toggleListening}
//               className="h-20 w-20 rounded-full bg-emerald-400 text-black font-semibold shadow-lg"
//             >
//               {isListening ? "Stop" : "Start"}
//             </button>
//             <p className="text-slate-400 mt-2">
//               {isListening ? "Listening..." : "Tap to speak"}
//             </p>
//           </div>

//         </div>
//       </div>
//     </Layout>
//   );
// }

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";
import Layout from "@/components/Layout";

const navigationPatterns = ["navigate to", "go to", "take me to", "directions to"];

function normalizeText(str = "") {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function extractLocation(spokenRaw = "") {
  const spoken = spokenRaw.toLowerCase().trim();
  const normalizedSpoken = normalizeText(spoken);

  // -------------------------------
  // 1) MAGIC PHRASE CHECK (Corrected)
  // -------------------------------
  try {
    const phraseMatch = await api.findPhraseMatch({ phrase: spoken });
    if (
      phraseMatch &&
      phraseMatch.status === "success" &&
      phraseMatch.data &&
      phraseMatch.data.target_location_id
    ) {
      const loc = await api.getLocation(phraseMatch.data.target_location_id);
      if (loc && loc.status === "success" && loc.data) {
        return {
          type: "magic_phrase",
          location: loc.data,
          label: loc.data.location_name,
        };
      }
    }
  } catch (error) {
    console.error("Magic phrase check error:", error);
  }

  // -------------------------------
  // 2) Exact saved location match
  // -------------------------------
  try {
    const loc = await api.findLocationByName(spoken);
    if (loc && loc.id) {
      return { type: "saved_location", location: loc, label: loc.location_name };
    }

    const locNorm = await api.findLocationByName(normalizedSpoken);
    if (locNorm && locNorm.id) {
      return { type: "saved_location", location: locNorm, label: locNorm.location_name };
    }
  } catch (err) { }

  // -------------------------------
  // 3) Partial search in DB (keyword search)
  // -------------------------------
  try {
    const res = await api.searchLocations(spoken);
    if (Array.isArray(res?.data) && res.data.length > 0) {
      return { type: "saved_location", location: res.data[0], label: res.data[0].location_name };
    }
  } catch (err) { }

  // -------------------------------
  // 4) Check for phrases like “navigate to X”
  // -------------------------------
  for (const p of navigationPatterns) {
    if (spoken.includes(p)) {
      const destination = spoken.slice(spoken.indexOf(p) + p.length).trim();
      if (destination.length > 0) {
        return { type: "geocode", query: destination, label: destination };
      }
    }
  }

  return null;
}

async function geocodeLocation(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&limit=1`;

  const res = await fetch(url);
  const [data] = await res.json();

  if (!data) throw new Error("Location not found");

  return {
    lat: parseFloat(data.lat),
    lon: parseFloat(data.lon),
    label: data.display_name || query,
  };
}

export default function Page() {
  const [status, setStatus] = useState("Say something…");
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [hasSupport, setHasSupport] = useState(true);

  const recognitionRef = useRef(null);

  // MAP
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

  const initializeMap = useCallback(async () => {
    if (mapRef.current) return true;

    const L = await import("leaflet");
    leafletRef.current = L;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapRef.current);
    return true;
  }, []);

  const showLocationOnMap = useCallback(
    async (locData) => {
      try {
        await initializeMap();

        let lat, lon, label;

        if (locData.type === "magic_phrase" || locData.type === "saved_location") {
          const l = locData.location;
          lat = Number(l.latitude);
          lon = Number(l.longitude);
          label = l.location_name;
        } else {
          const geo = await geocodeLocation(locData.query);
          lat = geo.lat;
          lon = geo.lon;
          label = geo.label;
        }

        if (!isFinite(lat) || !isFinite(lon)) throw new Error("Invalid coordinates");

        mapRef.current.setView([lat, lon], 14);

        if (!markerRef.current)
          markerRef.current = leafletRef.current.marker([lat, lon]).addTo(mapRef.current);
        else markerRef.current.setLatLng([lat, lon]);

        markerRef.current.bindPopup(`<b>${label}</b>`).openPopup();

        setStatus(`Showing: ${label}`);
        toast.success(`Navigating to ${label}`);
      } catch (err) {
        console.error(err);
        toast.error("Cannot show location");
      }
    },
    [initializeMap]
  );

  // SPEECH
  const ensureRecognizer = useCallback(() => {
    if (recognitionRef.current) return true;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSupport(false);
      setStatus("Speech recognition not supported");
      return false;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);

    rec.onresult = async (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      setStatus("Processing…");

      const loc = await extractLocation(text);
      if (loc) showLocationOnMap(loc);
      else toast.error("Location not recognized");
    };

    recognitionRef.current = rec;
    return true;
  }, [showLocationOnMap]);

  const toggleListening = () => {
    if (!ensureRecognizer()) return;

    const rec = recognitionRef.current;
    if (isListening) rec.stop();
    else rec.start();
  };

  return (
    <Layout>
      <Toaster />
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="glass-panel w-full max-w-4xl rounded-[32px] p-10 text-white space-y-6">
          <h1 className="text-3xl font-bold">Voice Navigation Assistant</h1>

          <p>Status: {status}</p>
          <p>Transcript: {transcript}</p>

          <div
            ref={mapContainerRef}
            className="h-80 w-full border border-white/20 rounded-xl bg-slate-900"
          />

          <button
            onClick={toggleListening}
            className="px-6 py-3 bg-emerald-500 rounded-xl text-black font-bold"
          >
            {isListening ? "Stop" : "Start Listening"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
