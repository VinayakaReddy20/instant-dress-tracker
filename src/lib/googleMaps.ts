import { Loader } from '@googlemaps/js-api-loader';

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

let loader: Loader | null = null;
let googleMaps: typeof google.maps | null = null;

export const initializeGoogleMaps = async (): Promise<typeof google.maps> => {
  if (googleMaps) {
    return googleMaps;
  }

  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not found. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.');
  }

  if (!loader) {
    loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places'],
    });
  }

  // At this point, loader is guaranteed to be initialized
  const maps = await (loader as Loader & { load: () => Promise<typeof google.maps> }).load();
  googleMaps = maps;
  return maps;
};

// Address validation using Google Maps Places API
export const validateAddress = async (address: string): Promise<boolean> => {
  try {
    const maps = await initializeGoogleMaps();
    const service = new maps.places.PlacesService(document.createElement('div'));

    return new Promise((resolve) => {
      const request = {
        query: address,
        fields: ['formatted_address'],
      };

      service.findPlaceFromQuery(request, (results, status) => {
        if (status === maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  } catch (error) {
    console.error('Address validation error:', error);
    return false;
  }
};

// Get place details for a place ID
export const getPlaceDetails = async (placeId: string): Promise<google.maps.places.PlaceResult | null> => {
  try {
    const maps = await initializeGoogleMaps();
    const service = new maps.places.PlacesService(document.createElement('div'));

    return new Promise((resolve) => {
      const request = {
        placeId: placeId,
        fields: ['formatted_address', 'address_components', 'geometry'],
      };

      service.getDetails(request, (place, status) => {
        if (status === maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Place details error:', error);
    return null;
  }
};

// Extract address components from Google Places result
export const extractAddressComponents = (place: google.maps.places.PlaceResult): {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
} => {
  const components = place.address_components || [];
  const result = {
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
  };

  components.forEach((component) => {
    const types = component.types;

    if (types.includes('street_number') || types.includes('route')) {
      result.street += (result.street ? ' ' : '') + component.long_name;
    } else if (types.includes('locality') || types.includes('administrative_area_level_3')) {
      result.city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      result.state = component.long_name;
    } else if (types.includes('country')) {
      result.country = component.long_name;
    } else if (types.includes('postal_code')) {
      result.postalCode = component.long_name;
    }
  });

  return result;
};

// Extract address components from Geocoding result
export const extractAddressFromGeocode = (geocodeResult: google.maps.GeocoderResult): {
  street: string;
  city: string;
  state: string;
  postalCode: string;
} => {
  const components = geocodeResult.address_components || [];
  const result = {
    street: '',
    city: '',
    state: '',
    postalCode: '',
  };

  components.forEach((component) => {
    const types = component.types;

    if (types.includes('street_number') || types.includes('route')) {
      result.street += (result.street ? ' ' : '') + component.long_name;
    } else if (types.includes('locality') || types.includes('administrative_area_level_3') || types.includes('administrative_area_level_2')) {
      result.city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      result.state = component.long_name;
    } else if (types.includes('postal_code')) {
      result.postalCode = component.long_name;
    }
  });

  return result;
};

// Geocode address to coordinates
export const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const maps = await initializeGoogleMaps();
    const geocoder = new maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            latitude: location.lat(),
            longitude: location.lng(),
          });
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Reverse geocode coordinates to address
export const reverseGeocode = async (latitude: number, longitude: number): Promise<{
  street: string;
  city: string;
  state: string;
  postalCode: string;
} | null> => {
  try {
    console.log('Reverse geocoding coordinates:', latitude, longitude);
    const maps = await initializeGoogleMaps();
    const geocoder = new maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
        console.log('Reverse geocoding status:', status);
        console.log('Reverse geocoding results:', results);

        if (status === maps.GeocoderStatus.OK && results && results[0]) {
          const addressComponents = extractAddressFromGeocode(results[0]);
          console.log('Extracted address components:', addressComponents);
          resolve(addressComponents);
        } else {
          console.warn('Reverse geocoding failed with status:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};
