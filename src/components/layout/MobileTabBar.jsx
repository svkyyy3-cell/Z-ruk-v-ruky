import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, Plus, Search, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessagesContext';

/** Bottom navigation for phones and tablets. */
export function MobileTabBar() {
  const { user } = useAuth();
  const { unreadTotal } = useMessages();

  const tabs = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/post', label: 'Sell', icon: Plus, primary: true },
    { to: '/messages', label: 'Chats', icon: MessageCircle, badge: unreadTotal },
    { to: user ? '/account' : '/login', label: user ? 'Account' : 'Log in', icon: UserRound },
  ];

  return (
    <nav className="tabbar" aria-label="Main">
      {tabs.map((tab) => (
        <NavLink key={tab.label} to={tab.to} end={tab.end} className={`tabbar__item ${tab.primary ? 'tabbar__item--primary' : ''}`}>
          <span className="tabbar__icon">
            <tab.icon size={tab.primary ? 22 : 21} aria-hidden="true" />
            {tab.badge ? <span className="tabbar__badge">{tab.badge > 9 ? '9+' : tab.badge}</span> : null}
          </span>
          <span className="tabbar__label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
