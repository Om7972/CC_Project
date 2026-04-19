import React from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { FeatureShell } from './_FeatureShell';
import { Badge, Button } from '../design-system/components';
import { staggerChildren, scaleIn } from '../design-system/animations';

const plans = [
  { name: 'Free', monthly: 0, yearly: 0, features: ['5 products max', 'Basic support'] },
  { name: 'Pro', monthly: 19, yearly: 182, features: ['Unlimited products', 'Analytics', 'Priority support'] },
  { name: 'Enterprise', monthly: 79, yearly: 758, features: ['API access', 'Dedicated support', 'White-label'] },
];

export function SubscriptionPage() {
  const [annual, setAnnual] = React.useState(false);
  return (
    <FeatureShell title="Subscriptions" subtitle="Choose a plan and scale your store.">
      <div className="flex items-center gap-3">
        <span className={!annual ? 'text-cyan-300' : 'text-slate-400'}>Monthly</span>
        <button onClick={() => setAnnual((v) => !v)} className="relative h-7 w-14 rounded-full bg-slate-700">
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-cyan-400 transition-all ${annual ? 'left-8' : 'left-1'}`} />
        </button>
        <span className={annual ? 'text-cyan-300' : 'text-slate-400'}>Annual</span>
        {annual && <Badge animate>Save 20%</Badge>}
      </div>
      <motion.div variants={staggerChildren} initial="initial" animate="animate" className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <motion.div key={plan.name} variants={scaleIn} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
              {plan.name === 'Pro' && <Badge>Pro</Badge>}
            </div>
            <p className="text-3xl font-bold text-cyan-300">${annual ? plan.yearly : plan.monthly}</p>
            <ul className="my-4 space-y-2 text-sm text-slate-300">{plan.features.map((f) => <li key={f}>- {f}</li>)}</ul>
            <Button onClick={() => confetti({ particleCount: 90, spread: 80 })}>Choose {plan.name}</Button>
          </motion.div>
        ))}
      </motion.div>
    </FeatureShell>
  );
}
