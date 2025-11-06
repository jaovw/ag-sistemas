import { Suspense } from 'react';
import { intentService } from '@/server/services/intentService';
import Spinner from '@/components/Spinner';
import Button from '@/components/Button';
import type { Metadata } from 'next';
import { approveIntentAction, rejectIntentAction } from './actions';

export const metadata: Metadata = {
  title: 'Admin - Intenções',
};

function IntentList({ adminSecret }: { adminSecret: string }) {
  const intents = intentService.listIntents();
  return <IntentListAsync promise={intents} adminSecret={adminSecret} />;
}

async function IntentListAsync({
  promise,
  adminSecret,
}: {
  promise: Promise<any[]>;
  adminSecret: string;
}) {
  const list = await promise;
  if (!list || list.length === 0) {
    return <div className="muted">Nenhuma intenção pendente.</div>;
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {list.map((it: any) => (
        <div className="intent-item" key={it.id}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{it.name}</div>
            <div className="muted">{it.email} • {it.company ?? '-'}</div>
            <div style={{ marginTop: 8 }}>{it.message}</div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {it.status === 'PENDING' ? (
              <>
                <form action={approveIntentAction}>
                  <input type="hidden" name="id" value={String(it.id)} />
                  <input type="hidden" name="adminSecret" value={adminSecret} />
                  <Button type="submit">Aprovar</Button>
                </form>

                <form action={rejectIntentAction}>
                  <input type="hidden" name="id" value={String(it.id)} />
                  <input type="hidden" name="adminSecret" value={adminSecret} />
                  <Button type="submit" variant="ghost">Recusar</Button>
                </form>
              </>
            ) : (
              <div className="muted">{it.status}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ adminSecret?: string }>;
}) {
  const resolved = await searchParams;
  const adminSecret = String(resolved?.adminSecret ?? '');

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return (
      <main className="container">
        <div className="card" style={{ maxWidth: 720, margin:'0 auto' }}>
          <h1>Área do Administrador</h1>
          <p className="muted">Página protegida. Adicione <code>?adminSecret=SEU_SECRET</code> na URL.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 920, margin: '0 auto' }}>
        <h1>Admin — Intenções</h1>
        <p className="muted">Revise e aprove ou recuse as intenções.</p>

        <Suspense fallback={<Spinner />}>
          <IntentList adminSecret={adminSecret} />
        </Suspense>
      </div>
    </main>
  );
}
