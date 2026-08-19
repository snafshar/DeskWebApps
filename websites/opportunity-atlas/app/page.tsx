"use client";

import { useMemo, useState } from "react";

const opportunities = [
  { id: 1, title: "Distributed Systems Doctoral Researcher", university: "Aalto University", country: "Finland", field: "Systems", funding: "Fully funded", deadline: "12 Sep", tags: ["C++", "Cloud", "Networks"] },
  { id: 2, title: "PhD in Trustworthy Machine Learning", university: "KTH Royal Institute of Technology", country: "Sweden", field: "Machine Learning", funding: "Fully funded", deadline: "19 Sep", tags: ["Python", "ML", "Safety"] },
  { id: 3, title: "Researcher in Networked Systems", university: "TU Delft", country: "Netherlands", field: "Networking", funding: "Salaried", deadline: "27 Sep", tags: ["Networks", "Linux", "Measurement"] },
  { id: 4, title: "PhD in Parallel Computing", university: "University of Copenhagen", country: "Denmark", field: "HPC", funding: "Salaried", deadline: "03 Oct", tags: ["C++", "OpenMP", "MPI"] },
  { id: 5, title: "Doctoral Fellow in Algorithm Engineering", university: "University of Oslo", country: "Norway", field: "Algorithms", funding: "Fully funded", deadline: "10 Oct", tags: ["Algorithms", "Optimisation", "C++"] },
  { id: 6, title: "PhD in Sustainable Computing", university: "University of Twente", country: "Netherlands", field: "Systems", funding: "Salaried", deadline: "18 Oct", tags: ["Energy", "Systems", "Data"] },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("All countries");
  const [field, setField] = useState("All fields");
  const [saved, setSaved] = useState<number[]>([4]);
  const filtered = useMemo(() => opportunities.filter((item) => {
    const text = `${item.title} ${item.university} ${item.tags.join(" ")}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (country === "All countries" || item.country === country) && (field === "All fields" || item.field === field);
  }), [query, country, field]);
  const toggleSaved = (id: number) => setSaved((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);

  return <main>
    <header className="topbar"><a className="brand" href="#top"><span>OA</span> Opportunity Atlas</a><nav><a href="#explore">Explore</a><a href="#method">Method</a><a className="saved-link" href="#explore">Shortlist <b>{saved.length}</b></a></nav></header>
    <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow">Research opportunity explorer</p><h1>Find the right research direction, not just another listing.</h1><p className="lead">A focused dashboard for comparing funded computer science research opportunities across Northern Europe.</p><div className="hero-actions"><a className="primary" href="#explore">Explore positions</a><a className="secondary" href="#method">How it works</a></div></div><div className="hero-panel"><div className="orb orb-one"/><div className="orb orb-two"/><p>Current sample</p><strong>6</strong><span>research opportunities</span><div className="mini-stats"><div><b>5</b><small>countries</small></div><div><b>5</b><small>fields</small></div><div><b>100%</b><small>funded</small></div></div></div></section>
    <section className="explore" id="explore"><div className="section-heading"><div><p className="eyebrow">Explore</p><h2>Compare opportunities</h2></div><p>{filtered.length} matching positions</p></div><div className="filters"><label className="search"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Role, university, or skill" /></label><label><span>Country</span><select value={country} onChange={(event) => setCountry(event.target.value)}><option>All countries</option>{[...new Set(opportunities.map((item) => item.country))].map((value) => <option key={value}>{value}</option>)}</select></label><label><span>Field</span><select value={field} onChange={(event) => setField(event.target.value)}><option>All fields</option>{[...new Set(opportunities.map((item) => item.field))].map((value) => <option key={value}>{value}</option>)}</select></label></div><div className="cards">{filtered.map((item) => <article className="card" key={item.id}><div className="card-top"><span className="funding">{item.funding}</span><button onClick={() => toggleSaved(item.id)} aria-label={saved.includes(item.id) ? `Remove ${item.title} from shortlist` : `Save ${item.title} to shortlist`} className={saved.includes(item.id) ? "save active" : "save"}>{saved.includes(item.id) ? "★" : "☆"}</button></div><h3>{item.title}</h3><p className="university">{item.university}</p><div className="meta"><span>{item.country}</span><span>{item.field}</span><span>Deadline {item.deadline}</span></div><div className="tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>)}{!filtered.length && <div className="empty"><h3>No exact match</h3><p>Try clearing one filter or searching for a broader skill.</p></div>}</div></section>
    <section className="method" id="method"><div><p className="eyebrow">A considered workflow</p><h2>From broad search to a defensible shortlist.</h2></div><div className="steps"><article><b>01</b><h3>Discover</h3><p>Bring relevant roles into one structured view.</p></article><article><b>02</b><h3>Compare</h3><p>Filter by research field, country, and funding model.</p></article><article><b>03</b><h3>Shortlist</h3><p>Save the positions that fit your experience and direction.</p></article></div></section>
    <footer><div><span className="brand"><span>OA</span> Opportunity Atlas</span><p>Designed and implemented by Sina Afshar.</p></div><p>Portfolio prototype · Sample data</p></footer>
  </main>;
}
