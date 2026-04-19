import React from 'react';
import { FeatureShell } from './_FeatureShell';
import { Avatar, Badge, Input, Button } from '../design-system/components';

export function ChatPage() {
  const [text, setText] = React.useState('');
  const [messages, setMessages] = React.useState([{ id: 1, from: 'vendor', text: 'Hello! Need help with this product?' }]);
  return (
    <FeatureShell title="Chat" subtitle="Real-time buyer-vendor conversations.">
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center gap-2"><Avatar name="Vendor Team" status="online" /><div><p className="text-white">Vendor Team</p><Badge>active</Badge></div></div>
        </aside>
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="mb-4 space-y-2">
            {messages.map((m) => <p key={m.id} className="rounded-xl bg-slate-800 px-3 py-2 text-slate-200">{m.text}</p>)}
          </div>
          <div className="flex gap-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type message..." />
            <Button onClick={() => { if (!text.trim()) return; setMessages((v) => [...v, { id: Date.now(), from: 'me', text }]); setText(''); }}>Send</Button>
          </div>
        </section>
      </div>
    </FeatureShell>
  );
}
