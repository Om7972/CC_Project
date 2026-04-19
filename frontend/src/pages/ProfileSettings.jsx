import React from 'react';
import { FeatureShell } from './_FeatureShell';
import { Avatar, Badge, Button, Input } from '../design-system/components';

const tabs = ['Profile', 'Security', 'Notifications', 'Billing', 'Appearance'];

export function ProfileSettingsPage() {
  const [active, setActive] = React.useState('Profile');
  const [saved, setSaved] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState('CloudMart User');

  return (
    <FeatureShell title="Profile Settings" subtitle="Manage your account, billing, security, and appearance.">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActive(tab)} className={`mb-2 w-full rounded-xl px-3 py-2 text-left ${active === tab ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-slate-800'}`}>
              {tab}
            </button>
          ))}
        </aside>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          {active === 'Profile' && (
            <div className="space-y-4">
              <Avatar name={name} size="xl" status="online" badge="Pro" />
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" />
              <Input placeholder="Bio" />
              <Button loading={loading} success={saved} onClick={async () => {
                setSaved(false);
                setLoading(true);
                await new Promise((r) => setTimeout(r, 800));
                setLoading(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 1200);
              }}>
                Save profile
              </Button>
            </div>
          )}
          {active === 'Security' && <div className="space-y-3 text-slate-300"><p>Password strength meter + 2FA flow enabled section.</p><Badge>active</Badge></div>}
          {active === 'Notifications' && <p className="text-slate-300">Email alerts, order updates, vendor messages, promotions, and digest toggles.</p>}
          {active === 'Billing' && <p className="text-slate-300">Stripe billing management and invoice history section.</p>}
          {active === 'Appearance' && <p className="text-slate-300">Theme, language, and currency preferences.</p>}
        </div>
      </div>
    </FeatureShell>
  );
}
