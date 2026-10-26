import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import Awakening from '@/components/features/Awakening';
import SceneErrorBoundary from '@/components/features/SceneErrorBoundary';
import NotFound from '@/pages/NotFound';
const Sanctuary=lazy(()=>import('@/pages/Sanctuary'));
export default function App(){return <BrowserRouter><SceneErrorBoundary><Suspense fallback={<Awakening/>}><Routes><Route path="/" element={<Sanctuary/>}/><Route path="*" element={<NotFound/>}/></Routes></Suspense></SceneErrorBoundary><Toaster theme="dark" position="top-center" toastOptions={{style:{background:'hsl(var(--panel))',border:'1px solid hsl(var(--border))',color:'hsl(var(--foreground))',fontFamily:'Manrope, sans-serif',fontSize:12}}}/></BrowserRouter>;}
