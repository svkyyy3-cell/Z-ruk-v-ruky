import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, Clock, MapPin, Store } from 'lucide-react';
import { formatMonthYear } from '../../utils/format';
import { Avatar, Rating, VerifiedMark } from '../ui/Display';

export function SellerCard({ seller, activeCount, children }) {
  if (!seller) return null;
  return (
    <section className="seller card" aria-labelledby="seller-name">
      <Link to={`/user/${seller.id}`} className="seller__head">
        <Avatar user={seller} size={56} />
        <div className="seller__who">
          <p className="seller__label">{seller.business ? 'Business seller' : 'Private seller'}</p>
          <h2 id="seller-name" className="seller__name">
            {seller.name} {seller.verified && <VerifiedMark />}
          </h2>
          <Rating value={seller.rating} count={seller.reviewsCount} />
        </div>
        <ChevronRight size={20} className="seller__chev" aria-hidden="true" />
      </Link>
      <ul className="seller__facts">
        <li>
          <CalendarDays size={16} aria-hidden="true" /> On Zruky since {formatMonthYear(seller.createdAt)}
        </li>
        <li>
          <Clock size={16} aria-hidden="true" /> Usually replies {seller.responseTime}
        </li>
        {seller.city && (
          <li>
            <MapPin size={16} aria-hidden="true" /> {seller.city}
          </li>
        )}
        {activeCount !== undefined && (
          <li>
            <Store size={16} aria-hidden="true" />
            <Link to={`/user/${seller.id}`} className="text-link">
              {activeCount} active {activeCount === 1 ? 'listing' : 'listings'}
            </Link>
          </li>
        )}
      </ul>
      {children}
    </section>
  );
}
