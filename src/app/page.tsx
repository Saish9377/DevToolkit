import type { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';

export const metadata: Metadata = {
  title: 'DevToolkit — Not just tools. Understand your code.',
  description: '68+ premium developer tools with Explain Mode, Visual Tree View, Tool Chaining, Smart History, and PWA support. 100% client-side and private.',
};

export default function Page() {
  return <HomePage />;
}
