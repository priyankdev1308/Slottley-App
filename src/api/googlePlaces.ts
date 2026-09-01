import { GOOGLE_MAP_PLACES_KEY } from '@env';

const AUTOCOMPLETE_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

export interface PlacePrediction {
  placeId: string;
  description: string;
}

export interface PlaceDetailsResult {
  formattedAddress: string;
  streetAddress?: string;
  areaTown?: string;
  postCode?: string;
  latitude: number;
  longitude: number;
}

interface AddressComponent {
  long_name: string;
  types: string[];
}

const findComponent = (components: AddressComponent[], type: string) =>
  components.find(c => c.types.includes(type))?.long_name;

export const fetchPlacePredictions = async (input: string): Promise<PlacePrediction[]> => {
  if (!input.trim() || !GOOGLE_MAP_PLACES_KEY) return [];

  const params = new URLSearchParams({
    input,
    key: GOOGLE_MAP_PLACES_KEY,
  });

  const response = await fetch(`${AUTOCOMPLETE_URL}?${params.toString()}`);
  const json = await response.json();

  if (json.status !== 'OK') return [];

  return (json.predictions ?? []).map((prediction: { place_id: string; description: string }) => ({
    placeId: prediction.place_id,
    description: prediction.description,
  }));
};

export const fetchPlaceDetails = async (placeId: string): Promise<PlaceDetailsResult | null> => {
  if (!GOOGLE_MAP_PLACES_KEY) return null;

  const params = new URLSearchParams({
    place_id: placeId,
    key: GOOGLE_MAP_PLACES_KEY,
    fields: 'formatted_address,geometry,address_component',
  });

  const response = await fetch(`${DETAILS_URL}?${params.toString()}`);
  const json = await response.json();

  if (json.status !== 'OK' || !json.result) return null;

  const { result } = json;
  const components: AddressComponent[] = result.address_components ?? [];
  const streetNumber = findComponent(components, 'street_number');
  const route = findComponent(components, 'route');
  const streetAddress = [streetNumber, route].filter(Boolean).join(' ') || undefined;

  const lat = result.geometry?.location?.lat;
  const lng = result.geometry?.location?.lng;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;

  return {
    formattedAddress: result.formatted_address,
    streetAddress,
    areaTown: findComponent(components, 'postal_town') || findComponent(components, 'locality'),
    postCode: findComponent(components, 'postal_code'),
    latitude: lat,
    longitude: lng,
  };
};
