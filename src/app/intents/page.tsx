import Field from '@/components/Field';
import Button from '@/components/Button';
import type { Metadata } from 'next';
import { createIntentAction } from './actions';

export const metadata: Metadata = {
  title: 'Intenção de participação — Networking',
};

export default function IntentPage() {
  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Intenção de Participação</h1>
        <p className="muted">Preencha seus dados e nossa equipe avaliará sua solicitação.</p>

        <form action={createIntentAction} style={{ marginTop: 12 }}>
          <div className="form-grid">
            <Field label="Nome" name="name" placeholder="Seu nome completo" />
            <Field label="E-mail" name="email" type="email" placeholder="seu@exemplo.com" />
            <Field label="Empresa" name="company" placeholder="Nome da empresa" />
          </div>

          <div style={{ marginTop: 12 }}>
            <Field label="Por que quer participar?" name="message" as="textarea" rows={4} />
          </div>

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit">Enviar intenção</Button>
          </div>
        </form>
      </div>
    </main>
  );
}
