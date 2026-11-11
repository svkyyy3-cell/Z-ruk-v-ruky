import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, MapPin, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DEMO_ACCOUNT, LOCATIONS, SITE } from '../config/site';
import { useDocumentTitle } from '../hooks';
import { validateLogin, validateRegister } from '../utils/validation';
import { resolveImage } from '../utils/images';
import { Button } from '../components/ui/Button';
import { Checkbox, Field, Input, Select } from '../components/ui/Field';
import { Avatar, Rating } from '../components/ui/Display';

/** Only allow internal redirects (prevents open-redirects via ?next=). */
function useNextPath() {
  const [params] = useSearchParams();
  const next = params.get('next');
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <div className="auth__panel">
        <div className="auth__card">
          <header className="auth__head">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </header>
          {children}
          <p className="auth__switch">{footer}</p>
        </div>
      </div>
      <aside className="auth__art" aria-hidden="true">
        <img src={resolveImage('u:1555041469-a586c61ea9bc', { w: 1100, h: 1300 })} alt="" />
        <div className="auth__quote">
          <p>“Sold my sofa in three hours and bought a bike the same evening. Zruky just feels friendlier.”</p>
          <div className="auth__quote-who">
            <Avatar user={{ id: 'u-olena', name: 'Olena Kravets' }} size={40} />
            <div>
              <strong>Olena K., Lviv</strong>
              <Rating value={4.8} count={112} size={12} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password">
      <Input {...props} type={visible ? 'text' : 'password'} icon={Lock} />
      <button
        type="button"
        className="password__toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export function LoginPage() {
  useDocumentTitle('Log in');
  const { user, login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const next = useNextPath();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user && !loading) return <Navigate to={next} replace />;

  const signIn = async (credentials) => {
    const result = validateLogin(credentials);
    setErrors(result.errors);
    setFormError('');
    if (!result.valid) return;
    setLoading(true);
    try {
      const signedIn = await login(credentials);
      notify({ title: `Welcome back, ${signedIn.name.split(' ')[0]}!` });
      navigate(next, { replace: true });
    } catch (error) {
      setFormError(error.message);
      setLoading(false);
    }
  };

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  return (
    <AuthShell
      title="Welcome back"
      subtitle={`Log in to message sellers, save favorites and manage your ads on ${SITE.name}.`}
      footer={
        <>
          New here?{' '}
          <Link to={`/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-link">
            Create an account
          </Link>
        </>
      }
    >
      <div className="auth__demo">
        <Sparkles size={18} aria-hidden="true" />
        <div>
          <p>
            <strong>Just exploring?</strong> Use the demo account with listings, favorites and chats.
          </p>
          <p className="auth__demo-creds">
            {DEMO_ACCOUNT.email} · {DEMO_ACCOUNT.password}
          </p>
        </div>
        <Button
          variant="dark"
          size="sm"
          onClick={() => {
            setValues(DEMO_ACCOUNT);
            signIn(DEMO_ACCOUNT);
          }}
          disabled={loading}
        >
          Use demo
        </Button>
      </div>

      <form
        className="auth__form"
        onSubmit={(e) => {
          e.preventDefault();
          signIn(values);
        }}
        noValidate
      >
        {formError && (
          <p className="auth__error" role="alert">
            {formError}
          </p>
        )}
        <Field label="Email" error={errors.email}>
          {(props) => (
            <Input {...props} type="email" icon={Mail} autoComplete="email" value={values.email} onChange={set('email')} placeholder="you@example.com" />
          )}
        </Field>
        <Field label="Password" error={errors.password}>
          {(props) => <PasswordInput {...props} autoComplete="current-password" value={values.password} onChange={set('password')} placeholder="Your password" />}
        </Field>
        <Button type="submit" size="lg" block loading={loading}>
          Log in
        </Button>
      </form>
    </AuthShell>
  );
}

export function RegisterPage() {
  useDocumentTitle('Create account');
  const { user, register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const next = useNextPath();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '', city: '', terms: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user && !loading) return <Navigate to={next} replace />;

  const set = (field) => (e) =>
    setValues((v) => ({ ...v, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const result = validateRegister(values);
    setErrors(result.errors);
    setFormError('');
    if (!result.valid) return;
    setLoading(true);
    try {
      const created = await register(values);
      notify({ title: `Welcome to ${SITE.name}, ${created.name.split(' ')[0]}!`, description: 'Your account is ready.' });
      navigate(next === '/' ? '/account' : next, { replace: true });
    } catch (error) {
      if (error.field) setErrors((e) => ({ ...e, [error.field]: error.message }));
      else setFormError(error.message);
      setLoading(false);
    }
  };

  const strength = passwordStrength(values.password);

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever. Post ads, chat with buyers and keep your favorites in sync."
      footer={
        <>
          Already have an account?{' '}
          <Link to={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-link">
            Log in
          </Link>
        </>
      }
    >
      <form className="auth__form" onSubmit={submit} noValidate>
        {formError && (
          <p className="auth__error" role="alert">
            {formError}
          </p>
        )}
        <Field label="Full name" error={errors.name}>
          {(props) => <Input {...props} icon={UserRound} autoComplete="name" value={values.name} onChange={set('name')} placeholder="Taras Shevchenko" />}
        </Field>
        <Field label="Email" error={errors.email}>
          {(props) => <Input {...props} type="email" icon={Mail} autoComplete="email" value={values.email} onChange={set('email')} placeholder="you@example.com" />}
        </Field>
        <Field label="City" error={errors.city}>
          {(props) => (
            <div className="with-icon">
              <MapPin size={18} className="with-icon__icon" aria-hidden="true" />
              <Select {...props} value={values.city} onChange={set('city')} placeholder="Where are you based?" options={LOCATIONS} />
            </div>
          )}
        </Field>
        <div className="auth__row">
          <Field label="Password" error={errors.password} hint={!errors.password && values.password ? `Strength: ${strength.label}` : 'At least 8 characters with a number.'}>
            {(props) => <PasswordInput {...props} autoComplete="new-password" value={values.password} onChange={set('password')} placeholder="Create a password" />}
          </Field>
          <Field label="Repeat password" error={errors.confirm}>
            {(props) => <PasswordInput {...props} autoComplete="new-password" value={values.confirm} onChange={set('confirm')} placeholder="Repeat it" />}
          </Field>
        </div>
        {values.password && (
          <div className={`strength strength--${strength.score}`} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        )}
        <div>
          <Checkbox
            checked={values.terms}
            onChange={set('terms')}
            label={
              <>
                I agree to the <Link to="/terms" className="text-link">Terms of use</Link> and{' '}
                <Link to="/privacy" className="text-link">Privacy policy</Link>.
              </>
            }
          />
          {errors.terms && (
            <p className="field__error" role="alert">
              {errors.terms}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" block loading={loading}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}

function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/\d/.test(password) && /[a-zA-Z]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password) || /[A-Z]/.test(password)) score += 1;
  return { score, label: ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'][score] };
}
