import React, { useState, useEffect } from 'react';
import { Map, MapMarker} from 'react-kakao-maps-sdk';

//부모로부터 받은 selectedLocation props 추가
const LocationPicker = ({ onLocationSelect, selectedLocation }) => {
    const [markerPosition, setMarkerPosition] = useState(selectedLocation);

    //부모로부터 받은 selectedLocation이 변경될 때 마다 마커 위치를 업데이트
    useEffect(() => {
        setMarkerPosition(selectedLocation);
    }, [selectedLocation]);

    const handleMapClick = (_map, mouseEvent) => {
        const latlng = mouseEvent.latLng;
        const newPosition = {
            lat: latlng.getLat(),
            lng: latlng.getLng(),
        };

        setMarkerPosition(newPosition);
        onLocationSelect(newPosition);
    };

    return(
        <Map
            center={markerPosition || { lat:35.179554, lng: 129.075642 }}
            style={{ width: '100%', height: '300px', border: '1px solid #ddd' }}
            level={3}
            onClick={handleMapClick}
        >
           {markerPosition && <MapMarker position={markerPosition} />}
        </Map>
    );
};

export default LocationPicker;