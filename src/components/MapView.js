"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

export default function MapView({ coords, label }) {

    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const routeLayerId = "route-line";

    // --- Draw Route Function ---
    async function drawRoute(start, end) {
        const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data.routes || !data.routes.length) return;

        const route = data.routes[0].geometry;

        if (mapRef.current.getLayer(routeLayerId)) {
            mapRef.current.removeLayer(routeLayerId);
            mapRef.current.removeSource(routeLayerId);
        }

        mapRef.current.addSource(routeLayerId, {
            type: "geojson",
            data: { type: "Feature", geometry: route },
        });

        mapRef.current.addLayer({
            id: routeLayerId,
            type: "line",
            source: routeLayerId,
            paint: {
                "line-color": "#007bff",
                "line-width": 5,
            },
        });
    }

    // --- Main Map Logic ---
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Create map once
        if (!mapRef.current) {
            mapRef.current = new maplibregl.Map({
                container: mapContainerRef.current,
                style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
                center: [77.5946, 12.9716],
                zoom: 5,
            });

            // global reference for zoom voice commands
            window.mapRef = mapRef.current;
        }

        // When coords change → marker + route
        if (coords) {
            const destination = { lat: coords.lat, lng: coords.lng };

            // START = current user location (dynamic)
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const source = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    };

                    // Marker
                    new maplibregl.Marker()
                        .setLngLat([destination.lng, destination.lat])
                        .setPopup(new maplibregl.Popup().setHTML(`<b>${label}</b>`))
                        .addTo(mapRef.current);

                    // Fly to
                    mapRef.current.flyTo({
                        center: [destination.lng, destination.lat],
                        zoom: 14,
                    });

                    // Draw route
                    drawRoute(source, destination);
                },
                () => {
                    console.warn("User location unavailable. Using no route.");
                }
            );
        }
    }, [coords, label]);

    return (
        <div
            ref={mapContainerRef}
            style={{ width: "100%", height: "100%", borderRadius: "16px" }}
        />
    );
}
