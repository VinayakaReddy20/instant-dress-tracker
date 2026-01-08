export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationError {
  code: number;
  message: string;
  userMessage: string;
}

export async function getCurrentLocation(): Promise<LocationCoordinates | LocationError> {
  console.log('getCurrentLocation called');
  console.log('navigator.geolocation available:', !!navigator.geolocation);
  console.log('window.location.protocol:', window.location.protocol);

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      const error: LocationError = {
        code: -1,
        message: 'Geolocation is not supported by this browser.',
        userMessage: 'Geolocation is not supported by your browser. Please use a different device or browser.'
      };
      console.error('Error getting location:', error.message);
      resolve(error);
      return;
    }

    // Check if we're on HTTPS (required for geolocation in modern browsers)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const error: LocationError = {
        code: -2,
        message: 'Geolocation requires HTTPS.',
        userMessage: 'Location access requires a secure connection (HTTPS). Please access the site over HTTPS.'
      };
      console.error('Error getting location:', error.message);
      resolve(error);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let userMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            userMessage = 'Location access denied. Please enable location permissions in your browser settings and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            userMessage = 'Location information is unavailable. Please check your GPS settings and try again.';
            break;
          case error.TIMEOUT:
            userMessage = 'Location request timed out. Please try again or check your internet connection.';
            break;
          default:
            userMessage = 'Unable to get your location. Please check your browser permissions and try again.';
            break;
        }

        const locationError: LocationError = {
          code: error.code,
          message: error.message,
          userMessage
        };

        console.error('Error getting location:', error);
        resolve(locationError);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // Increased from 10 to 30 seconds
        maximumAge: 0,
      }
    );
  });
}

export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.address?.city || data.address?.town || data.address?.county || null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance.toFixed(1)}km`;
  }
}

export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    // Using Nominatim (OpenStreetMap) for free reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'InstantDressTracker/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();

    if (data && data.display_name) {
      return data.display_name;
    }

    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}
