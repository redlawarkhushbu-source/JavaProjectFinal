import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Locate, 
  Store,
  X
} from 'lucide-react';

/**
 * Web Mercator projection utilities for rendering real map tiles (Satellite, Roadmap, Hybrid)
 */
function projectLatLng(lat, lng, zoom) {
  const scale = 256 * Math.pow(2, zoom);
  const siny = Math.min(Math.max(Math.sin((lat * Math.PI) / 180), -0.9999), 0.9999);
  const x = scale * (0.5 + lng / 360);
  const y = scale * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI));
  return { x, y };
}

function unprojectPoint(x, y, zoom) {
  const scale = 256 * Math.pow(2, zoom);
  const lng = (x / scale - 0.5) * 360;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat, lng };
}

export default function GoogleMapView({ 
  suppliers = [], 
  activeSupplier, 
  onSelectSupplier, 
  lang = 'mr',
  userLocation = null,
  centerCoords = null
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const [googleMap, setGoogleMap] = useState(null);
  const [apiKey, setApiKey] = useState(() => {
    const envKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GOOGLE_MAPS_API_KEY : '';
    const cleanEnvKey = (envKey && typeof envKey === 'string' && !envKey.includes('your_')) ? envKey.trim() : '';
    return (typeof window !== 'undefined' && localStorage.getItem('shet_gmaps_key')) || cleanEnvKey || '';
  });
  
  // View mode: 'satellite' | 'roadmap' | 'hybrid' (Both)
  const [mapType, setMapType] = useState('hybrid'); 
  const [apiLoaded, setApiLoaded] = useState(false);
  const [activePopup, setActivePopup] = useState(activeSupplier || (suppliers.length > 0 ? suppliers[0] : null));
  
  // Interactive Pan & Zoom State for Real Tile Map (Defaults to user location or Mumbai/Maharashtra)
  const initialLat = centerCoords?.lat || userLocation?.lat || (suppliers.length > 0 ? suppliers[0].lat : 19.0760);
  const initialLng = centerCoords?.lng || userLocation?.lng || (suppliers.length > 0 ? suppliers[0].lng : 72.8777);
  const [center, setCenter] = useState({ lat: Number(initialLat), lng: Number(initialLng) });
  const [zoom, setZoom] = useState(12);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 560 });

  // Dynamically measure container dimensions for mobile, tablet & desktop responsiveness
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 800,
          height: containerRef.current.clientHeight || 560
        });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Update center when userLocation or centerCoords changes
  useEffect(() => {
    if (centerCoords && centerCoords.lat && centerCoords.lng) {
      const newLat = Number(centerCoords.lat);
      const newLng = Number(centerCoords.lng);
      setCenter({ lat: newLat, lng: newLng });
      if (googleMap && window.google) {
        googleMap.panTo({ lat: newLat, lng: newLng });
      }
    } else if (userLocation && userLocation.lat && userLocation.lng) {
      const newLat = Number(userLocation.lat);
      const newLng = Number(userLocation.lng);
      setCenter({ lat: newLat, lng: newLng });
      if (googleMap && window.google) {
        googleMap.panTo({ lat: newLat, lng: newLng });
      }
    } else if (suppliers && suppliers.length > 0 && !activeSupplier) {
      setCenter({ lat: suppliers[0].lat, lng: suppliers[0].lng });
    }
  }, [centerCoords?.lat, centerCoords?.lng, userLocation?.lat, userLocation?.lng]);

  // Update center when active supplier changes
  useEffect(() => {
    if (activeSupplier) {
      setActivePopup(activeSupplier);
      setCenter({ lat: activeSupplier.lat, lng: activeSupplier.lng });
      setZoom(14);
      if (googleMap && window.google) {
        googleMap.panTo({ lat: activeSupplier.lat, lng: activeSupplier.lng });
        googleMap.setZoom(14);
      }
    }
  }, [activeSupplier, googleMap]);

  // Load Google Maps API script if API key is provided
  useEffect(() => {
    if (!apiKey) {
      setApiLoaded(false);
      return;
    }

    const scriptId = 'google-maps-script';
    const existingScript = document.getElementById(scriptId);

    if (window.google && window.google.maps) {
      setApiLoaded(true);
      return;
    }

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setApiLoaded(true);
      script.onerror = () => setApiLoaded(false);
      document.head.appendChild(script);
    } else {
      existingScript.onload = () => setApiLoaded(true);
    }
  }, [apiKey]);

  // Initialize Native Google Maps when API key is valid
  useEffect(() => {
    if (!apiLoaded || !window.google || !mapRef.current) return;

    try {
      const gMapType = mapType === 'satellite' ? window.google.maps.MapTypeId.SATELLITE :
                       mapType === 'hybrid' ? window.google.maps.MapTypeId.HYBRID :
                       window.google.maps.MapTypeId.ROADMAP;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: activeSupplier ? { lat: activeSupplier.lat, lng: activeSupplier.lng } : center,
        zoom: zoom,
        mapTypeId: gMapType,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true
      });

      setGoogleMap(mapInstance);

      suppliers.forEach(supplier => {
        const marker = new window.google.maps.Marker({
          position: { lat: supplier.lat, lng: supplier.lng },
          map: mapInstance,
          title: lang === 'mr' ? supplier.nameMr : supplier.name
        });

        marker.addListener('click', () => {
          setActivePopup(supplier);
          if (onSelectSupplier) onSelectSupplier(supplier);
        });
      });
    } catch (e) {
      console.warn('Google Maps native init:', e);
    }
  }, [apiLoaded, suppliers, mapType]);

  // Mouse & Touch pan handlers for interactive tile map
  const handleMouseDown = (e) => {
    if (apiLoaded) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || apiLoaded) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handleMouseUp = () => {
    if (!isDragging || apiLoaded) return;
    setIsDragging(false);
    const dx = dragOffset.x;
    const dy = dragOffset.y;
    setDragOffset({ x: 0, y: 0 });

    const centerPoint = projectLatLng(center.lat, center.lng, zoom);
    const newCenter = unprojectPoint(centerPoint.x - dx, centerPoint.y - dy, zoom);
    setCenter(newCenter);
  };

  // Touch event handlers for phones and tablets
  const handleTouchStart = (e) => {
    if (apiLoaded || !e.touches || e.touches.length === 0) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || apiLoaded || !e.touches || e.touches.length === 0) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handleTouchEnd = () => {
    if (!isDragging || apiLoaded) return;
    setIsDragging(false);
    const dx = dragOffset.x;
    const dy = dragOffset.y;
    setDragOffset({ x: 0, y: 0 });

    const centerPoint = projectLatLng(center.lat, center.lng, zoom);
    const newCenter = unprojectPoint(centerPoint.x - dx, centerPoint.y - dy, zoom);
    setCenter(newCenter);
  };

  const handleWheel = (e) => {
    if (apiLoaded) return;
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom(z => Math.min(18, z + 1));
    } else {
      setZoom(z => Math.max(8, z - 1));
    }
  };

  // Compute visible tiles dynamically using container dimensions
  const getVisibleTiles = useCallback(() => {
    const width = dimensions.width;
    const height = dimensions.height;
    const centerPoint = projectLatLng(center.lat, center.lng, zoom);
    const currentCenter = {
      x: centerPoint.x - dragOffset.x,
      y: centerPoint.y - dragOffset.y
    };

    const minX = Math.floor((currentCenter.x - width / 2) / 256);
    const maxX = Math.floor((currentCenter.x + width / 2) / 256);
    const minY = Math.floor((currentCenter.y - height / 2) / 256);
    const maxY = Math.floor((currentCenter.y + height / 2) / 256);

    const tiles = [];
    const maxCoord = Math.pow(2, zoom);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        if (y >= 0 && y < maxCoord) {
          const wrappedX = ((x % maxCoord) + maxCoord) % maxCoord;
          const left = x * 256 - (currentCenter.x - width / 2);
          const top = y * 256 - (currentCenter.y - height / 2);
          tiles.push({ x: wrappedX, y, z: zoom, left, top, key: `${zoom}-${wrappedX}-${y}` });
        }
      }
    }
    return tiles;
  }, [center, zoom, dragOffset, dimensions]);

  const visibleTiles = getVisibleTiles();
  const centerPoint = projectLatLng(center.lat, center.lng, zoom);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#1E2522',
        overflow: 'hidden',
        borderRadius: '20px',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Top Floating Control Bar */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        zIndex: 25,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none'
      }}>
        {/* Google Maps Brand & Status */}
        <div style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '6px 14px',
          borderRadius: '30px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0,0,0,0.08)'
        }}>
          <span style={{ fontSize: '15px' }}>📍</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1a73e8' }}>
            Google Maps
          </span>
          <span style={{
            fontSize: '0.68rem',
            padding: '2px 8px',
            borderRadius: '10px',
            backgroundColor: '#E8F5E9',
            color: '#2E7D32',
            fontWeight: 700
          }}>
            {apiLoaded ? 'Google SDK' : 'Live High-Res Tiles'}
          </span>
        </div>

        {/* View Mode Switcher: Satellite / Roadmap / Both (Hybrid) */}
        <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto' }}>
          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '3px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
            border: '1px solid rgba(0,0,0,0.08)'
          }}>
            <button
              onClick={() => setMapType('roadmap')}
              style={{
                border: 'none',
                padding: '5px 10px',
                borderRadius: '18px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: mapType === 'roadmap' ? '#1a73e8' : 'transparent',
                color: mapType === 'roadmap' ? '#FFFFFF' : '#3C4043'
              }}
            >
              🗺️ {lang === 'mr' ? 'रस्ता नकाशा' : lang === 'hi' ? 'सड़क नक्शा' : 'Roadmap'}
            </button>
            <button
              onClick={() => setMapType('satellite')}
              style={{
                border: 'none',
                padding: '5px 10px',
                borderRadius: '18px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: mapType === 'satellite' ? '#1a73e8' : 'transparent',
                color: mapType === 'satellite' ? '#FFFFFF' : '#3C4043'
              }}
            >
              🛰️ {lang === 'mr' ? 'उपग्रह' : lang === 'hi' ? 'उपग्रह' : 'Satellite'}
            </button>
            <button
              onClick={() => setMapType('hybrid')}
              style={{
                border: 'none',
                padding: '5px 10px',
                borderRadius: '18px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: mapType === 'hybrid' ? '#1a73e8' : 'transparent',
                color: mapType === 'hybrid' ? '#FFFFFF' : '#3C4043'
              }}
            >
              🌐 {lang === 'mr' ? 'दोन्ही (उपग्रह व रस्ता)' : lang === 'hi' ? 'दोनों (उपग्रह व सड़क)' : 'Both (Hybrid)'}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Zoom & Recenter Controls */}
      <div style={{
        position: 'absolute',
        top: '64px',
        right: '12px',
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <button
          onClick={() => setZoom(z => Math.min(18, z + 1))}
          style={{
            width: '34px',
            height: '34px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            color: '#3c4043'
          }}
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(8, z - 1))}
          style={{
            width: '34px',
            height: '34px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            color: '#3c4043'
          }}
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={() => {
            setCenter({ lat: 18.5204, lng: 73.8567 });
            setZoom(12);
          }}
          style={{
            width: '34px',
            height: '34px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            color: '#1a73e8'
          }}
          title="Recenter to Maharashtra"
        >
          <Locate size={16} />
        </button>
      </div>

      {/* Native Google Maps SDK Container (when key loaded) */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          display: apiLoaded ? 'block' : 'none'
        }}
      />

      {/* High-Resolution Live Tile Engine: Satellite, Roadmap & Both (Hybrid) */}
      {!apiLoaded && (
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}>
          {/* Base Tiles Layer */}
          {visibleTiles.map(tile => {
            const tileUrl = (mapType === 'satellite' || mapType === 'hybrid')
              ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${tile.z}/${tile.y}/${tile.x}`
              : `https://tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`;

            return (
              <img
                key={tile.key}
                src={tileUrl}
                alt=""
                style={{
                  position: 'absolute',
                  left: `${tile.left}px`,
                  top: `${tile.top}px`,
                  width: '256px',
                  height: '256px',
                  pointerEvents: 'none'
                }}
                loading="eager"
              />
            );
          })}

          {/* Hybrid Overlay Tiles (Road labels & borders on top of satellite imagery) */}
          {mapType === 'hybrid' && visibleTiles.map(tile => (
            <img
              key={`overlay-${tile.key}`}
              src={`https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/${tile.z}/${tile.y}/${tile.x}`}
              alt=""
              style={{
                position: 'absolute',
                left: `${tile.left}px`,
                top: `${tile.top}px`,
                width: '256px',
                height: '256px',
                pointerEvents: 'none',
                opacity: 0.95
              }}
              loading="eager"
            />
          ))}

          {/* Interactive Krishi Kendra Supplier Markers */}
          {suppliers.map(s => {
            const supplierPoint = projectLatLng(s.lat, s.lng, zoom);
            const currentCenterPoint = {
              x: centerPoint.x - dragOffset.x,
              y: centerPoint.y - dragOffset.y
            };
            const left = supplierPoint.x - (currentCenterPoint.x - dimensions.width / 2);
            const top = supplierPoint.y - (currentCenterPoint.y - dimensions.height / 2);
            const isSelected = activePopup?.id === s.id;

            return (
              <div
                key={s.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePopup(s);
                  if (onSelectSupplier) onSelectSupplier(s);
                }}
                style={{
                  position: 'absolute',
                  left: `${left}px`,
                  top: `${top}px`,
                  transform: 'translate(-50%, -100%)',
                  zIndex: isSelected ? 20 : 10,
                  cursor: 'pointer'
                }}
              >
                {/* Official Google Maps Styled Pin */}
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{
                    backgroundColor: isSelected ? '#EA4335' : '#2F7D4A',
                    color: 'white',
                    width: isSelected ? '38px' : '32px',
                    height: isSelected ? '38px' : '32px',
                    borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #FFFFFF',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.45)',
                    transition: 'all 0.15s ease'
                  }}>
                    <span style={{ transform: 'rotate(45deg)', fontSize: isSelected ? '17px' : '14px' }}>
                      🏪
                    </span>
                  </div>

                  {/* Marker Label Badge */}
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#202124',
                    whiteSpace: 'nowrap',
                    marginTop: '4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    border: isSelected ? '1.5px solid #EA4335' : '1px solid rgba(0,0,0,0.1)'
                  }}>
                    {lang === 'mr' ? s.nameMr.split(' ')[0] : lang === 'hi' ? (s.nameHi || s.nameMr || s.name).split(' ')[0] : s.name.split(' ')[0]}
                  </div>
                </div>
              </div>
            );
          })}

          {/* User Active Location Pulse Marker */}
          {userLocation && userLocation.lat && userLocation.lng && (() => {
            const userPoint = projectLatLng(Number(userLocation.lat), Number(userLocation.lng), zoom);
            const currentCenterPoint = {
              x: centerPoint.x - dragOffset.x,
              y: centerPoint.y - dragOffset.y
            };
            const left = userPoint.x - (currentCenterPoint.x - dimensions.width / 2);
            const top = userPoint.y - (currentCenterPoint.y - dimensions.height / 2);

            return (
              <div
                style={{
                  position: 'absolute',
                  left: `${left}px`,
                  top: `${top}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 25,
                  pointerEvents: 'none'
                }}
              >
                <div style={{
                  position: 'relative',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    position: 'absolute',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(26, 115, 232, 0.28)',
                    boxShadow: '0 0 12px rgba(26, 115, 232, 0.5)'
                  }} />
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#1a73e8',
                    border: '3px solid #FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.45)'
                  }} />
                </div>
                <div style={{
                  backgroundColor: '#1a73e8',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  marginTop: '2px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  transform: 'translateX(-20%)'
                }}>
                  📍 {lang === 'mr' ? 'आपले शेत / स्थान' : lang === 'hi' ? 'आपका खेत / स्थान' : 'Your Farm / Location'}
                </div>
              </div>
            );
          })()}

          {/* Active Supplier InfoWindow Card (Compact & Dismissible for Mobile/Tablet) */}
          {activePopup && (
            <div 
              className="google-map-popup-card"
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                right: '10px',
                zIndex: 30,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                borderRadius: '14px',
                padding: '10px 14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                border: '1px solid rgba(0,0,0,0.08)',
                backdropFilter: 'blur(10px)',
                maxHeight: '160px',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#12372A', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {lang === 'mr' ? activePopup.nameMr : lang === 'hi' ? (activePopup.nameHi || activePopup.nameMr || activePopup.name) : activePopup.name}
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#2F7D4A', fontWeight: 700 }}>
                    {lang === 'mr' ? activePopup.categoryMr : lang === 'hi' ? (activePopup.categoryHi || activePopup.categoryMr || activePopup.categoryLabel) : activePopup.categoryLabel} • {activePopup.distanceKm} {lang === 'mr' ? 'किमी' : 'km'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    backgroundColor: '#E8F5E9',
                    color: '#137333',
                    padding: '2px 6px',
                    borderRadius: '8px'
                  }}>
                    ⭐ {activePopup.rating}
                  </span>
                  {/* Dismiss Close Button so UI doesn't cover the map */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePopup(null);
                    }}
                    style={{
                      border: 'none',
                      background: 'rgba(0,0,0,0.08)',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#3C4043',
                      padding: 0
                    }}
                    aria-label="Close store details"
                    title="Close"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#5F6368', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <MapPin size={12} color="#EA4335" style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {lang === 'mr' ? activePopup.addressMr : lang === 'hi' ? (activePopup.addressHi || activePopup.addressMr || activePopup.address) : activePopup.address}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activePopup.lat},${activePopup.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    backgroundColor: '#1a73e8',
                    color: 'white',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <Navigation size={13} />
                  <span>{lang === 'mr' ? 'दिशानिर्देश' : 'Directions'}</span>
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${activePopup.lat},${activePopup.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    backgroundColor: '#F1F3F4',
                    color: '#3C4043',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                  title="Open full Google Maps page"
                >
                  <ExternalLink size={13} />
                  <span>{lang === 'mr' ? 'नकाशा' : 'Maps'}</span>
                </a>
              </div>
            </div>
          )}

          {/* Real Map Attribution */}
          <div style={{
            position: 'absolute',
            bottom: '4px',
            right: '8px',
            fontSize: '0.62rem',
            color: (mapType === 'satellite' || mapType === 'hybrid') ? 'rgba(255,255,255,0.8)' : '#5F6368',
            pointerEvents: 'none',
            display: 'flex',
            gap: '6px',
            alignItems: 'center'
          }}>
            <span>Google Maps</span>
            <span>•</span>
            <span>Tiles: {mapType === 'roadmap' ? 'OpenStreetMap' : 'Esri High-Res Satellite'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
