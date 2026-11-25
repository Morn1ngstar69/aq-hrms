'use client';
export default function GlobalError({error,reset}){
 return <main className="error-screen"><section className="card"><div className="card-header"><h2>Something went wrong</h2></div><div className="card-body"><p>The current page could not be displayed. Your local demo data has not been intentionally reset.</p><p role="alert" className="message error">{error?.message||'An unexpected problem occurred.'}</p><button className="btn" onClick={reset}>Try Again</button></div></section></main>;
}
