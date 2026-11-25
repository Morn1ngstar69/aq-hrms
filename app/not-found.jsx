import Link from 'next/link';
export default function NotFound(){return <main className="error-screen"><section className="card"><div className="card-body"><p className="eyebrow">AQUA HRMS</p><h1>Page not found</h1><p>This workspace page does not exist.</p><Link href="/" className="btn" style={{display:'inline-block',textDecoration:'none'}}>Return to HRMS</Link></div></section></main>}
