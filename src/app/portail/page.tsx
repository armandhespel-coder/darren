import type { Metadata } from 'next';
import PortalClient from './portal-client';

export const metadata: Metadata = {
  title: 'Portail Prestataire — Connect Event',
  description: "Gérez votre profil prestataire : photos, disponibilités et informations.",
};

export default function PortailPage() {
  return <PortalClient />;
}
