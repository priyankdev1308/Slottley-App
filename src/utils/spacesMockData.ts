import { images } from '../../assets/images';
import { SpaceCardData } from '../components/SpaceCard';

// TODO: replace with the real "Space Near You" / "Featured spaces" API
// responses — real listings will bring their own photo per item.
export const NEAR_YOU: SpaceCardData[] = [
  { id: 'n1', title: 'Premium Nail Desk', location: 'Manchester — Didsbury', price: '£105', period: 'month', image: images.dummy1 },
  { id: 'n2', title: 'Luxury Beauty Room', location: 'Nottingham — Wollaton', price: '£15', period: 'hour', image: images.dummy2 },
  { id: 'n3', title: 'Modern Barbershop', location: 'London — Shoreditch', price: '£65', period: 'week', image: images.dummy3 },
];

export const FEATURED: SpaceCardData[] = [
  { id: 'f1', title: 'Luxury Beauty Room', location: 'London — Bayswater', price: '£45', period: 'day', image: images.dummy2 },
  { id: 'f2', title: 'Modern Barber Chair', location: 'London — Shoreditch', price: '£85', period: 'week', image: images.dummy3 },
  { id: 'f3', title: 'Premium Nail Desk', location: 'Manchester — Didsbury', price: '£105', period: 'month', image: images.dummy1 },
  { id: 'f4', title: 'Clinic Place', location: 'London — Bayswater', price: '£55', period: 'day', image: images.dummy2 },
  { id: 'f5', title: 'Private Aesthetic Room', location: 'London — Bayswater', price: '£60', period: 'day', image: images.dummy3 },
  { id: 'f6', title: 'Wellness Treatment Room', location: 'Nottingham — Wollaton', price: '£75', period: 'day', image: images.dummy1 },
];
