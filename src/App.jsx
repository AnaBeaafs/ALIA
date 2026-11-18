import { useEffect, useRef, useState } from 'react'
import Icon from './Icons.jsx'

const UNITS = [
  { id: 'u1', name: 'Segurança Hotel Premium', kind: 'Segurança de hotel', area: 'Centro' },
  { id: 'u2', name: 'Delegacia da Mulher', kind: 'Polícia', area: 'Região' },
  { id: 'u3', name: 'Ronda do bairro', kind: 'Vigilância', area: 'Jardim' },
]

const STATUS = {
  waiting: 'Aguardando quem aceitar',
  accepted: 'Profissional identificado',
  in_progress: 'Atendimento em andamento',
  finished: 'Finalizada',
  cancelled: 'Cancelada',
}

const STEPS = ['waiting', 'accepted', 'in_progress']

const DEMO = {
  name: 'Ana Beatriz',
  email: 'ana.beatriz@email.com',
  phone: '+55 19 99999-0000',
  city: 'Hortolândia, SP',
  password: '1234',
}

function stamp(text) {
  return { at: new Date().toISOString(), text }
}

function initials(name) {
  return (name || 'A')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatRemaining(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const seedContacts = [
  { id: 'c1', name: 'Maria Silva', phone: '(19) 98888-1111', relation: 'Mãe', alert: true },
  { id: 'c2', name: 'João Santos', phone: '(19) 97777-2222', relation: 'Irmão', alert: true },
  { id: 'c3', name: 'Carla Mendes', phone: '(19) 96666-3333', relation: 'Amiga', alert: false },
]

const seedPlaces = [
  { id: 'p1', label: 'Casa', address: 'Hortolândia, SP' },
  { id: 'p2', label: 'Trabalho', address: 'Colégio, Hortolândia' },
  { id: 'p3', label: 'Faculdade', address: 'Centro, Campinas' },
]

export default function App() {
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('home')
  const [role, setRole] = useState('woman')
  const [sheet, setSheet] = useState(null)
  const [contacts, setContacts] = useState(seedContacts)
  const [places, setPlaces] = useState(seedPlaces)
  const [activePlaceId, setActivePlaceId] = useState('p1')
  const [occurrences, setOccurrences] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [deviceConnected, setDeviceConnected] = useState(false)
  const [deviceBattery, setDeviceBattery] = useState(null)
  const [checkInUntil, setCheckInUntil] = useState(null)
  const [shareLocation, setShareLocation] = useState(true)
  const [notifyContacts, setNotifyContacts] = useState(true)
  const [unitId, setUnitId] = useState('u1')
  const [editingContact, setEditingContact] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', relation: '', alert: true })
  const [placeForm, setPlaceForm] = useState({ label: '', address: '' })
  const [holding, setHolding] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [toast, setToast] = useState('')
  const [loginEmail, setLoginEmail] = useState(DEMO.email)
  const [loginPass, setLoginPass] = useState(DEMO.password)
  const [loginError, setLoginError] = useState('')
  const holdTimer = useRef(null)
  const holdTick = useRef(null)
  const holdStart = useRef(0)
  const [, setTick] = useState(0)

  const active = occurrences.find((o) => o.id === activeId)
  const activePlace = places.find((p) => p.id === activePlaceId)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  useEffect(() => {
    if (!checkInUntil) return
    const id = setInterval(() => {
      setTick((t) => t + 1)
      if (Date.now() >= checkInUntil) {
        clearInterval(id)
        setCheckInUntil(null)
        triggerSos('Check-in não confirmado a tempo')
      }
    }, 250)
    return () => clearInterval(id)
  }, [checkInUntil])

  useEffect(() => {
    if (!active || active.status !== 'waiting') return
    const t = setTimeout(() => {
      setOccurrences((list) =>
        list.map((o) =>
          o.id === active.id && o.status === 'waiting'
            ? {
                ...o,
                status: 'accepted',
                acceptedBy: { name: 'Delegacia da região', kind: 'Encaminhamento automático' },
                events: [...(o.events || []), stamp('Encaminhado automaticamente à delegacia')],
              }
            : o,
        ),
      )
      showToast('Ninguém aceitou a tempo · encaminhado à delegacia')
    }, 18000)
    return () => clearTimeout(t)
  }, [active?.id, active?.status])

  function triggerSos(reason = 'Botão SOS pressionado') {
    const place = activePlace ?? places[0]
    const warned = contacts.filter((c) => c.alert).map((c) => c.name)
    const id = `ALIA-${Date.now().toString(36).toUpperCase()}`
    const occ = {
      id,
      createdAt: new Date().toISOString(),
      status: 'waiting',
      reason,
      placeLabel: place?.label,
      address: shareLocation ? place?.address ?? 'Hortolândia, SP' : 'Local oculto',
      events: [
        stamp(reason),
        stamp(shareLocation ? `Local: ${place?.address}` : 'Localização desligada'),
        stamp(
          notifyContacts && warned.length
            ? `Rede avisada: ${warned.join(', ')}`
            : 'Nenhum contato de alerta',
        ),
        stamp('Na fila da região · quem aceitar primeiro assume'),
      ],
    }
    setOccurrences((prev) => [occ, ...prev])
    setActiveId(id)
    setSheet('emergency')
    setTab('home')
    setRole('woman')
    setCheckInUntil(null)
    showToast('Alerta enviado para a região')
    if (navigator.vibrate) navigator.vibrate([40, 30, 40])
  }

  function acceptAlert(occId) {
    const unit = UNITS.find((u) => u.id === unitId)
    let ok = false
    setOccurrences((list) =>
      list.map((o) => {
        if (o.id !== occId) return o
        if (['accepted', 'in_progress', 'finished', 'cancelled'].includes(o.status)) return o
        ok = true
        return {
          ...o,
          status: 'accepted',
          acceptedBy: { name: unit.name, kind: unit.kind },
          events: [...(o.events || []), stamp(`${unit.name} aceitou a ocorrência`)],
        }
      }),
    )
    showToast(ok ? `${unit.name} assumiu` : 'Já foi assumida por outro')
  }

  function setStatus(id, status) {
    setOccurrences((list) =>
      list.map((o) =>
        o.id === id
          ? { ...o, status, events: [...(o.events || []), stamp(STATUS[status] || status)] }
          : o,
      ),
    )
    if (status === 'finished' || status === 'cancelled') {
      setActiveId(null)
      setSheet(null)
      showToast(status === 'finished' ? 'Ocorrência finalizada' : 'Alerta cancelado')
    }
  }

  function startHold(e) {
    e.preventDefault()
    clearHold()
    setHolding(true)
    setHoldProgress(0)
    holdStart.current = Date.now()
    holdTick.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - holdStart.current) / 1200)
      setHoldProgress(p)
    }, 30)
    holdTimer.current = setTimeout(() => {
      clearHold()
      setHolding(false)
      setHoldProgress(0)
      triggerSos()
    }, 1200)
  }

  function clearHold() {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    if (holdTick.current) clearInterval(holdTick.current)
    holdTimer.current = null
    holdTick.current = null
  }

  function endHold() {
    clearHold()
    setHolding(false)
    setHoldProgress(0)
  }

  function doLogin(e) {
    e?.preventDefault()
    setLoginError('')
    if (!loginEmail.trim() || loginPass.trim().length < 4) {
      setLoginError('Informe e-mail e senha (mín. 4 caracteres).')
      return
    }
    setUser({ ...DEMO, email: loginEmail.trim() })
    showToast(`Bem-vinda, ${DEMO.name.split(' ')[0]}`)
  }

  function saveContact() {
    if (!form.name.trim() || !form.phone.trim()) {
      showToast('Preencha nome e telefone')
      return
    }
    if (editingContact) {
      setContacts((list) => list.map((c) => (c.id === editingContact ? { ...c, ...form } : c)))
      showToast('Contato atualizado')
    } else {
      setContacts((list) => [{ id: `c-${Date.now()}`, ...form }, ...list])
      showToast('Contato adicionado')
    }
    setSheet(null)
    setEditingContact(null)
    setForm({ name: '', phone: '', relation: '', alert: true })
  }

  /* ---------- LOGIN ---------- */
  if (!user) {
    return (
      <div className="app-shell">
        <div className="phone">
          <form className="login" onSubmit={doLogin}>
            <div className="login-mark">
              <Icon name="shieldCheck" size={28} />
            </div>
            <div className="logo" style={{ textAlign: 'center' }}>
              ALIA
            </div>
            <p className="muted" style={{ textAlign: 'center', margin: '8px 0 24px' }}>
              Alerta discreto · rede de apoio
            </p>
            <label className="tiny" style={{ display: 'block', marginBottom: 6 }}>
              E-MAIL
            </label>
            <input
              className="input"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
            />
            <label className="tiny" style={{ display: 'block', marginBottom: 6 }}>
              SENHA
            </label>
            <input
              className="input"
              type="password"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              autoComplete="current-password"
            />
            {loginError && (
              <p className="tiny" style={{ color: 'var(--danger)', marginBottom: 10 }}>
                {loginError}
              </p>
            )}
            <button type="submit" className="btn btn-rose">
              Entrar
            </button>
            <div className="demo-box">
              <div className="tiny" style={{ color: 'var(--rose-soft)', fontWeight: 600 }}>
                Conta demonstração
              </div>
              <div className="tiny" style={{ marginTop: 6 }}>
                {DEMO.name} · {DEMO.city}
              </div>
              <div className="tiny">{DEMO.email} · senha 1234</div>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail(DEMO.email)
                  setLoginPass(DEMO.password)
                  setUser({ ...DEMO })
                  showToast('Entrada rápida')
                }}
              >
                Entrar com conta demo
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  /* ---------- CENTRAL ---------- */
  if (role === 'desk') {
    const open = occurrences.filter((o) =>
      ['waiting', 'accepted', 'in_progress'].includes(o.status),
    )
    return (
      <div className="app-shell">
        <div className="phone">
          <div className="scroll">
            <div className="row" style={{ marginBottom: 14 }}>
              <button type="button" className="icon-btn" onClick={() => setRole('woman')}>
                <Icon name="arrowLeft" size={20} />
              </button>
              <div>
                <div className="h1" style={{ margin: 0, fontSize: 18 }}>
                  Central ALIA
                </div>
                <div className="tiny">Quem aceitar primeiro assume</div>
              </div>
            </div>
            <p className="tiny" style={{ letterSpacing: 1, marginBottom: 8 }}>
              ATUANDO COMO
            </p>
            {UNITS.map((u) => (
              <button
                key={u.id}
                type="button"
                className={`card pressable ${unitId === u.id ? 'chip on' : ''}`}
                style={{ width: '100%', textAlign: 'left', marginBottom: 8 }}
                onClick={() => setUnitId(u.id)}
              >
                <strong style={{ fontSize: 14 }}>{u.name}</strong>
                <div className="tiny">
                  {u.kind} · {u.area}
                </div>
              </button>
            ))}
            <div style={{ marginTop: 12 }}>
              {open.length === 0 && (
                <p className="empty">Fila vazia. Dispare um SOS no app da mulher.</p>
              )}
              {open.map((occ) => {
                const can = occ.status === 'waiting'
                return (
                  <div key={occ.id} className="card">
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: 12 }}>{occ.id}</strong>
                      <span className="tiny" style={{ color: 'var(--rose-soft)' }}>
                        {STATUS[occ.status]}
                      </span>
                    </div>
                    <div className="tiny" style={{ marginTop: 6 }}>
                      {occ.placeLabel ? `${occ.placeLabel} · ` : ''}
                      {occ.address}
                    </div>
                    {occ.acceptedBy && (
                      <div className="tiny" style={{ marginTop: 4, color: 'var(--ok)' }}>
                        {occ.acceptedBy.name}
                      </div>
                    )}
                    {can ? (
                      <button
                        type="button"
                        className="btn btn-rose"
                        style={{ marginTop: 12 }}
                        onClick={() => acceptAlert(occ.id)}
                      >
                        Aceitar primeiro
                      </button>
                    ) : (
                      <div className="row" style={{ marginTop: 12 }}>
                        {occ.status === 'accepted' && (
                          <button
                            type="button"
                            className="btn btn-soft"
                            style={{ flex: 1 }}
                            onClick={() => setStatus(occ.id, 'in_progress')}
                          >
                            Em rota
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-soft"
                          style={{ flex: 1 }}
                          onClick={() => setStatus(occ.id, 'finished')}
                        >
                          Finalizar
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <button type="button" className="btn btn-ghost" onClick={() => setRole('woman')}>
              Voltar ao app
            </button>
          </div>
          {toast && <div className="toast">{toast}</div>}
        </div>
      </div>
    )
  }

  /* ---------- APP ---------- */
  return (
    <div className="app-shell">
      <div className="phone">
        <div className="scroll" key={tab}>
          {tab === 'home' && (
            <>
              <div className="topbar">
                <div>
                  <div className="logo">ALIA</div>
                  <div className="greet">
                    {greeting()}, {user.name.split(' ')[0]}
                  </div>
                </div>
                <div className={`pill ${deviceConnected ? 'ok' : ''}`}>
                  <Icon name={deviceConnected ? 'dot' : 'dotOutline'} size={9} strokeWidth={2} />
                  {deviceConnected ? `BLE ${deviceBattery}%` : 'Sem dispositivo'}
                </div>
              </div>

              <div className="card">
                <div className="card-title">
                  <Icon name="timer" size={16} /> Check-in de segurança
                </div>
                {checkInUntil ? (
                  <>
                    <div className="check-timer">{formatRemaining(checkInUntil - Date.now())}</div>
                    <p className="tiny">Confirme antes do prazo ou o SOS dispara.</p>
                    <button
                      type="button"
                      className="btn btn-rose"
                      style={{ marginTop: 10 }}
                      onClick={() => {
                        setCheckInUntil(null)
                        showToast('Check-in confirmado · você está bem')
                      }}
                    >
                      Estou bem
                    </button>
                  </>
                ) : (
                  <>
                    <p className="tiny" style={{ marginTop: 6 }}>
                      Ideal ao sair sozinha. Toque no prazo:
                    </p>
                    <div className="grid3" style={{ marginTop: 10 }}>
                      {[5, 15, 30].map((m) => (
                        <button
                          key={m}
                          type="button"
                          className="chip"
                          onClick={() => {
                            setCheckInUntil(Date.now() + m * 60_000)
                            showToast(`Check-in de ${m} min iniciado`)
                          }}
                        >
                          {m} min
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="sos-section">
                <div className="sos-orbit">
                  <div className="sos-ring" />
                  <div className="sos-ring r2" />
                  {holding && (
                    <div
                      className="sos-progress"
                      style={{ '--p': `${holdProgress * 100}%` }}
                    />
                  )}
                  <button
                    type="button"
                    className={`sos-btn ${holding ? 'holding' : ''}`}
                    onPointerDown={startHold}
                    onPointerUp={endHold}
                    onPointerLeave={endHold}
                    onPointerCancel={endHold}
                    onContextMenu={(e) => e.preventDefault()}
                    aria-label="Botão SOS, segure para acionar"
                  >
                    <span className="sos-label">SOS</span>
                    <span className="sos-hint">{holding ? 'Solte cancela' : 'Segure 1s'}</span>
                  </button>
                </div>
                <p className="sos-caption">
                  Local:{' '}
                  <strong style={{ color: 'var(--paper)' }}>
                    {shareLocation ? activePlace?.label ?? '—' : 'oculto'}
                  </strong>
                  {' · '}toque longo evita acionamento acidental
                </p>
              </div>

              <div className="grid2">
                <div className="card stat">
                  <div className="tiny">Dispositivo</div>
                  <strong style={{ color: deviceConnected ? 'var(--ok)' : undefined }}>
                    {deviceConnected ? 'Conectado' : 'Off'}
                  </strong>
                </div>
                <button
                  type="button"
                  className="card stat pressable"
                  onClick={() => setSheet('places')}
                >
                  <div className="tiny">Lugar ativo</div>
                  <strong>{activePlace?.label ?? '—'}</strong>
                </button>
              </div>

              <div className="grid4" style={{ marginBottom: 8 }}>
                {[
                  { label: 'Rede', ico: <Icon name="users" size={16} />, go: () => setTab('contacts') },
                  { label: 'Lugares', ico: <Icon name="mapPin" size={16} />, go: () => setSheet('places') },
                  { label: 'Histórico', ico: <Icon name="clock" size={16} />, go: () => setSheet('history') },
                  { label: 'Central', ico: <Icon name="shield" size={16} />, go: () => setRole('desk') },
                ].map((a) => (
                  <button key={a.label} type="button" className="qa" onClick={a.go}>
                    <span className="qa-ico">{a.ico}</span>
                    <span>{a.label}</span>
                  </button>
                ))}
              </div>

              {active && !['finished', 'cancelled'].includes(active.status) && (
                <button type="button" className="banner" onClick={() => setSheet('emergency')}>
                  <span className="dot" />
                  <span style={{ flex: 1 }}>Emergência · {STATUS[active.status]}</span>
                  <Icon name="chevronRight" size={16} className="chev" />
                </button>
              )}
            </>
          )}

          {tab === 'security' && (
            <>
              <h1 className="h1">Segurança</h1>
              <p className="muted">Canais e atalhos rápidos</p>
              <button
                type="button"
                className="card pressable"
                style={{ marginTop: 12, width: '100%', textAlign: 'left' }}
                onClick={() => {
                  setCheckInUntil(Date.now() + 15 * 60_000)
                  setTab('home')
                  showToast('Check-in 15 min')
                }}
              >
                <div className="card-title">
                  <Icon name="timer" size={16} /> Check-in 15 min
                </div>
                <div className="tiny">SOS se não confirmar</div>
              </button>
              <a className="card pressable" style={{ display: 'block' }} href="tel:180">
                <div className="card-title">
                  <Icon name="phone" size={16} /> Central 180
                </div>
                <div className="tiny">Disque Denúncia</div>
              </a>
              <a className="card pressable" style={{ display: 'block' }} href="tel:190">
                <div className="card-title">
                  <Icon name="siren" size={16} /> Polícia 190
                </div>
                <div className="tiny">Emergência imediata</div>
              </a>
              <button
                type="button"
                className="card pressable"
                style={{ width: '100%', textAlign: 'left' }}
                onClick={() => setSheet('device')}
              >
                <div className="card-title">
                  <Icon name="radio" size={16} /> Dispositivo físico
                </div>
                <div className="tiny">Pareamento BLE simulado</div>
              </button>
              <button
                type="button"
                className="card pressable"
                style={{ width: '100%', textAlign: 'left' }}
                onClick={() => setRole('desk')}
              >
                <div className="card-title">
                  <Icon name="shield" size={16} /> Central de atendimento
                </div>
                <div className="tiny">Aceitar ocorrências (estilo Uber)</div>
              </button>
            </>
          )}

          {tab === 'location' && (
            <>
              <h1 className="h1">Localização</h1>
              <p className="muted">
                {active ? 'Ponto do alerta (demo)' : 'Referência do lugar ativo'}
              </p>
              <div className="map">
                <div className="pin" style={{ left: '42%', top: '52%' }}>
                  <div className="bubble">Você</div>
                  <div className="point" />
                </div>
                {active?.acceptedBy && (
                  <div className="pin" style={{ left: '68%', top: '32%' }}>
                    <div className="bubble" style={{ background: 'var(--panel2)', color: 'var(--ok)' }}>
                      Apoio
                    </div>
                    <div className="point" style={{ background: 'var(--ok)' }} />
                  </div>
                )}
              </div>
              <div className="card">
                <div className="tiny">Endereço de referência</div>
                <strong style={{ fontSize: 14 }}>
                  {active?.address ?? activePlace?.address ?? 'Hortolândia, SP'}
                </strong>
              </div>
              <button type="button" className="btn btn-soft" onClick={() => setSheet('places')}>
                Gerenciar lugares seguros
              </button>
            </>
          )}

          {tab === 'contacts' && (
            <>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <h1 className="h1">Minha rede</h1>
                  <p className="muted">Quem recebe o alerta</p>
                </div>
                <button
                  type="button"
                  className="btn btn-rose"
                  style={{ width: 'auto', minHeight: 40, borderRadius: 999, padding: '0 14px' }}
                  onClick={() => {
                    setEditingContact(null)
                    setForm({ name: '', phone: '', relation: '', alert: true })
                    setSheet('contact')
                  }}
                >
                  + Novo
                </button>
              </div>
              {contacts.length === 0 && <p className="empty">Nenhum contato ainda.</p>}
              {contacts.map((c) => (
                <div key={c.id} className="list-item">
                  <button
                    type="button"
                    style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 12, textAlign: 'left' }}
                    onClick={() => {
                      setEditingContact(c.id)
                      setForm({
                        name: c.name,
                        phone: c.phone,
                        relation: c.relation || '',
                        alert: c.alert,
                      })
                      setSheet('contact')
                    }}
                  >
                    <div className="avatar">{initials(c.name)}</div>
                    <div>
                      <strong style={{ fontSize: 14 }}>{c.name}</strong>
                      <div className="tiny">{c.phone}</div>
                      <div className="tiny" style={{ color: 'var(--rose-soft)' }}>
                        {c.relation}
                        {c.alert ? ' · recebe alerta' : ' · sem alerta'}
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ width: 36, height: 36 }}
                    onClick={() => {
                      setContacts((list) => list.filter((x) => x.id !== c.id))
                      showToast('Contato removido')
                    }}
                    aria-label="Remover"
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              ))}
            </>
          )}

          {tab === 'profile' && (
            <>
              <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
                <div className="avatar lg">{initials(user.name)}</div>
                <div className="h1" style={{ marginBottom: 2 }}>
                  {user.name}
                </div>
                <div className="muted">{user.email}</div>
                <div className="tiny" style={{ marginTop: 4 }}>
                  {user.phone} · {user.city}
                </div>
              </div>
              <div className="card">
                <div className="switch-row">
                  <div>
                    <strong style={{ fontSize: 14 }}>Compartilhar localização</strong>
                    <div className="tiny">Só quem aceitar vê o ponto</div>
                  </div>
                  <button
                    type="button"
                    className={`switch ${shareLocation ? 'on' : ''}`}
                    onClick={() => setShareLocation((v) => !v)}
                    aria-label="Alternar localização"
                  >
                    <i />
                  </button>
                </div>
                <div className="switch-row">
                  <div>
                    <strong style={{ fontSize: 14 }}>Avisar contatos</strong>
                    <div className="tiny">Rede marcada no SOS</div>
                  </div>
                  <button
                    type="button"
                    className={`switch ${notifyContacts ? 'on' : ''}`}
                    onClick={() => setNotifyContacts((v) => !v)}
                    aria-label="Alternar contatos"
                  >
                    <i />
                  </button>
                </div>
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <button type="button" className="menu-btn" onClick={() => setSheet('places')}>
                  Lugares seguros <Icon name="chevronRight" size={16} className="chev" />
                </button>
                <button type="button" className="menu-btn" onClick={() => setSheet('device')}>
                  Dispositivo físico <Icon name="chevronRight" size={16} className="chev" />
                </button>
                <button type="button" className="menu-btn" onClick={() => setSheet('history')}>
                  Histórico <Icon name="chevronRight" size={16} className="chev" />
                </button>
                <button type="button" className="menu-btn" onClick={() => setRole('desk')}>
                  Central de atendimento <Icon name="chevronRight" size={16} className="chev" />
                </button>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setUser(null)
                  setSheet(null)
                  setRole('woman')
                }}
              >
                Sair da conta
              </button>
            </>
          )}
        </div>

        {!sheet && (
          <nav className="tabs">
            {[
              ['home', <Icon name="home" size={20} />, 'Início'],
              ['security', <Icon name="shieldCheck" size={20} />, 'Segurança'],
              ['location', <Icon name="target" size={20} />, 'Local'],
              ['contacts', <Icon name="users" size={20} />, 'Contatos'],
              ['profile', <Icon name="user" size={20} />, 'Perfil'],
            ].map(([id, ico, label]) => (
              <button
                key={id}
                type="button"
                className={`tab ${tab === id ? 'on' : ''}`}
                onClick={() => setTab(id)}
              >
                <span className="ico">{ico}</span>
                {label}
              </button>
            ))}
          </nav>
        )}

        {sheet === 'emergency' && active && (
          <div className="sheet">
            <div className="sheet-h">
              <button type="button" className="icon-btn" onClick={() => setSheet(null)}>
                <Icon name="x" size={20} />
              </button>
              <strong>Emergência</strong>
              <span style={{ width: 40 }} />
            </div>
            <div className="sheet-body">
              <p className="status-title">{STATUS[active.status]}</p>
              <p className="tiny" style={{ textAlign: 'center', letterSpacing: 1 }}>
                {active.id}
              </p>
              <div className="steps">
                {STEPS.map((s, i) => {
                  const idx = STEPS.indexOf(active.status)
                  const on = idx >= i || active.status === 'finished'
                  return (
                    <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={`step ${on ? 'on' : ''}`} />
                      {i < STEPS.length - 1 && <span className={`step-line ${on ? 'on' : ''}`} />}
                    </span>
                  )
                })}
              </div>
              <div className="card">
                <div className="tiny">Local</div>
                <strong style={{ fontSize: 14 }}>{active.address}</strong>
              </div>
              <div className="card">
                <div className="tiny">Horário</div>
                <strong style={{ fontSize: 14 }}>
                  {new Date(active.createdAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>
              </div>
              {active.acceptedBy && (
                <div className="card" style={{ borderColor: 'rgba(61,214,140,.35)' }}>
                  <div className="tiny">Quem assumiu</div>
                  <strong style={{ color: 'var(--ok)', fontSize: 14 }}>{active.acceptedBy.name}</strong>
                  <div className="tiny">{active.acceptedBy.kind}</div>
                </div>
              )}
              <p className="tiny" style={{ letterSpacing: 1, marginTop: 12 }}>
                LINHA DO TEMPO
              </p>
              <div className="timeline">
                {(active.events || []).map((ev, i) => (
                  <div key={i} className="t-item">
                    <span className="t-dot" />
                    <div>
                      <div style={{ fontSize: 13 }}>{ev.text}</div>
                      <div className="tiny">
                        {new Date(ev.at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {active.status === 'waiting' && (
                <button
                  type="button"
                  className="btn btn-rose"
                  style={{ marginTop: 12 }}
                  onClick={() => {
                    setRole('desk')
                    setSheet(null)
                  }}
                >
                  Abrir central e aceitar
                </button>
              )}
              {!['finished', 'cancelled'].includes(active.status) && (
                <>
                  <button
                    type="button"
                    className="btn btn-soft"
                    style={{ marginTop: 8 }}
                    onClick={() => setStatus(active.id, 'finished')}
                  >
                    Encerrar (estou segura)
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setStatus(active.id, 'cancelled')}
                  >
                    Cancelar alerta
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {sheet === 'device' && (
          <div className="sheet">
            <div className="sheet-h">
              <button type="button" className="icon-btn" onClick={() => setSheet(null)}>
                <Icon name="x" size={20} />
              </button>
              <strong>Dispositivo</strong>
              <span style={{ width: 40 }} />
            </div>
            <div className="sheet-body">
              <p className="muted">Pareamento Bluetooth simulado nesta demo.</p>
              <div className="card" style={{ marginTop: 12 }}>
                <div className="tiny">Status</div>
                <strong style={{ color: deviceConnected ? 'var(--ok)' : undefined }}>
                  {deviceConnected ? 'Conectado' : 'Desconectado'}
                </strong>
                {deviceConnected && (
                  <>
                    <div className="tiny" style={{ marginTop: 4 }}>
                      Bateria {deviceBattery}%
                    </div>
                    <div className="tiny">ID ALIA-BTN-001</div>
                  </>
                )}
              </div>
              {!deviceConnected ? (
                <button
                  type="button"
                  className="btn btn-rose"
                  onClick={() => {
                    setDeviceConnected(true)
                    setDeviceBattery(87)
                    showToast('Dispositivo pareado')
                  }}
                >
                  Procurar e parear
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-soft"
                  onClick={() => {
                    setDeviceConnected(false)
                    setDeviceBattery(null)
                    showToast('Dispositivo desconectado')
                  }}
                >
                  Desconectar
                </button>
              )}
            </div>
          </div>
        )}

        {sheet === 'history' && (
          <div className="sheet">
            <div className="sheet-h">
              <button type="button" className="icon-btn" onClick={() => setSheet(null)}>
                <Icon name="x" size={20} />
              </button>
              <strong>Histórico</strong>
              <span style={{ width: 40 }} />
            </div>
            <div className="sheet-body">
              {occurrences.length === 0 && <p className="empty">Nenhuma ocorrência ainda.</p>}
              {occurrences.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className="card pressable"
                  style={{ width: '100%', textAlign: 'left' }}
                  onClick={() => {
                    setActiveId(o.id)
                    setSheet('emergency')
                  }}
                >
                  <strong style={{ fontSize: 12 }}>{o.id}</strong>
                  <div className="tiny" style={{ color: 'var(--rose-soft)' }}>
                    {STATUS[o.status]}
                  </div>
                  <div className="tiny">{new Date(o.createdAt).toLocaleString('pt-BR')}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {sheet === 'places' && (
          <div className="sheet">
            <div className="sheet-h">
              <button type="button" className="icon-btn" onClick={() => setSheet(null)}>
                <Icon name="x" size={20} />
              </button>
              <strong>Lugares seguros</strong>
              <span style={{ width: 40 }} />
            </div>
            <div className="sheet-body">
              {places.map((p) => (
                <div key={p.id} className="list-item">
                  <button
                    type="button"
                    style={{ flex: 1, textAlign: 'left' }}
                    onClick={() => {
                      setActivePlaceId(p.id)
                      showToast(`${p.label} definido como ativo`)
                    }}
                  >
                    <strong style={{ fontSize: 14 }}>{p.label}</strong>
                    <div className="tiny">{p.address}</div>
                    {p.id === activePlaceId && (
                      <div className="tiny" style={{ color: 'var(--rose-soft)' }}>
                        Usado no próximo alerta
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ width: 36, height: 36 }}
                    onClick={() => {
                      setPlaces((list) => {
                        const next = list.filter((x) => x.id !== p.id)
                        if (activePlaceId === p.id) setActivePlaceId(next[0]?.id ?? '')
                        return next
                      })
                    }}
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              ))}
              <input
                className="input"
                placeholder="Nome (ex: Casa)"
                value={placeForm.label}
                onChange={(e) => setPlaceForm((f) => ({ ...f, label: e.target.value }))}
              />
              <input
                className="input"
                placeholder="Endereço"
                value={placeForm.address}
                onChange={(e) => setPlaceForm((f) => ({ ...f, address: e.target.value }))}
              />
              <button
                type="button"
                className="btn btn-rose"
                onClick={() => {
                  if (!placeForm.label.trim() || !placeForm.address.trim()) {
                    showToast('Preencha nome e endereço')
                    return
                  }
                  setPlaces((list) => [
                    ...list,
                    {
                      id: `p-${Date.now()}`,
                      label: placeForm.label.trim(),
                      address: placeForm.address.trim(),
                    },
                  ])
                  setPlaceForm({ label: '', address: '' })
                  showToast('Lugar adicionado')
                }}
              >
                Adicionar lugar
              </button>
            </div>
          </div>
        )}

        {sheet === 'contact' && (
          <div className="sheet">
            <div className="sheet-h">
              <button type="button" className="icon-btn" onClick={() => setSheet(null)}>
                <Icon name="x" size={20} />
              </button>
              <strong>{editingContact ? 'Editar contato' : 'Novo contato'}</strong>
              <span style={{ width: 40 }} />
            </div>
            <div className="sheet-body">
              <input
                className="input"
                placeholder="Nome"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <input
                className="input"
                placeholder="Telefone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              <input
                className="input"
                placeholder="Relação (ex: Mãe)"
                value={form.relation}
                onChange={(e) => setForm((f) => ({ ...f, relation: e.target.value }))}
              />
              <div className="switch-row">
                <strong style={{ fontSize: 14 }}>Recebe alerta</strong>
                <button
                  type="button"
                  className={`switch ${form.alert ? 'on' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, alert: !f.alert }))}
                >
                  <i />
                </button>
              </div>
              <button type="button" className="btn btn-rose" style={{ marginTop: 12 }} onClick={saveContact}>
                Salvar
              </button>
            </div>
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  )
}
