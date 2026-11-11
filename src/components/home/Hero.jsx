import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCheck, Plus, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatNumber, formatPrice } from '../../utils/format';
import { resolveImage } from '../../utils/images';
import { LOCATIONS } from '../../config/site';

const SHOWCASE_IDS = ['l-beagle', 'l-bmw-m4', 'l-af1-wheat'];

function ShowcaseTile({ listing, className, w, h }) {
  if (!listing) return <div className={`showcase showcase--loading ${className}`} aria-hidden="true" />;
  return (
    <Link to={`/listing/${listing.id}`} className={`showcase ${className}`}>
      <img src={resolveImage(listing.images[0], { w, h })} alt={listing.title} loading="eager" />
      <span className="showcase__tag">
        <span className="showcase__price">{formatPrice(listing)}</span>
        <span className="showcase__title">{listing.title}</span>
      </span>
    </Link>
  );
}

export function Hero({ listings }) {
  const active = listings.filter((l) => l.status === 'active');
  const [dayAgo] = useState(() => Date.now() - 24 * 60 * 60 * 1000);
  const newToday = active.filter((l) => l.createdAt > dayAgo).length;

  const byId = new Map(listings.map((l) => [l.id, l]));
  const featured = active.filter((l) => l.featured);
  const tiles = SHOWCASE_IDS.map((id, i) => {
    const listing = byId.get(id);
    return listing?.status === 'active' ? listing : featured[i];
  });

  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow">
            <span className="hero__pulse" aria-hidden="true" />
            {formatNumber(newToday)} new listings in the last 24 hours
          </p>
          <h1 className="hero__title">
            Good things deserve a <span className="hero__mark">second pair</span> of hands.
          </h1>
          <p className="hero__lead">
            Buy and sell anything near you — phones, sofas, cars, flats and favours. Free to post, safe to chat, no
            commissions.
          </p>
          <div className="hero__ctas">
            <Button size="lg" to="/post" icon={Plus}>
              Post an ad — it’s free
            </Button>
            <Button size="lg" variant="secondary" to="/search" iconRight={ArrowRight}>
              Browse listings
            </Button>
          </div>
          <dl className="hero__stats">
            <div>
              <dt>Active listings</dt>
              <dd>{formatNumber(active.length)}</dd>
            </div>
            <div>
              <dt>Cities covered</dt>
              <dd>{LOCATIONS.length}</dd>
            </div>
            <div>
              <dt>Avg. seller rating</dt>
              <dd>4.8 ★</dd>
            </div>
          </dl>
        </div>

        <div className="hero__visual">
          <ShowcaseTile listing={tiles[0]} className="showcase--main" w={720} h={860} />
          <ShowcaseTile listing={tiles[1]} className="showcase--top" w={520} h={380} />
          <ShowcaseTile listing={tiles[2]} className="showcase--bottom" w={420} h={420} />
          <div className="hero__chat" aria-hidden="true">
            <p className="hero__bubble hero__bubble--in">Hi! Is it still available?</p>
            <p className="hero__bubble hero__bubble--out">
              Yes — come by today 🙂 <CheckCheck size={14} />
            </p>
          </div>
          <span className="hero__sold" aria-hidden="true">
            <Sparkles size={14} /> Sold in 2 hours
          </span>
        </div>
      </div>
    </section>
  );
}
