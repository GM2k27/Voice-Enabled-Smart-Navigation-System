// "use client";

// import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// const mapContainerStyle = {
//     width: "100%",
//     height: "100%",
//     borderRadius: "16px",
// };

// export default function GoogleMapView({ coords, label }) {
//     const defaultCenter = coords || { lat: 20, lng: 0 };

//     return (
//         <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
//             <GoogleMap
//                 mapContainerStyle={mapContainerStyle}
//                 center={defaultCenter}
//                 zoom={coords ? 14 : 2}
//             >
//                 {coords && <Marker position={coords} label={label || ""} />}
//             </GoogleMap>
//         </LoadScript>
//     );
// }
