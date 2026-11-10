import { useEffect, useRef, useState } from 'react';
import { assets, categories, featuredProducts, formatPrice, menuGroups } from './menu.js';

function Arrow({ down = false, ...props }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={down ? {transform:'rotate(90deg)'} : undefined} {...props}><path d="M4 12h15m-6-6 6 6-6 6" /></svg>;
}

function Photo({ asset, className = '', eager = false }) {
  const [failed, setFailed] = useState(false);
  const data = assets[asset];
  if (!data) return null;
  return <div className={`photo ${className} ${failed ? 'photo-failed' : ''}`}>
    <span className="photo-fallback" aria-hidden="true">C!<span>CAFFEMENT!</span></span>
    {!failed && <picture>
      {data.mobile && <source media="(max-width: 600px)" srcSet={data.mobile} />}
      <img src={data.src} alt={data.alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" onError={() => setFailed(true)} width="1024" height="1280" />
    </picture>}
  </div>;
}

function Price({ prices }) {
  if (!prices || prices.length === 0 || !prices[0].value) {
    return <span className="price unconfirmed">Sur demande</span>;
  }
  if (prices.length > 1) {
    return (
      <span className="price price-dual">
        {prices.map((p, idx) => (
          <span key={idx} className={`price-part ${idx === 0 ? 'price-primary' : 'price-secondary'}`}>
            <span className="price-label">{p.label === 'Sur Place' ? 'SP' : 'EMP'}</span>{' '}
            {p.value} <span className="currency">DT</span>
          </span>
        ))}
      </span>
    );
  }
  return <span className="price">{prices[0].value} <span className="currency">DT</span></span>;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(categories[0].id);
  const [indexOpen, setIndexOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navRef = useRef(null);
  const railRef = useRef(null);
  const dialogRef = useRef(null);
  const indexButton = useRef(null);
  const searchRef = useRef(null);
  const navigationLock = useRef(0);
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scrollToTop = e => {
    if (e) e.preventDefault();
    if (indexOpen) closeIndex();
    navigationLock.current = Date.now() + (reducedMotion() ? 200 : 1200);
    setActive(categories[0].id);
    window.scrollTo({top: 0, left: 0, behavior: reducedMotion() ? 'instant' : 'smooth'});
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  const goTo = id => {
    const target = document.getElementById(id);
    if (!target) return;
    if (indexOpen) closeIndex();
    navigationLock.current = Date.now() + (reducedMotion() ? 200 : 2200);
    if (categories.some(category => category.id === id)) setActive(id);
    const offset = id === 'la-carte' ? 0 : (navRef.current?.offsetHeight ?? 68) + 12;
    window.scrollTo({top: window.scrollY + target.getBoundingClientRect().top - offset, behavior: reducedMotion() ? 'instant' : 'smooth'});
  };

  function closeIndex() {
    dialogRef.current?.close();
    setIndexOpen(false);
    setQuery('');
  }

  useEffect(() => {
    let queued = false;
    const update = () => {
      queued = false;
      if (Date.now() < navigationLock.current) return;
      const edge = (navRef.current?.offsetHeight ?? 68) + 42;
      let current = categories[0].id;
      for (const category of categories) {
        if (document.getElementById(category.id)?.getBoundingClientRect().top <= edge) current = category.id;
      }
      setActive(current);
    };
    const onScroll = () => { if (!queued) {queued = true; requestAnimationFrame(update);} };
    const releaseLock = () => { navigationLock.current = 0; onScroll(); };
    const onKey = event => { if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) releaseLock(); };
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('scrollend',releaseLock,{passive:true});
    window.addEventListener('wheel',releaseLock,{passive:true});
    window.addEventListener('touchstart',releaseLock,{passive:true});
    window.addEventListener('keydown',onKey);
    window.addEventListener('resize',onScroll);
    update();
    return () => {
      window.removeEventListener('scroll',onScroll);
      window.removeEventListener('scrollend',releaseLock);
      window.removeEventListener('wheel',releaseLock);
      window.removeEventListener('touchstart',releaseLock);
      window.removeEventListener('keydown',onKey);
      window.removeEventListener('resize',onScroll);
    };
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    const link = rail?.querySelector(`[data-category="${active}"]`);
    if (rail && link) rail.scrollTo({left: link.offsetLeft - rail.offsetLeft - (rail.clientWidth-link.clientWidth)/2, behavior:reducedMotion()?'instant':'smooth'});
  }, [active]);

  useEffect(() => {
    if (!indexOpen) return;
    dialogRef.current.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [indexOpen]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setActive(categories[0].id);

    const minTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(minTimer);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [loading]);

  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const results = query.trim()
    ? categories.flatMap(category =>
        category.products
          .filter(p => normalize(`${p.name} ${p.description} ${category.name} ${category.searchKeywords || ''}`).includes(normalize(query.trim())))
          .map(p => ({...p, category}))
      )
    : [];

  return <>
    <div className={`page-loader ${loading ? 'is-loading' : 'is-loaded'}`} aria-hidden={!loading}>
      <div className="loader-emblem">
        <span className="loader-glow-ring" />
        <span className="loader-pulse-ring" />
        <img src="/images/caffement-official-logo.jfif?v=2" alt="Caffement !" className="loader-logo" />
      </div>
      <div className="loader-text">
        <span className="loader-brand">CAFFEMENT!</span>
        <span className="loader-sub">Des moments autrement</span>
      </div>
    </div>
    <a className="skip-link" href="#la-carte">Aller à la carte</a>
    <header className="hero" id="accueil">
      <Photo asset="hero" className="hero-photo" eager />
      <div className="hero-shade" />
      <div className="hero-top page-width">
        <a className="wordmark" href="#accueil" onClick={scrollToTop} aria-label="Caffement ! Coffee Shop, accueil">
          <img src="/images/caffement-official-logo.jfif?v=2" alt="Logo Caffement !" className="brand-logo" />
          <div className="wordmark-text">
            <span>COFFEE SHOP</span>
            CAFFEMENT!
            <span className="wordmark-rule" />
          </div>
        </a>
        <div className="hero-location">CARTE DES SAVEURS<span>TÉL · 29 538 390</span></div>
        <a className="top-menu-link" href="#la-carte" onClick={e=>{e.preventDefault();goTo('la-carte');}}>La carte <Arrow down /></a>
      </div>
      <div className="hero-content page-width">
        <p className="eyebrow hero-welcome">Bienvenue chez Caffement !</p>
        <h1>Des moments<br/><em>autrement.</em></h1>
        <a className="discover" href="#la-carte" onClick={e=>{e.preventDefault();goTo('la-carte');}}>Découvrir le menu <Arrow down /></a>
      </div>
      <div className="hero-bottom page-width"><span>Cafés. Douceurs. Brunch & Cuisine.</span><a href="#la-carte" onClick={e=>{e.preventDefault();goTo('la-carte');}} aria-label="Défiler vers le menu"><span className="scroll-line"/><span>Au fil de vos envies</span></a></div>
    </header>

    <main>
      <div className="menu-intro page-width" id="la-carte">
        <div><p className="eyebrow">La carte de Caffement !</p><h2>Qu’est-ce qui vous<br/><em>ferait plaisir ?</em></h2></div>
        <p className="intro-aside">Un café de spécialité, une pause gourmande,<br/>des moments autrement.</p>
      </div>

      <nav className="category-nav" aria-label="Catégories de la carte" ref={navRef}>
        <div className="nav-inner page-width">
          <a className="nav-monogram" href="#accueil" onClick={scrollToTop} aria-label="Retour à l’accueil">
            <img src="/images/caffement-official-logo.jfif?v=2" alt="" className="nav-logo" />
            <span>CAFFEMENT!</span>
          </a>
          <div className="category-rail" ref={railRef}>
            {categories.map(category=><a key={category.id} data-category={category.id} className={active===category.id?'category-link active':'category-link'} aria-current={active===category.id?'location':undefined} href={`#${category.id}`} onClick={e=>{e.preventDefault();goTo(category.id);}}>{category.name}</a>)}
          </div>
          <button className="index-button" type="button" aria-label="Ouvrir toutes les catégories et rechercher" aria-haspopup="dialog" ref={indexButton} onClick={()=>setIndexOpen(true)}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="6" height="6"/><rect x="15" y="3" width="6" height="6"/><rect x="3" y="15" width="6" height="6"/><rect x="15" y="15" width="6" height="6"/></svg><span>Toute la carte</span></button>
        </div>
      </nav>

      <div className="menu-body page-width">
        <section className="selection" aria-labelledby="selection-title">
          <div className="section-kicker"><h2 id="selection-title">Au gré de vos envies</h2><span>QUELQUES INSPIRATIONS</span></div>
          <div className="feature-grid">
            {featuredProducts.slice(0,2).map((p,index)=><a className={`feature-card feature-${index}`} key={p.id} href={`#${p.categoryId}`} onClick={e=>{e.preventDefault();goTo(p.categoryId);}}>
              <Photo asset={p.image} />
              <div className="feature-content"><span className="eyebrow">{p.categoryName}</span><div><h3>{p.name}</h3><Price prices={p.prices}/></div><span className="feature-link">Explorer <Arrow/></span></div>
            </a>)}
          </div>
        </section>

        <div className="menu-sections">
          {categories.map((category,index)=><section className={`menu-section ${category.image?'illustrated-section':''}`} key={category.id} id={category.id} aria-labelledby={`title-${category.id}`}>
            <div className="category-heading">
              <span className="section-number">{String(index+1).padStart(2,'0')}</span>
              <div>{category.eyebrow && <p className="eyebrow">{category.eyebrow}</p>}<h2 id={`title-${category.id}`}>{category.name}</h2></div>
              <span className="item-count">{category.products.length} {category.products.length===1?'choix':'choix'}</span>
            </div>
            {category.image && (
              <div className="category-story">
                <Photo asset={category.image}/>
                <div className="story-caption">
                  <span>{category.storyCaption?.top || 'Une parenthèse'}</span>
                  <em>{category.storyCaption?.bottom || 'gourmande.'}</em>
                </div>
              </div>
            )}
            {category.note && <p className="category-note">{category.note}</p>}
            <div className="product-list">
              {category.products.map(p=><article className="product-row" key={p.id}>
                <div className="product-copy"><h3>{p.name}</h3>{p.description&&<p>{p.description}</p>}</div>
                <Price prices={p.prices}/>
              </article>)}
            </div>
          </section>)}
        </div>
        <div className="menu-end"><span className="end-line"/><span className="end-v">C!</span><span className="end-line"/></div>
      </div>
    </main>

    <footer className="footer page-width">
      <div className="footer-identity">
        <a className="footer-brand" href="#accueil" onClick={scrollToTop}>
          <img src="/images/caffement-official-logo.jfif?v=2" alt="Logo Caffement !" className="footer-logo" />
          <span>Caffement !</span>
        </a>
        <p className="footer-story">
          Plus qu’un café, Caffement ! est une invitation à savourer l’instant.
          Dans un cadre élégant et chaleureux, chaque tasse torréfiée avec soin
          et chaque création gourmande sont pensées pour vous offrir, à tout
          moment de la journée, des moments autrement.
        </p>
        <div className="footer-contacts">
          <a href="https://www.instagram.com/caffement.coffee.shop" target="_blank" rel="noreferrer" className="footer-contact-pill">
            <span>Instagram</span>
            <strong>@caffement.coffee.shop</strong>
          </a>
          <a href="tel:29538390" className="footer-contact-pill">
            <span>Contact</span>
            <strong>29 538 390</strong>
          </a>
        </div>
      </div>
      <div className="footer-note"><p>Pour toute question sur nos préparations,<br/>notre équipe est à votre écoute.</p><span>Prix en dinars tunisiens (DT) · Photos d’illustration</span></div>
      <a className="back-top" href="#accueil" onClick={e=>{scrollToTop(e);document.querySelector('.wordmark')?.focus({preventScroll:true});}}>Retour en haut <Arrow down/></a>
    </footer>

    <dialog className="menu-dialog" ref={dialogRef} aria-labelledby="index-title" onCancel={closeIndex} onClose={()=>{setIndexOpen(false);setQuery('');indexButton.current?.focus({preventScroll:true});}} onClick={e=>{if(e.target===dialogRef.current)closeIndex();}}>
      <div className="dialog-content">
        <div className="dialog-head"><div><p className="eyebrow">Suivez votre envie</p><h2 id="index-title">Toute la carte</h2></div><button type="button" className="close-button" onClick={closeIndex} aria-label="Fermer la carte"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg></button></div>
        <label className="search-field"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/></svg><input ref={searchRef} type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Café, crêpe, mojito, brunch…" aria-label="Rechercher dans la carte"/></label>
        <div className="dialog-scroll">
          {query.trim()?<div className="search-results"><p className="result-count" role="status">{results.length} {results.length===1?'résultat':'résultats'}</p>{results.length?results.map(p=><button className="search-result" key={p.id} onClick={()=>goTo(p.category.id)}><span><small>{p.category.name}</small>{p.name}</span><span>{formatPrice(p.prices)}</span></button>):<p className="empty-result">Aucun résultat pour « {query} ».<br/>Essayez une autre envie.</p>}</div>:menuGroups.map(group=><div className="index-group" key={group.id}><h3>{group.name}</h3>{categories.filter(c=>c.group===group.id).map(c=><button key={c.id} onClick={()=>goTo(c.id)}><span>{c.name}</span><span>{String(c.products.length).padStart(2,'0')} <Arrow/></span></button>)}</div>)}
        </div>
      </div>
    </dialog>
  </>;
}
