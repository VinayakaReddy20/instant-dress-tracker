export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationResult {
  coordinates: LocationCoordinates;
  accuracy: number; // accuracy in meters
  timestamp: number;
  source: 'gps' | 'network' | 'unknown';
}

export async function getCurrentLocation(): Promise<LocationCoordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      resolve(null);
      return;
    }

    // Try high accuracy first (better for mobile devices)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location accuracy:', position.coords.accuracy, 'meters');
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn('High accuracy location failed:', error.message);

        // Fallback to lower accuracy for laptops/desktops
        // Increased timeout for network-based positioning
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Fallback location accuracy:', position.coords.accuracy, 'meters');
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (fallbackError) => {
            console.error('Fallback location also failed:', fallbackError.message);
            resolve(null);
          },
          {
            enableHighAccuracy: false, // Use network-based positioning
            timeout: 30000, // 30 seconds for laptops
            maximumAge: 300000, // Accept positions up to 5 minutes old
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 20000, // 20 seconds for initial attempt
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
  const R = 6371;
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

// Enhanced location function with accuracy information
export async function getCurrentLocationWithAccuracy(): Promise<LocationResult | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      resolve(null);
      return;
    }

    // Try high accuracy first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          source: 'gps',
        });
      },
      (error) => {
        console.warn('High accuracy location failed:', error.message);

        // Fallback to network-based positioning
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              coordinates: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
              source: 'network',
            });
          },
          (fallbackError) => {
            console.error('Fallback location also failed:', fallbackError.message);
            resolve(null);
          },
          {
            enableHighAccuracy: false,
            timeout: 30000,
            maximumAge: 300000,
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  });
}

// Check if location accuracy is acceptable
export function isLocationAccurate(accuracy: number, maxAcceptableAccuracy: number = 100): boolean {
  return accuracy <= maxAcceptableAccuracy;
}

// Get accuracy description for user feedback
export function getAccuracyDescription(accuracy: number): string {
  if (accuracy <= 10) return 'Excellent (GPS)';
  if (accuracy <= 50) return 'Good (GPS)';
  if (accuracy <= 100) return 'Fair (GPS/Network)';
  if (accuracy <= 500) return 'Poor (Network)';
  return 'Very Poor (IP-based)';
}

// Enhanced reverse geocoding with better error handling
export async function reverseGeocodeWithFallback(lat: number, lon: number): Promise<{
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
}> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.address) {
      return {
        address: null,
        city: null,
        state: null,
        country: null,
        postalCode: null,
      };
    }

    const address = data.address;
    const fullAddress = data.display_name || null;

    return {
      address: fullAddress,
      city: address.city || address.town || address.village || address.hamlet || null,
      state: address.state || address.region || null,
      country: address.country || null,
      postalCode: address.postcode || null,
    };
  } catch (error) {
    console.error('Enhanced reverse geocoding error:', error);
    return {
      address: null,
      city: null,
      state: null,
      country: null,
      postalCode: null,
    };
  }
}
