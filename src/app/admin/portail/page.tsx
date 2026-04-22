import type { Metadata } from 'next';
import PortalClient from './portal-client';

export const metadata: Metadata = {
  title: 'Portail Prestataire — Admin Connect Event',
};

export default function AdminPortailPage() {
  return <PortalClient />;
}
