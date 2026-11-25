'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../lib/store';
export default function Home() {
 const { session, ready } = useApp(); const router = useRouter();
 useEffect(() => { if (ready) router.replace(!session ? '/login' : session.role === 'accountant' ? '/accountant' : session.role === 'employee' ? '/employee' : '/admin'); }, [ready, session, router]);
 return <div className="startup">Opening AQUA HRMS...</div>;
}
