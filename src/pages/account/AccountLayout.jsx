import { useMemo } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Eye, Heart, LayoutList, MessageCircle, Plus, Settings, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useListings } from '../../context/ListingsContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useMessages } from '../../context/MessagesContext';
import { formatMonthYear, formatNumber } from '../../utils/format';
import { Avatar, Rating, VerifiedMark } from '../../components/ui/Display';
import { Button } from '../../components/ui/Button';

export default function AccountLayout() {
  const { user } = useAuth();
  const { listings } = useListings();
  const { count: favoritesCount } = useFavorites();
  const { unreadTotal } = useMessages();

  const stats = useMemo(() => {
    const mine = listings.filter((l) => l.sellerId === user.id);
    return {
      active: mine.filter((l) => l.status === 'active').length,
      sold: mine.filter((l) => l.status === 'sold').length,
      views: mine.reduce((sum, l) => sum + (l.views ?? 0), 0),
    };
  }, [listings, user.id]);

  const tabs = [
    { to: '/account/listings', label: 'My listings', icon: LayoutList },
    { to: '/account/favorites', label: 'Favorites', icon: Heart, count: favoritesCount },
    { to: '/messages', label: 'Messages', icon: MessageCircle, count: unreadTotal },
    { to: '/account/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="container page account">
      <header className="account__hero card">
        <div className="account__who">
          <Avatar user={user} size={72} />
          <div>
            <h1 className="account__name">
              {user.name} {user.verified && <VerifiedMark size={20} />}
            </h1>
            <p className="account__sub">
              {user.city} · on Zruky since {formatMonthYear(user.createdAt)}
            </p>
            <Rating value={user.rating} count={user.reviewsCount} />
          </div>
        </div>
        <dl className="account__stats">
          <div>
            <dt>
              <ShoppingBag size={16} aria-hidden="true" /> Active
            </dt>
            <dd>{stats.active}</dd>
          </div>
          <div>
            <dt>
              <LayoutList size={16} aria-hidden="true" /> Sold
            </dt>
            <dd>{stats.sold}</dd>
          </div>
          <div>
            <dt>
              <Eye size={16} aria-hidden="true" /> Views
            </dt>
            <dd>{formatNumber(stats.views)}</dd>
          </div>
        </dl>
        <Button to="/post" icon={Plus} className="account__cta">
          Post an ad
        </Button>
      </header>

      <div className="account__body">
        <nav className="account__nav" aria-label="Account">
          {tabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to} className="account__tab">
              <tab.icon size={18} aria-hidden="true" />
              <span>{tab.label}</span>
              {tab.count ? <span className="account__count">{tab.count}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="account__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
