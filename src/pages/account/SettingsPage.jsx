import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, LogOut, Mail, Phone, Save, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LOCATIONS } from '../../config/site';
import { useDocumentTitle } from '../../hooks';
import { validatePassword, validateProfile } from '../../utils/validation';
import { Button } from '../../components/ui/Button';
import { Field, Input, Select, Textarea } from '../../components/ui/Field';

export default function SettingsPage() {
  useDocumentTitle('Settings');
  return (
    <div className="settings">
      <ProfileForm />
      <PasswordForm />
      <SessionCard />
    </div>
  );
}

function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const { notify } = useToast();
  const initial = { name: user.name, email: user.email, phone: user.phone ?? '', city: user.city ?? '', bio: user.bio ?? '' };
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const dirty = Object.keys(initial).some((key) => initial[key] !== values[key]);

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const result = validateProfile(values);
    setErrors(result.errors);
    if (!result.valid) return;
    setSaving(true);
    try {
      await updateProfile({ ...values, name: values.name.trim(), phone: values.phone.trim(), bio: values.bio.trim() });
      notify({ title: 'Profile updated' });
    } catch (error) {
      if (error.field) setErrors({ [error.field]: error.message });
      else notify({ title: 'Could not save', description: error.message, tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card settings__card" onSubmit={submit} noValidate>
      <header className="settings__head">
        <h2>Profile</h2>
        <p className="muted">This is what buyers see on your listings and public profile.</p>
      </header>
      <div className="settings__grid">
        <Field label="Full name" error={errors.name}>
          {(props) => <Input {...props} icon={UserRound} value={values.name} onChange={set('name')} autoComplete="name" />}
        </Field>
        <Field label="Email" error={errors.email}>
          {(props) => <Input {...props} icon={Mail} type="email" value={values.email} onChange={set('email')} autoComplete="email" />}
        </Field>
        <Field label="Phone" optional error={errors.phone} hint="Shown to buyers when they tap “Show phone number”.">
          {(props) => <Input {...props} icon={Phone} type="tel" value={values.phone} onChange={set('phone')} placeholder="+380 67 123 45 67" autoComplete="tel" />}
        </Field>
        <Field label="City" error={errors.city}>
          {(props) => <Select {...props} value={values.city} onChange={set('city')} placeholder="Select a city" options={LOCATIONS} />}
        </Field>
      </div>
      <Field label="About you" optional error={errors.bio} counter={`${values.bio.length}/400`}>
        {(props) => (
          <Textarea {...props} rows={4} maxLength={400} value={values.bio} onChange={set('bio')} placeholder="A sentence or two that helps buyers trust you." />
        )}
      </Field>
      <div className="settings__actions">
        {dirty && (
          <Button variant="ghost" onClick={() => { setValues(initial); setErrors({}); }}>
            Discard
          </Button>
        )}
        <Button type="submit" variant="dark" icon={Save} loading={saving} disabled={!dirty}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const { changePassword } = useAuth();
  const { notify } = useToast();
  const empty = { currentPassword: '', next: '', confirm: '' };
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.currentPassword) nextErrors.currentPassword = 'Enter your current password.';
    const passwordError = validatePassword(values.next);
    if (passwordError) nextErrors.next = passwordError;
    if (values.confirm !== values.next) nextErrors.confirm = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      await changePassword(values.currentPassword, values.next);
      setValues(empty);
      notify({ title: 'Password changed', description: 'Use your new password next time you log in.' });
    } catch (error) {
      setErrors({ [error.field ?? 'currentPassword']: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card settings__card" onSubmit={submit} noValidate>
      <header className="settings__head">
        <h2>Password</h2>
        <p className="muted">Use at least 8 characters with letters and numbers.</p>
      </header>
      <div className="settings__grid settings__grid--3">
        <Field label="Current password" error={errors.currentPassword}>
          {(props) => <Input {...props} type="password" value={values.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" />}
        </Field>
        <Field label="New password" error={errors.next}>
          {(props) => <Input {...props} type="password" value={values.next} onChange={set('next')} autoComplete="new-password" />}
        </Field>
        <Field label="Repeat new password" error={errors.confirm}>
          {(props) => <Input {...props} type="password" value={values.confirm} onChange={set('confirm')} autoComplete="new-password" />}
        </Field>
      </div>
      <div className="settings__actions">
        <Button type="submit" variant="secondary" icon={KeyRound} loading={saving}>
          Update password
        </Button>
      </div>
    </form>
  );
}

function SessionCard() {
  const { logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  return (
    <div className="card settings__card settings__session">
      <div>
        <h2>Sign out</h2>
        <p className="muted">You’ll need to log in again to message sellers or manage your ads.</p>
      </div>
      <Button
        variant="secondary"
        icon={LogOut}
        onClick={async () => {
          navigate('/');
          await logout();
          notify({ title: 'You’re signed out', tone: 'info' });
        }}
      >
        Log out
      </Button>
    </div>
  );
}
