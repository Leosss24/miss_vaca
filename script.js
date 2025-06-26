import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', () => {
  const vacas = ['Redonda (A Coruña)', 'Linda (Lugo)', 'Gallega (Ourense)', 'Boneca (Pontevedra)']
  const criterios = ['apariencia', 'proporciones', 'actitud', 'carisma']

  const loginContainer = document.getElementById('login-container')
  const mainContainer = document.getElementById('main-container')
  const nombreInput = document.getElementById('nombre-usuario')
  const btnLogin = document.getElementById('btn-login')
  const btnLogout = document.getElementById('btn-logout')
  const logoutWrapper = document.getElementById('logout-wrapper')
  const vacasContainer = document.getElementById('vacas-container')
  const resultadosDiv = document.getElementById('resultados')

  let usuario = null

  btnLogin.addEventListener('click', () => {
    const nombre = nombreInput.value.trim()
    if (!nombre) {
      alert('Por favor, introduce tu nombre para continuar.')
      return
    }
    usuario = nombre
    localStorage.setItem('usuarioMissVaca', usuario)
    inicializarApp()
  })

  btnLogout.addEventListener('click', () => {
    usuario = null
    localStorage.removeItem('usuarioMissVaca')
    location.reload()
  })

  async function inicializarApp() {
    loginContainer.style.display = 'none'
    mainContainer.style.display = 'flex'
    logoutWrapper.style.display = 'block'

    vacasContainer.innerHTML = ''
    vacas.forEach(vaca => {
      const form = crearFormulario(vaca)
      vacasContainer.appendChild(form)
    })

    await mostrarResultados()

    // Obtener vacas ya votadas por este usuario
    const { data, error } = await supabase
      .from('votos')
      .select('vaca')
      .eq('usuario', usuario)

    if (error) {
      console.error('Error comprobando votos:', error)
      alert('Error comprobando votos. Recarga la página.')
      return
    }

    const vacasVotadas = data.map(item => item.vaca)

    vacasContainer.querySelectorAll('form').forEach(form => {
      const vacaForm = form.querySelector('h2').textContent
      if (vacasVotadas.includes(vacaForm)) {
        form.querySelectorAll('button').forEach(b => b.disabled = true)
      }
    })
  }

  function crearFormulario(vaca) {
    const form = document.createElement('form')
    form.className = 'formulario'

    const campos = criterios.map(criterio => {
      const grupo = document.createElement('div')
      grupo.className = 'voto-grupo'
      grupo.dataset.criterio = criterio

      const label = document.createElement('label')
      label.textContent = criterio.toUpperCase()

      for (let i = 1; i <= 5; i++) {
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.textContent = i
        btn.dataset.valor = i

        btn.addEventListener('click', () => {
          [...grupo.children].forEach(b => b.classList.remove('selected'))
          btn.classList.add('selected')
          grupo.dataset.valor = i
        })

        grupo.appendChild(btn)
      }

      return { label, grupo }
    })

    const titulo = document.createElement('h2')
    titulo.textContent = vaca

    const submit = document.createElement('button')
    submit.type = 'submit'
    submit.textContent = 'Votar'

    form.appendChild(titulo)
    campos.forEach(({ label, grupo }) => {
      form.appendChild(label)
      form.appendChild(grupo)
    })
    form.appendChild(submit)

    form.addEventListener('submit', async e => {
      e.preventDefault()

      if (!usuario) {
        alert('Debes iniciar sesión para votar.')
        return
      }

      const voto = { vaca, usuario }
      let incompleto = false

      criterios.forEach(c => {
        const grupo = form.querySelector(`.voto-grupo[data-criterio="${c}"]`)
        const valor = parseInt(grupo.dataset.valor)
        if (!valor) incompleto = true
        voto[c] = valor
      })

      if (incompleto) {
        alert('Por favor selecciona una puntuación para todos los criterios.')
        return
      }

      // Comprobar si ya votó esta vaca
      const { data: yaVoto, error: errCheck } = await supabase
        .from('votos')
        .select('*')
        .eq('usuario', usuario)
        .eq('vaca', vaca)

      if (errCheck) {
        alert('Error verificando votos. Intenta de nuevo.')
        return
      }

      if (yaVoto.length > 0) {
        alert(`Ya has votado anteriormente por la vaca ${vaca}, no puedes votar de nuevo.`)
        form.querySelectorAll('button').forEach(b => b.disabled = true)
        return
      }

      const { error } = await supabase.from('votos').insert([voto])
      if (error) {
        alert("Error al votar 😞")
        console.error(error)
      } else {
        alert(`¡Gracias por votar por ${vaca}, ${usuario}! 🐄`)
        form.querySelectorAll('button').forEach(b => b.disabled = true)
        await mostrarResultados()
      }
    })

    return form
  }

  async function mostrarResultados() {
    const { data, error } = await supabase.from('votos').select('*')
    if (error) {
      console.error('Error cargando resultados:', error)
      return
    }

    const resumen = {}
    vacas.forEach(v => resumen[v] = {
      count: 0,
      ...Object.fromEntries(criterios.map(c => [c, 0]))
    })

    data.forEach(v => {
      const r = resumen[v.vaca]
      criterios.forEach(c => r[c] += v[c])
      r.count += 1
    })

    resultadosDiv.innerHTML = `<h2>Resultados en Vivo 📊</h2>`

    let maxMedia = -Infinity
    let vacaGanadora = null

    vacas.forEach(v => {
      const r = resumen[v]
      const total = criterios.reduce((sum, c) => sum + (r.count ? (r[c] / r.count) : 0), 0)
      const media = r.count ? (total / 4) : 0
      if(media > maxMedia) {
        maxMedia = media
        vacaGanadora = v
      }
    })

    vacas.forEach(v => {
      const r = resumen[v]
      const total = criterios.reduce((sum, c) => sum + (r.count ? (r[c] / r.count) : 0), 0)
      const media = r.count ? (total / 4) : 0
      const isWinner = v === vacaGanadora

      const html = `
        <div class="resultado ${isWinner ? 'ganadora' : ''}">
          <h3>${v}</h3>
          ${criterios.map(c =>
            `<div>${c.toUpperCase()}: ${r.count ? (r[c] / r.count).toFixed(2) : '—'}</div>`
          ).join('')}
          <div class="media">PUNTUACIÓN MEDIA: ${r.count ? media.toFixed(2) : '—'}</div>
        </div>
      `
      resultadosDiv.innerHTML += html
    })
  }

  const usuarioGuardado = localStorage.getItem('usuarioMissVaca')
  if (usuarioGuardado) {
    usuario = usuarioGuardado
    inicializarApp()
  }
})
