import { useEffect, useState } from 'react'
import pageOne from './assets/AryBdayPage1.png'
import pageTwo from './assets/AryBdayPage2.png'
import teEsperoLa from './assets/te_espero_la.png'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const storageKey = 'aryversario:rsvp_submitted'
  const [name, setName] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bringGuests, setBringGuests] = useState(false)
  const [guestCount, setGuestCount] = useState('1')
  const [guestNames, setGuestNames] = useState([])
  const [hasSubmitted, setHasSubmitted] = useState(false)

  useEffect(() => {
    setHasSubmitted(localStorage.getItem(storageKey) === 'true')
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmedName = name.trim()
    const extraCount = bringGuests ? Number(guestCount) : 0

    if (!trimmedName) {
      setStatus({ type: 'error', message: 'Informe seu nome.' })
      return
    }

    if (trimmedName.length > 20) {
      setStatus({
        type: 'error',
        message: 'O nome deve ter no maximo 20 caracteres.',
      })
      return
    }

    const extraNames = guestNames
      .slice(0, extraCount)
      .map((guest) => guest.trim())

    if (extraCount > 0 && extraNames.length !== extraCount) {
      setStatus({
        type: 'error',
        message: 'Preencha os nomes adicionais corretamente.',
      })
      return
    }

    if (extraNames.some((guest) => !guest)) {
      setStatus({
        type: 'error',
        message: 'Preencha os nomes adicionais corretamente.',
      })
      return
    }

    if (extraNames.some((guest) => guest.length > 20)) {
      setStatus({
        type: 'error',
        message: 'Os nomes adicionais devem ter no maximo 20 caracteres.',
      })
      return
    }

    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    const namesToInsert = [trimmedName, ...extraNames]
    let hasError = false

    for (const guestName of namesToInsert) {
      const { error } = await supabase
        .from('convidados')
        .insert({ nome: guestName })

      if (error) {
        hasError = true
        break
      }
    }

    if (hasError) {
      setStatus({
        type: 'error',
        message: 'Nao foi possivel enviar. Tente novamente.',
      })
    } else {
      setStatus({
        type: 'success',
        message: 'Presenca confirmada. Obrigado!',
      })
      setName('')
      setGuestNames([])
      setBringGuests(false)
      setGuestCount('1')
      localStorage.setItem(storageKey, 'true')
      setHasSubmitted(true)
    }

    setIsSubmitting(false)
  }

  return (
    <main className="page">
      <section className="page-section">
        <div
          className="page-frame"
          style={{ backgroundImage: `url(${pageOne})` }}
        >
          <div className="section__content" />
        </div>
      </section>
      <section className="page-section">
        <div
          className="page-frame"
          style={{ backgroundImage: `url(${pageTwo})` }}
        >
          <div className="section__content section__content--center">
            {hasSubmitted ? (
              <div className="rsvp-success">
                <img
                  className="rsvp-success__image"
                  src={teEsperoLa}
                  alt="Te espero la"
                />
              </div>
            ) : (
              <div className="rsvp-card">
                <h2 className="rsvp-title">Confirme sua presenca</h2>
                <p className="rsvp-text">
                  Deixe seu nome para confirmar sua presenca na lista.
                </p>
                <form className="rsvp-form" onSubmit={handleSubmit}>
                  <label className="rsvp-field">
                    <span>Nome</span>
                    <input
                      type="text"
                      name="name"
                      placeholder="Seu nome completo"
                      value={name}
                      maxLength={20}
                      onChange={(event) =>
                        setName(event.target.value.slice(0, 20))
                      }
                    />
                  </label>
                  <label className="rsvp-toggle">
                    <input
                      type="checkbox"
                      checked={bringGuests}
                      onChange={(event) => {
                        const checked = event.target.checked
                        setBringGuests(event.target.checked)
                        if (checked) {
                          setGuestNames(
                            Array.from(
                              { length: Number(guestCount) },
                              () => ''
                            )
                          )
                        } else {
                          setGuestNames([])
                        }
                      }}
                    />
                    <span>Vou levar mais convidados</span>
                  </label>
                  {bringGuests ? (
                    <>
                      <label className="rsvp-field rsvp-field--inline">
                        <span>Quantos a mais?</span>
                        <select
                          value={guestCount}
                          onChange={(event) => {
                            const value = event.target.value
                            setGuestCount(value)
                            const count = Number(value)
                            setGuestNames((prev) =>
                              Array.from({ length: count }, (_, index) =>
                                prev[index] ? prev[index].slice(0, 20) : ''
                              )
                            )
                          }}
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                        </select>
                      </label>
                      <div className="rsvp-guest-list">
                        {guestNames.map((guest, index) => (
                          <label
                            className="rsvp-field rsvp-field--guest"
                            key={`guest-${index}`}
                          >
                            <span>Convidado {index + 1}</span>
                            <input
                              type="text"
                              placeholder="Nome do convidado"
                              value={guest}
                              maxLength={20}
                              onChange={(event) => {
                                const value = event.target.value.slice(0, 20)
                                setGuestNames((prev) => {
                                  const next = [...prev]
                                  next[index] = value
                                  return next
                                })
                              }}
                            />
                          </label>
                        ))}
                      </div>
                    </>
                  ) : null}
                  <button
                    className="rsvp-submit"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'Confirmar presenca'}
                  </button>
                </form>
                {status.message ? (
                  <p className={`rsvp-status rsvp-status--${status.type}`}>
                    {status.message}
                  </p>
                ) : null}
              </div>
            )}
          </div>
          <button
            className="rsvp-reset rsvp-reset--overlay"
            type="button"
            onClick={() => {
              localStorage.removeItem(storageKey)
              setHasSubmitted(false)
              setStatus({ type: '', message: '' })
            }}
          >
            Limpar confirmacao
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
