import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

const TABS = ['General', 'Branding', 'Account'];

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('General');
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      orgName:   user?.organizationName ?? 'Acme Corp',
      orgDomain: 'acmecorp.com',
    },
  });

  async function onSubmit(data) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    updateUser({ organizationName: data.orgName });
    toast.success('Settings saved!');
    setSaving(false);
  }

  return (
    <div className="ml-0 p-margin flex justify-center min-h-[calc(100vh-56px)]">
      <div className="max-w-[640px] w-full flex flex-col gap-xl">
        <header>
          <h1 className="text-headline-xl text-on-surface mb-xs">Organization Settings</h1>
          <p className="text-body-md text-on-surface-variant">Manage your workspace identity and administrative controls.</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-lg border-b border-outline-variant">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-md px-xs text-label-md transition-colors ${
                activeTab === tab
                  ? 'font-bold text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'General' && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-xl">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-xl">
              {/* Org fields */}
              <section className="flex flex-col gap-lg">
                <div className="flex flex-col gap-xs">
                  <label className="text-label-md text-on-surface-variant" htmlFor="orgName">Organization Name</label>
                  <input
                    id="orgName"
                    className="h-12 px-md rounded-lg border border-outline-variant bg-surface-bright focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-body-md"
                    {...register('orgName')}
                  />
                  <p className="text-[11px] text-on-surface-variant">This is your public-facing team name within Columbus.</p>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-label-md text-on-surface-variant" htmlFor="orgDomain">Email Domain</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-md text-on-surface-variant text-body-md select-none">@</span>
                    <input
                      id="orgDomain"
                      className="w-full h-12 pl-xl pr-md rounded-lg border border-outline-variant bg-surface-bright focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-body-md"
                      {...register('orgDomain')}
                    />
                  </div>
                  <p className="text-[11px] text-on-surface-variant">Used for automatic SSO and user discovery.</p>
                </div>
              </section>

              {/* Info tiles */}
              <div className="grid grid-cols-2 gap-md">
                <div className="p-md bg-surface-container-low rounded-lg border border-outline-variant/30">
                  <div className="flex items-center gap-sm mb-xs">
                    <Icon name="verified" size={20} className="text-primary" />
                    <span className="text-label-md text-on-surface">Verification Status</span>
                  </div>
                  <p className="text-body-md text-on-surface-variant">Domain verified via DNS. Secure onboarding active.</p>
                </div>
                <div className="p-md bg-surface-container-low rounded-lg border border-outline-variant/30">
                  <div className="flex items-center gap-sm mb-xs">
                    <Icon name="language" size={20} className="text-secondary" />
                    <span className="text-label-md text-on-surface">Region</span>
                  </div>
                  <p className="text-body-md text-on-surface-variant">United States (West) — Low latency enabled.</p>
                </div>
              </div>

              {/* Footer */}
              <footer className="pt-lg border-t border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-xs text-on-surface-variant">
                  <Icon name="history" size={18} />
                  <span className="text-label-md">Last changed 2 days ago</span>
                </div>
                <Button type="submit" size="lg" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </footer>
            </div>
          </form>
        )}

        {activeTab === 'Branding' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center text-center min-h-[300px] gap-md">
            <Icon name="palette" size={48} className="text-outline" />
            <h3 className="text-headline-md text-on-surface">Branding Settings</h3>
            <p className="text-body-md text-on-surface-variant max-w-sm">Upload your logo, set brand colors, and customize the new hire portal experience.</p>
            <Button variant="secondary">Upload Logo</Button>
          </div>
        )}

        {activeTab === 'Account' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl flex flex-col gap-lg">
            <h3 className="text-headline-md text-on-surface">Account</h3>
            <div className="flex flex-col gap-sm">
              <Input label="Your Name" defaultValue={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()} />
              <Input label="Email Address" type="email" defaultValue={user?.email ?? ''} />
            </div>
            <div className="pt-lg border-t border-outline-variant flex justify-end">
              <Button onClick={() => toast.success('Account updated!')}>Save Account</Button>
            </div>
          </div>
        )}

        {/* System info */}
        <div>
          <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-md">System Information</h3>
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md flex items-center justify-between">
            <div className="flex items-center gap-md">
              <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center text-error">
                <Icon name="database" size={20} />
              </div>
              <div>
                <p className="text-label-md font-semibold text-on-surface">Data Residency</p>
                <p className="text-body-md text-on-surface-variant">Your data is stored in AWS us-east-1.</p>
              </div>
            </div>
            <button className="text-label-md text-primary font-semibold hover:underline">Manage</button>
          </div>
        </div>
      </div>
    </div>
  );
}
