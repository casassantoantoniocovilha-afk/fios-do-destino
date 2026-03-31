'use client';

import { useState } from 'react';
import { formatTime } from '@/lib/utils';

export default function ChatPanel({ messages, onSend, disabled }) {
  const [text, setText] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    await onSend(value);
    setText('');
  }

  return (
    <>
      <div className="card panel chat-window">
        {messages.length ? messages.map((message) => (
          <div key={message.id || `${message.sender_id}-${message.created_at}`}>
            <div className={`message ${message.isMine ? 'me' : 'them'}`}>{message.content}</div>
            <div className="helper" style={{ textAlign: message.isMine ? 'right' : 'left', marginTop: 4 }}>{formatTime(message.created_at)}</div>
          </div>
        )) : <div className="helper">Ainda não há mensagens.</div>}
      </div>

      <form onSubmit={handleSubmit} className="card panel" style={{ marginTop: 12 }}>
        <div className="field" style={{ marginBottom: 10 }}>
          <label>Mensagem</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreve uma mensagem sincera..." />
        </div>
        <button className="button" disabled={disabled} type="submit">Enviar</button>
      </form>
    </>
  );
}
