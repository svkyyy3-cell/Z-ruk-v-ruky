import { useCallback, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Heart,
  LayoutGrid,
  LayoutList,
  LogOut,
  MessageCircle,
  Plus,
  Settings,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useMessages } from '../../context/MessagesContext';
import { useToast } from '../../context/ToastContext';
import { CATEGORIES } from '../../data/categories';
import { useClickOutside } from '../../hooks';
import { Logo } from '../brand/Logo';
import { Button, IconButton } from '../ui/Button';
import { Avatar } from '../ui/Display';
import { SearchBar } from './SearchBar';
import { LocationButton } from './LocationPicker';

export function Header() {
  const { user } = useAuth();
  const { count: favoritesCount } = useFavorites();
  const { unreadTotal } = useMessages();

  return (
    <header className="header">
      <div className="container header__bar">
        <Logo className="header__logo" />
        <LocationButton className="header__location" compact />
        <SearchBar className="header__search" />

        <nav className="header__actions" aria-label="Account">
          <IconButton to="/favorites" icon={Heart} label="Favorites" badge={favoritesCount} className="header__fav" />
          <IconButton to="/messages" icon={MessageCircle} label="Messages" badge={unreadTotal} className="header__desktop" />
          {user ? (
            <UserMenu />
          ) : (
            <div className="header__auth header__desktop">
              <Button variant="ghost" to="/login">
                Log in
              </Button>
              <Button variant="secondary" to="/register">
                Register
              </Button>
            </div>
          )}
          <Button to="/post" icon={Plus} className="header__post header__desktop">
            Post an ad
          </Button>
        </nav>
      </div>
      <CategoryNav />
    </header>
  );
}

function CategoryNav() {
  return (
    <nav className="catnav" aria-label="Categories">
      <div className="container">
        <ul className="catnav__list">
          <li>
            <NavLink to="/categories" className="catnav__link catnav__link--all">
              <LayoutGrid size={16} aria-hidden="true" />
              All categories
            </NavLink>
          </li>
          {CATEGORIES.map((category) => (
            <li key={category.id}>
              <NavLink to={`/c/${category.slug}`} className="catnav__link">
                <category.icon size={16} aria-hidden="true" />
                {category.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const ref = useRef(null);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  // Close the menu after navigation.
  if (open && openedAt !== pathname) {
    setOpen(false);
  }

  const handleLogout = async () => {
    setOpen(false);
    navigate('/');
    await logout();
    notify({ title: 'You’re signed out', description: 'See you soon!', tone: 'info' });
  };

  const firstName = user.name.split(' ')[0];

  return (
    <div className="usermenu header__desktop" ref={ref}>
      <button
        type="button"
        className="usermenu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpenedAt(pathname);
          setOpen((v) => !v);
        }}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      >
        <Avatar user={user} size={32} />
        <span className="usermenu__name">{firstName}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <div className="usermenu__panel" role="menu" onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
          <div className="usermenu__head">
            <Avatar user={user} size={40} />
            <div>
              <p className="usermenu__fullname">{user.name}</p>
              <p className="usermenu__email">{user.email}</p>
            </div>
          </div>
          <Link role="menuitem" to="/account/listings" className="usermenu__item">
            <LayoutList size={18} aria-hidden="true" /> My listings
          </Link>
          <Link role="menuitem" to="/account/favorites" className="usermenu__item">
            <Heart size={18} aria-hidden="true" /> Favorites
          </Link>
          <Link role="menuitem" to="/messages" className="usermenu__item">
            <MessageCircle size={18} aria-hidden="true" /> Messages
          </Link>
          <Link role="menuitem" to={`/user/${user.id}`} className="usermenu__item">
            <UserRound size={18} aria-hidden="true" /> Public profile
          </Link>
          <Link role="menuitem" to="/account/settings" className="usermenu__item">
            <Settings size={18} aria-hidden="true" /> Settings
          </Link>
          <button role="menuitem" type="button" className="usermenu__item usermenu__item--danger" onClick={handleLogout}>
            <LogOut size={18} aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
