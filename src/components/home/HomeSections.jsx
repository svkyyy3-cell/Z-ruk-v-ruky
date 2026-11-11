import { Link } from 'react-router-dom';
import { ArrowRight, BadgePercent, MessagesSquare, ShieldCheck, Zap } from 'lucide-react';
import { CATEGORIES, getCategoryById } from '../../data/categories';
import { formatNumber, pluralize } from '../../utils/format';
import { resolveImage } from '../../utils/images';
import { LogoMark } from '../brand/Logo';
import { Button } from '../ui/Button';

export function CategoryTiles({ counts }) {
  return (
    <ul className="cat-tiles">
      {CATEGORIES.map((category) => (
        <li key={category.id}>
          <Link to={`/c/${category.slug}`} className="cat-tile" style={{ '--tone': category.tone, '--ink-c': category.ink }}>
            <span className="cat-tile__icon">
              <category.icon size={24} aria-hidden="true" />
            </span>
            <span className="cat-tile__name">{category.name}</span>
            <span className="cat-tile__count">{pluralize(counts.get(category.id) ?? 0, 'ad')}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function PromoBanners({ vehiclesCount }) {
  return (
    <div className="promos">
      <article className="promo promo--dark">
        <div className="promo__content">
          <p className="promo__eyebrow">For sellers</p>
          <h2 className="promo__title">Sell it in two minutes.</h2>
          <p className="promo__text">Snap a few photos, set a price and your ad goes live instantly. No fees, no commissions.</p>
          <Button to="/post" variant="primary">
            Post an ad
          </Button>
        </div>
        <div className="promo__art" aria-hidden="true">
          <LogoMark size={150} />
        </div>
      </article>
      <article className="promo promo--photo">
        <img src={resolveImage('u:1580273916550-e323be2ae537', { w: 900, h: 560 })} alt="" loading="lazy" />
        <div className="promo__content">
          <p className="promo__eyebrow">Vehicles</p>
          <h2 className="promo__title">Driving season is open.</h2>
          <p className="promo__text">{pluralize(vehiclesCount, 'car, bike and motorcycle', 'cars, bikes and motorcycles')} from checked sellers.</p>
          <Button to="/c/vehicles" variant="secondary" iconRight={ArrowRight}>
            Explore vehicles
          </Button>
        </div>
      </article>
    </div>
  );
}

const POPULAR = [
  { id: 'real-estate', image: 'u:1600596542815-ffad4c1539a9' },
  { id: 'vehicles', image: 'u:1503376780353-7e6692767b70' },
  { id: 'electronics', image: 'u:1505740420928-5e560c06d30e' },
  { id: 'fashion', image: 'u:1542291026-7eec264c27ff' },
];

export function PopularCategories({ counts }) {
  return (
    <ul className="popular">
      {POPULAR.map(({ id, image }) => {
        const category = getCategoryById(id);
        return (
          <li key={id}>
            <Link to={`/c/${category.slug}`} className="popular__card">
              <img src={resolveImage(image, { w: 600, h: 760 })} alt="" loading="lazy" />
              <span className="popular__shade" aria-hidden="true" />
              <span className="popular__body">
                <span className="popular__count">{formatNumber(counts.get(id) ?? 0)} listings</span>
                <span className="popular__name">{category.name}</span>
                <span className="popular__cta">
                  Explore <ArrowRight size={16} aria-hidden="true" />
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

const PROMISES = [
  { icon: Zap, title: 'Free and fast', text: 'Post unlimited ads at no cost. Your listing is live the moment you publish.' },
  { icon: MessagesSquare, title: 'Chat built in', text: 'Talk to buyers and sellers without sharing your number until you’re ready.' },
  { icon: ShieldCheck, title: 'Safer deals', text: 'Verified sellers, ratings and clear safety tips on every listing.' },
  { icon: BadgePercent, title: 'Zero commission', text: 'Whatever you agree on is what you get. We never take a cut.' },
];

export function TrustStrip() {
  return (
    <ul className="trust">
      {PROMISES.map((item) => (
        <li key={item.title} className="trust__item">
          <span className="trust__icon">
            <item.icon size={22} aria-hidden="true" />
          </span>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </li>
      ))}
    </ul>
  );
}
