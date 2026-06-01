import type { Metadata } from 'next';
import FAQClient from './FAQClient';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions | DevToolkit',
  description: 'Answers to common questions about DevToolkit — privacy, offline use, tools, data handling, and more.',
};

export default function FAQPage() {
  return <FAQClient />;
}
