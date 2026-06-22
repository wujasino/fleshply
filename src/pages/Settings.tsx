import { useState, useEffect, useRef, useMemo } from 'react';
import { TotpSetup } from '@/components/ui/totp-setup';
import { useNavigate } from 'react-router-dom';
import {
  User, Bell, Shield, Trash2, Moon, Globe, Save,
  Upload, Camera, Loader2, KeyRound, Check, Mail, ArrowRight, ArrowLeft,
  Eye, EyeOff, CheckCircle2, Circle, CreditCard, Download, FileText, Volume2,
} from 'lucide-react';
import { loadVoicePrefs, saveVoicePrefs, VoicePrefs, AVAILABLE_VOICES } from '@/hooks/useTTS';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTranslation } from '@/lib/locale';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Tab = 'account' | 'appearance' | 'notifications' | 'security' | 'privacy' | 'billing';

const tabs: { id: Tab; labelKey: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'account',       labelKey: 'settings_tab_account',       icon: User },
  { id: 'appearance',    labelKey: 'settings_tab_appearance',    icon: Moon },
  { id: 'notifications', labelKey: 'settings_tab_notifications', icon: Bell },
  { id: 'security',      labelKey: 'settings_tab_security',      icon: KeyRound },
  { id: 'privacy',       labelKey: 'settings_tab_privacy',       icon: Shield },
  { id: 'billing',       labelKey: 'settings_tab_billing',       icon: CreditCard },
];

export default function Settings() {
  const navigate = useNavigate();
  const { t, locale, setLocale } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [voicePrefs, setVoicePrefs] = useState<VoicePrefs>(loadVoicePrefs);

  // Billing / subscription
  const [subStatus, setSubStatus] = useState<'active' | 'paused' | 'cancelled'>('active');
  const [subHistory, setSubHistory] = useState<Array<{ status: 'active' | 'paused' | 'cancelled'; label: string; timestamp: string }>>([]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [notifBrewComplete, setNotifBrewComplete] = useState(true);
  const [notifNewsletter, setNotifNewsletter] = useState(false);
  const [notifMarketing, setNotifMarketing] = useState(false);

  // Withdrawal form
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [withdrawalService, setWithdrawalService] = useState('');
  const [withdrawalDate, setWithdrawalDate] = useState('');
  const [withdrawalStatus, setWithdrawalStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Delete account
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deleteMethod, setDeleteMethod] = useState<'password' | '2fa'>('password');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteTotpCode, setDeleteTotpCode] = useState('');
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'deleting' | 'done'>('idle');
  const [deleteError, setDeleteError] = useState('');

  const handleWithdrawal = async () => {
    if (!withdrawalService.trim() || !withdrawalDate) return;
    setWithdrawalStatus('sending');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email ?? email;
      const body = `FORMULARZ ODSTAPIENIA OD UMOWY\n\nAdresat: Patryk Rybacki\nE-mail: kontakt@bitbrew.pl\n\nJa, niniejszym informuje o moim odstąpieniu od umowy o swiadczenie nastepujacej uslugi:\n${withdrawalService}\n\nData zawarcia umowy: ${withdrawalDate}\n\nImię i nazwisko / e-mail konsumenta: ${userEmail}\n\nData złożenia oswiadczenia: ${new Date().toLocaleDateString('pl-PL')}`;
      const res = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userEmail,
          email: userEmail,
          subject: 'Odstapienie od umowy',
          message: body,
        }),
      });
      if (!res.ok) throw new Error('send failed');
      setWithdrawalStatus('sent');
    } catch {
      setWithdrawalStatus('error');
    }
  };

  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security tab — change password via OTP
  const [pwdStep, setPwdStep] = useState<'idle' | 'sending' | 'otp' | 'newpwd' | 'done'>('idle');
  const [pwdOtp, setPwdOtp] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPwdNew, setShowPwdNew] = useState(false);

  const pwdRules = [
    { label: 'Min. 8 chars',    test: (p: string) => p.length >= 8 },
    { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Number',          test: (p: string) => /[0-9]/.test(p) },
    { label: 'Special char',    test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  const pwdStrength = useMemo(() => {
    if (!pwdNew) return 0;
    return pwdRules.filter(r => r.test(pwdNew)).length;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pwdNew]);

  const pwdStrengthLabel = ['', 'Weak', 'Weak', 'Medium', 'Strong'][pwdStrength];
  const pwdStrengthColor = ['', 'bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'][pwdStrength];

  // Security tab — change email
  const [emailStep, setEmailStep] = useState<'idle' | 'input' | 'sent'>('idle');
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('subscriptionStatus') as typeof subStatus | null;
    if (stored) setSubStatus(stored);
    const storedHist = localStorage.getItem('subscriptionHistory');
    if (storedHist) {
      try { setSubHistory(JSON.parse(storedHist)); } catch { /* noop */ }
    } else {
      const init = [{ status: 'active' as const, label: t('sub_status_active'), timestamp: new Date().toISOString() }];
      setSubHistory(init);
      localStorage.setItem('subscriptionHistory', JSON.stringify(init));
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate('/login'); return; }
      setUserId(user.id);
      setEmail(user.email ?? '');
      setDisplayName(user.user_metadata?.full_name ?? '');
      setAvatarUrl(user.user_metadata?.avatar_url ?? null);
    });
  }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const SUB_DOT = {
    active: 'bg-emerald-400 ring-emerald-400/30',
    paused: 'bg-amber-400 ring-amber-400/30',
    cancelled: 'bg-red-500 ring-red-500/30',
  } as const;
  const SUB_STATUS_KEY = { active: 'sub_status_active', paused: 'sub_status_paused', cancelled: 'sub_status_cancelled' } as const;

  const updateSub = (status: typeof subStatus) => {
    if (status === subStatus) return;
    setSubStatus(status);
    localStorage.setItem('subscriptionStatus', status);
    const label = t(SUB_STATUS_KEY[status]);
    const next = [{ status, label, timestamp: new Date().toISOString() }, ...subHistory].slice(0, 20);
    setSubHistory(next);
    localStorage.setItem('subscriptionHistory', JSON.stringify(next));
  };

  const downloadHistory = () => {
    if (!subHistory.length) return;
    const isJson = exportFormat === 'json';
    const content = isJson
      ? JSON.stringify(subHistory, null, 2)
      : [['Date', 'Status', 'Description'], ...subHistory.map(i => [
          new Date(i.timestamp).toLocaleString(),
          i.status,
          i.label,
        ])].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([content], { type: isJson ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: `billing-history.${exportFormat}` }).click();
    URL.revokeObjectURL(url);
  };

  const initials = email ? email[0].toUpperCase() : '?';

  const handleAvatarFile = async (file: File) => {
    if (!userId) return;
    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError(t('settings_avatar_invalid_type'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError(t('settings_avatar_too_large'));
      return;
    }

    setUploading(true);
    const blobUrl = URL.createObjectURL(file);
    setAvatarUrl(blobUrl);

    try {
      const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!ALLOWED_EXTS.includes(ext)) {
        throw new Error(t('settings_avatar_invalid_type'));
      }
      const storagePath = `${userId}/avatar.${ext}`;

      const { error: storageError } = await supabase.storage
        .from('avatars')
        .upload(storagePath, file, { upsert: true, contentType: file.type });
      if (storageError) throw storageError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(storagePath);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (authError) throw authError;

      await supabase.auth.refreshSession();
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);

      URL.revokeObjectURL(blobUrl);
      setAvatarUrl(publicUrl);
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      URL.revokeObjectURL(blobUrl);
      setAvatarUrl(null);
      setUploadError(
        err?.message?.includes('Bucket not found')
          ? 'Bucket "avatars" does not exist in Supabase Storage. Run the SQL migration.'
          : err?.message?.includes('row-level security')
          ? 'No write permission. Check the RLS policies for the "avatars" bucket.'
          : t('settings_avatar_upload_error')
      );
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!userId) return;
    setUploading(true);
    try {
      await supabase.auth.updateUser({ data: { avatar_url: null } });
      await supabase.auth.refreshSession();
      await supabase.from('profiles').update({ avatar_url: null }).eq('id', userId);
      setAvatarUrl(null);
    } catch (err) {
      console.error('Avatar remove error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: displayName } });
      if (error) throw error;
      await supabase.auth.refreshSession();
      await supabase.from('profiles').update({ full_name: displayName }).eq('id', userId);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendPwdOtp = async () => {
    if (!email) return;
    setPwdLoading(true);
    setPwdError('');
    try {
      const res = await fetch('/.netlify/functions/send-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error sending code.');
      setPwdOtp('');
      setPwdStep('otp');
    } catch (err: any) {
      setPwdError(err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  const handleVerifyPwdOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdOtp.replace(/\D/g, '').length < 6) { setPwdError('Please enter the full 6-digit code.'); return; }
    setPwdLoading(true);
    setPwdError('');
    try {
      const res = await fetch('/.netlify/functions/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: pwdOtp.replace(/\D/g, '') }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code.');
      setPwdNew('');
      setPwdConfirm('');
      setPwdStep('newpwd');
    } catch (err: any) {
      setPwdError(err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdNew.length < 8) { setPwdError('Password must be at least 8 characters.'); return; }
    if (pwdNew !== pwdConfirm) { setPwdError('Passwords do not match.'); return; }
    setPwdLoading(true);
    setPwdError('');
    try {
      const res = await fetch('/.netlify/functions/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: pwdOtp.replace(/\D/g, ''), newPassword: pwdNew }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password.');
      setPwdStep('done');
    } catch (err: any) {
      setPwdError(err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(newEmail)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailLoading(true);
    setEmailError('');
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim().toLowerCase() });
      if (error) throw error;
      setEmailStep('sent');
    } catch (err: any) {
      setEmailError(err.message || 'Failed to change email address.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteStatus('deleting');
    setDeleteError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      if (deleteMethod === 'password') {
        if (!deletePassword) { setDeleteError('Enter password'); setDeleteStatus('idle'); return; }
        const { error } = await supabase.auth.signInWithPassword({ email: user.email!, password: deletePassword });
        if (error) { setDeleteError('Incorrect password'); setDeleteStatus('idle'); return; }
      } else {
        if (deleteTotpCode.length !== 6) { setDeleteError('Enter 6-digit 2FA code'); setDeleteStatus('idle'); return; }
        const { error } = await supabase.auth.verifyOtp({ email: user.email!, token: deleteTotpCode, type: 'totp' });
        if (error) { setDeleteError('Invalid 2FA code'); setDeleteStatus('idle'); return; }
      }

      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.from('analyses').delete().eq('user_id', user.id);
      await supabase.auth.signOut();
      setDeleteStatus('done');
      setTimeout(() => navigate('/'), 1500);
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : 'An error occurred');
      setDeleteStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-foreground mb-6">{t('settings')}</h1>
        <div className="flex gap-6">
          {/* Left tab sidebar */}
          <aside className="w-48 shrink-0">
            <nav className="space-y-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left',
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  {t(tab.labelKey)}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="rounded-xl border border-[hsl(var(--glass-border))] bg-card p-6 space-y-6">

              {/* ACCOUNT */}
              {activeTab === 'account' && (
                <>
                  {/* Avatar uploader */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleAvatarFile(file);
                    }}
                    className={cn(
                      'flex items-center gap-5 p-4 rounded-xl border border-dashed transition-colors',
                      dragOver ? 'border-primary bg-primary/5' : 'border-[hsl(var(--glass-border))] bg-muted/20'
                    )}
                  >
                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="relative block"
                        aria-label={t('settings_avatar_change')}
                      >
                        <Avatar className="h-20 w-20 ring-2 ring-primary/30">
                          <AvatarImage src={avatarUrl ?? undefined} />
                          <AvatarFallback className="text-xl font-semibold bg-primary text-primary-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 rounded-full bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                        </div>
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {dragOver ? t('settings_avatar_drop') : t('settings_avatar_hint')}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                          {avatarUrl ? t('settings_avatar_change') : t('settings_avatar_upload')}
                        </Button>
                        {avatarUrl && (
                          <Button type="button" size="sm" variant="ghost" disabled={uploading} onClick={handleAvatarRemove} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            {t('settings_avatar_remove')}
                          </Button>
                        )}
                      </div>
                      {uploadError && <p className="text-xs text-destructive mt-2">{uploadError}</p>}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAvatarFile(file);
                        e.target.value = '';
                      }}
                    />
                  </div>

                  <div className="h-px bg-border" />

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">{t('settings_display_name')}</label>
                      <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t('settings_display_name_placeholder')} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">{t('email')}</label>
                      <Input value={email} disabled className="opacity-60" />
                      <p className="text-xs text-muted-foreground mt-1">{t('settings_email_hint')}</p>
                    </div>
                  </div>

                  <Button onClick={handleSave} disabled={saving} size="sm">
                    {saved ? '✓ Saved' : saving ? t('settings_saving') : (
                      <><Save className="w-3.5 h-3.5 mr-1.5" />{t('settings_save')}</>
                    )}
                  </Button>

                  {/* Delete account */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm font-medium text-foreground mb-1">Delete account</p>
                    <p className="text-xs text-muted-foreground mb-3">This operation is irreversible. All data will be permanently deleted.</p>
                    <button
                      onClick={() => setShowDeleteForm(true)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="inline w-3.5 h-3.5 mr-1.5" />
                      Delete account
                    </button>
                  </div>

                  {/* Delete account dialog */}
                  <Dialog open={showDeleteForm} onOpenChange={(open) => {
                    if (!open) { setShowDeleteForm(false); setDeletePassword(''); setDeleteTotpCode(''); setDeleteError(''); setDeleteStatus('idle'); }
                  }}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-destructive flex items-center gap-2">
                          <Trash2 className="w-4 h-4" /> Delete account
                        </DialogTitle>
                        <DialogDescription>
                          This operation is irreversible. All your data will be permanently deleted.
                        </DialogDescription>
                      </DialogHeader>

                      {deleteStatus === 'done' ? (
                        <p className="text-sm text-muted-foreground py-2">Account deleted.</p>
                      ) : (
                        <div className="space-y-4 py-2">
                          <div className="flex gap-2 text-xs">
                            <button
                              onClick={() => setDeleteMethod('password')}
                              className={cn('px-3 py-1.5 rounded border transition-colors', deleteMethod === 'password' ? 'bg-destructive/10 border-destructive/30 text-destructive' : 'border-border text-muted-foreground hover:bg-accent')}
                            >
                              Password
                            </button>
                            <button
                              onClick={() => setDeleteMethod('2fa')}
                              className={cn('px-3 py-1.5 rounded border transition-colors', deleteMethod === '2fa' ? 'bg-destructive/10 border-destructive/30 text-destructive' : 'border-border text-muted-foreground hover:bg-accent')}
                            >
                              2FA code (I don't remember my password)
                            </button>
                          </div>

                          {deleteMethod === 'password' ? (
                            <Input type="password" placeholder="Enter password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
                          ) : (
                            <Input type="text" placeholder="Code from 2FA app (6 digits)" maxLength={6} value={deleteTotpCode} onChange={e => setDeleteTotpCode(e.target.value.replace(/\D/g, ''))} />
                          )}

                          {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}

                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              onClick={() => { setShowDeleteForm(false); setDeletePassword(''); setDeleteTotpCode(''); setDeleteError(''); }}
                              className="px-4 py-2 rounded-lg text-sm border border-border text-muted-foreground hover:bg-accent transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              disabled={deleteStatus === 'deleting'}
                              onClick={handleDeleteAccount}
                              className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive text-white hover:bg-destructive/90 transition-colors disabled:opacity-50"
                            >
                              {deleteStatus === 'deleting' ? 'Deleting...' : 'Confirm and delete'}
                            </button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {/* APPEARANCE */}
              {activeTab === 'appearance' && (
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-3">
                      <Globe className="inline w-4 h-4 mr-1.5 text-primary" />
                      {t('settings_language')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {([
                        { code: 'pl', label: 'Polski'    },
                        { code: 'en', label: 'English'   },
                        { code: 'de', label: 'Deutsch'   },
                        { code: 'fr', label: 'Francais'  },
                        { code: 'es', label: 'Espanol'   },
                        { code: 'it', label: 'Italiano'  },
                      ] as const).map(({ code, label }) => (
                        <button
                          key={code}
                          onClick={() => setLocale(code)}
                          className={cn(
                            'px-4 py-2 rounded-lg text-sm border transition-colors',
                            locale === code
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-input text-muted-foreground hover:text-foreground hover:bg-accent'
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">
                      <Volume2 className="inline w-4 h-4 mr-1.5 text-primary" />
                      AI Voice (report reading)
                    </label>
                    <p className="text-xs text-muted-foreground mb-4">
                      Play the report aloud after analysis completes. Requires an ElevenLabs key in the Netlify panel.
                    </p>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--glass-border))] bg-muted/20 mb-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Enable read aloud</p>
                        <p className="text-xs text-muted-foreground">A button will appear in the analysis report</p>
                      </div>
                      <button
                        onClick={() => {
                          const p = { ...voicePrefs, enabled: !voicePrefs.enabled };
                          setVoicePrefs(p);
                          saveVoicePrefs(p);
                        }}
                        className={cn('relative w-10 h-6 rounded-full transition-colors', voicePrefs.enabled ? 'bg-primary' : 'bg-muted')}
                      >
                        <span className={cn('absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200', voicePrefs.enabled ? 'left-5' : 'left-1')} />
                      </button>
                    </div>

                    {voicePrefs.enabled && (
                      <div className="grid grid-cols-2 gap-2">
                        {AVAILABLE_VOICES.map(v => (
                          <button
                            key={v.id}
                            onClick={() => {
                              const p = { ...voicePrefs, voiceId: v.id };
                              setVoicePrefs(p);
                              saveVoicePrefs(p);
                            }}
                            className={cn(
                              'flex flex-col items-start p-3 rounded-xl border text-left transition-colors',
                              voicePrefs.voiceId === v.id
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'border-input text-muted-foreground hover:text-foreground hover:bg-accent'
                            )}
                          >
                            <span className="text-sm font-medium">{v.name}</span>
                            <span className="text-[11px] opacity-70">{v.description}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  {[
                    { label: t('settings_notif_brew'), desc: t('settings_notif_brew_desc'), value: notifBrewComplete, set: setNotifBrewComplete },
                    { label: t('settings_notif_newsletter'), desc: t('settings_notif_newsletter_desc'), value: notifNewsletter, set: setNotifNewsletter },
                    { label: t('settings_notif_marketing'), desc: t('settings_notif_marketing_desc'), value: notifMarketing, set: setNotifMarketing },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-4 p-4 rounded-xl border border-[hsl(var(--glass-border))] bg-muted/20">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => item.set(!item.value)}
                        className={cn('relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors', item.value ? 'bg-primary' : 'bg-muted')}
                      >
                        <span className={cn('pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform', item.value ? 'translate-x-4' : 'translate-x-0')} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* SECURITY */}
              {activeTab === 'security' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl border border-[hsl(var(--glass-border))] bg-muted/20 space-y-3">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Two-factor authentication (2FA)</p>
                        <p className="text-xs text-muted-foreground">Google Authenticator, Authy i inne</p>
                      </div>
                    </div>
                    <TotpSetup />
                  </div>

                  <div className="p-4 rounded-xl border border-[hsl(var(--glass-border))] bg-muted/20 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <KeyRound className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Change password</p>
                        <p className="text-xs text-muted-foreground">
                          {pwdStep === 'idle' ? <>We'll send a verification code to <strong>{email}</strong></> : null}
                          {pwdStep === 'otp' ? 'Enter the code from your email' : null}
                          {pwdStep === 'newpwd' ? 'Code confirmed — set your new password' : null}
                          {pwdStep === 'done' ? 'Password has been changed' : null}
                        </p>
                      </div>
                    </div>

                    {pwdError && (
                      <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{pwdError}</p>
                    )}

                    {pwdStep === 'idle' && (
                      <Button size="sm" variant="outline" className="w-full" disabled={pwdLoading} onClick={handleSendPwdOtp}>
                        {pwdLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Mail className="w-3.5 h-3.5 mr-1.5" />}
                        Send verification code
                      </Button>
                    )}

                    {pwdStep === 'otp' && (
                      <form onSubmit={handleVerifyPwdOtp} className="space-y-3">
                        <div className="space-y-1.5">
                          <p className="text-xs text-muted-foreground">6-digit code from email</p>
                          <Input
                            value={pwdOtp}
                            onChange={e => setPwdOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            inputMode="numeric"
                            maxLength={6}
                            className="h-10 text-center text-xl tracking-widest font-bold"
                            autoFocus
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="ghost" onClick={() => { setPwdStep('idle'); setPwdError(''); }}>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </Button>
                          <Button type="submit" size="sm" className="flex-1" disabled={pwdLoading || pwdOtp.length < 6}>
                            {pwdLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5 mr-1.5" />}
                            Next
                          </Button>
                        </div>
                      </form>
                    )}

                    {pwdStep === 'newpwd' && (
                      <form onSubmit={handleSetNewPassword} className="space-y-3">
                        <div className="relative">
                          <Input
                            type={showPwdNew ? 'text' : 'password'}
                            value={pwdNew}
                            onChange={e => setPwdNew(e.target.value)}
                            placeholder="New password"
                            autoComplete="new-password"
                            className="h-10 pr-10"
                            autoFocus
                          />
                          <button type="button" onClick={() => setShowPwdNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                            {showPwdNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {pwdNew.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex gap-1 h-1">
                              {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`flex-1 rounded-full transition-colors ${i <= pwdStrength ? pwdStrengthColor : 'bg-muted/40'}`} />
                              ))}
                            </div>
                            <p className="text-[11px] text-muted-foreground">{pwdStrengthLabel}</p>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-0.5">
                              {pwdRules.map(({ label, test }) => {
                                const ok = test(pwdNew);
                                return (
                                  <div key={label} className="flex items-center gap-1.5">
                                    {ok ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> : <Circle className="w-3 h-3 text-muted-foreground/40 shrink-0" />}
                                    <span className={`text-[11px] ${ok ? 'text-foreground/80' : 'text-muted-foreground/60'}`}>{label}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <Input type={showPwdNew ? 'text' : 'password'} value={pwdConfirm} onChange={e => setPwdConfirm(e.target.value)} placeholder="Repeat password" autoComplete="new-password" className="h-10" />
                        {pwdConfirm.length > 0 && pwdNew !== pwdConfirm && (
                          <p className="text-[11px] text-red-400">Passwords do not match</p>
                        )}
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="ghost" onClick={() => { setPwdStep('otp'); setPwdError(''); }}>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </Button>
                          <Button type="submit" size="sm" className="flex-1" disabled={pwdLoading || pwdNew.length < 8 || pwdNew !== pwdConfirm}>
                            {pwdLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5 mr-1.5" />}
                            Change password
                          </Button>
                        </div>
                      </form>
                    )}

                    {pwdStep === 'done' && (
                      <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 rounded-lg px-3 py-2">
                        <Check className="w-4 h-4 shrink-0" />
                        Password changed successfully.
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl border border-[hsl(var(--glass-border))] bg-muted/20 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Change email address</p>
                        <p className="text-xs text-muted-foreground">Current: <strong>{email}</strong></p>
                      </div>
                    </div>

                    {emailError && (
                      <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{emailError}</p>
                    )}

                    {emailStep === 'idle' && (
                      <Button size="sm" variant="outline" className="w-full" onClick={() => { setEmailStep('input'); setEmailError(''); setNewEmail(''); }}>
                        <Mail className="w-3.5 h-3.5 mr-1.5" />
                        Change email
                      </Button>
                    )}

                    {emailStep === 'input' && (
                      <form onSubmit={handleChangeEmail} className="space-y-3">
                        <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="nowy@email.pl" autoComplete="email" className="h-10" autoFocus />
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="ghost" onClick={() => { setEmailStep('idle'); setEmailError(''); }}>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </Button>
                          <Button type="submit" size="sm" className="flex-1" disabled={emailLoading || !newEmail.trim()}>
                            {emailLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5 mr-1.5" />}
                            Send confirmation
                          </Button>
                        </div>
                      </form>
                    )}

                    {emailStep === 'sent' && (
                      <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 rounded-lg px-3 py-2">
                        <Check className="w-4 h-4 shrink-0" />
                        Confirmation link sent to <strong className="ml-1">{newEmail}</strong>. Click it to confirm the change.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PRIVACY */}
              {activeTab === 'privacy' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{t('settings_privacy_desc')}</p>
                  <div className="flex flex-col gap-2">
                    <a href="/polityka-prywatnosci" target="_blank" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                      <Shield className="w-4 h-4" /> {t('privacy')}
                    </a>
                    <a href="/regulamin" target="_blank" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                      <Shield className="w-4 h-4" /> {t('terms')}
                    </a>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="p-4 rounded-xl border border-[hsl(var(--glass-border))] bg-muted/20">
                    <p className="text-sm font-medium text-foreground mb-1">{t('settings_data_export')}</p>
                    <p className="text-xs text-muted-foreground mb-3">{t('settings_data_export_desc')}</p>
                    <Button variant="outline" size="sm">{t('settings_data_export_btn')}</Button>
                  </div>
                </div>
              )}

              {/* BILLING */}
              {activeTab === 'billing' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[hsl(var(--glass-border))] bg-card/40">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex h-2.5 w-2.5 rounded-full ring-2 ${SUB_DOT[subStatus]} animate-pulse`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{t(SUB_STATUS_KEY[subStatus])}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t('settings_billing_manage_desc')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {subStatus === 'active' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => updateSub('paused')}>{t('settings_billing_pause')}</Button>
                          <Button size="sm" variant="outline" onClick={() => updateSub('cancelled')}>{t('settings_billing_cancel')}</Button>
                        </>
                      )}
                      {subStatus === 'paused' && (
                        <>
                          <Button size="sm" onClick={() => updateSub('active')}>{t('settings_billing_resume')}</Button>
                          <Button size="sm" variant="outline" onClick={() => updateSub('cancelled')}>{t('settings_billing_cancel')}</Button>
                        </>
                      )}
                      {subStatus === 'cancelled' && (
                        <Button size="sm" onClick={() => updateSub('active')}>{t('settings_billing_resume')}</Button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-semibold">{t('settings_billing_history')}</p>
                    <div className="flex items-center gap-2">
                      <select
                        value={exportFormat}
                        onChange={e => setExportFormat(e.target.value as 'csv' | 'json')}
                        className="rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                      </select>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={downloadHistory}>
                        <Download className="w-3 h-3" /> {t('settings_billing_download')}
                      </Button>
                    </div>
                  </div>

                  {subHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('settings_billing_no_history')}</p>
                  ) : (
                    <div className="space-y-2">
                      {subHistory.map((item, i) => (
                        <div key={item.timestamp + i} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[hsl(var(--glass-border))] bg-muted/20 text-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`inline-flex h-2 w-2 shrink-0 rounded-full ring-2 ${SUB_DOT[item.status]}`} />
                            <span className="font-medium text-foreground truncate">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t(SUB_STATUS_KEY[item.status])}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-[hsl(var(--glass-border))] pt-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-2.5">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Withdrawal from contract</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            As a consumer you have the right to withdraw from the contract within 14 days of conclusion, without giving a reason.
                          </p>
                        </div>
                      </div>
                      {withdrawalStatus !== 'sent' && (
                        <Button size="sm" variant="outline" className="shrink-0" onClick={() => setShowWithdrawal(v => !v)}>
                          {showWithdrawal ? 'Cancel' : 'Submit declaration'}
                        </Button>
                      )}
                    </div>

                    {showWithdrawal && withdrawalStatus !== 'sent' && (
                      <div className="space-y-3 p-4 rounded-xl border border-[hsl(var(--glass-border))] bg-muted/20">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Fill in the form below. The declaration will be sent to <strong>kontakt@bitbrew.pl</strong>.
                        </p>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">Name of service you are withdrawing from *</label>
                          <Input value={withdrawalService} onChange={e => setWithdrawalService(e.target.value)} placeholder="e.g. Solo / Growth / Enterprise subscription" className="text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">Contract date *</label>
                          <Input type="date" value={withdrawalDate} onChange={e => setWithdrawalDate(e.target.value)} className="text-sm" />
                        </div>
                        {withdrawalStatus === 'error' && (
                          <p className="text-xs text-destructive">An error occurred while sending. Try again or write directly to <strong>kontakt@bitbrew.pl</strong>.</p>
                        )}
                        <Button size="sm" onClick={handleWithdrawal} disabled={!withdrawalService.trim() || !withdrawalDate || withdrawalStatus === 'sending'} className="w-full gap-1.5">
                          {withdrawalStatus === 'sending'
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                            : <><Mail className="w-3.5 h-3.5" /> Send withdrawal declaration</>}
                        </Button>
                      </div>
                    )}

                    {withdrawalStatus === 'sent' && (
                      <div className="flex flex-col items-center gap-2 py-5 text-center p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        <p className="text-sm font-medium text-foreground">Declaration sent</p>
                        <p className="text-xs text-muted-foreground max-w-xs">Confirmation has been sent to your email address. We will respond within 14 days.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
