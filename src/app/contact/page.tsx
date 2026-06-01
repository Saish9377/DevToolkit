import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact | DevToolkit',
  description: 'Get in touch with the DevToolkit team — report bugs, suggest features, or just say hello.',
};

export default function ContactPage() {
  return <ContactClient />;
}
