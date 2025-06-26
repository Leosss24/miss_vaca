import { supabase } from './supabase.js'

const vacas = ['Redonda (A Coruña)', 'Linda (Lugo)', 'Gallega (Ourense)', 'Boneca (Pontevedra)']
const criterios = ['apariencia', 'proporciones', 'actitud', 'carisma']

const container = document.getElementById('vacas-container')
const resultadosDiv = document.createElement('div')
resultadosDiv.id = 'resultados'
container.appendChild(resultadosDiv)

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

    const voto = { vaca }
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

    const { error } = await supabase.from('votos').insert([voto])
    if (error) {
      alert("Error al votar 😞")
      console.error(error)
    } else {
      alert(`¡Gracias por votar por ${vaca}! 🐄`)
      form.querySelectorAll('button').forEach(b => b.disabled = true)
      await mostrarResultados()
    }
  })

  return form
}

vacas.forEach(vaca => {
  const form = crearFormulario(vaca)
  container.appendChild(form)
})

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
  vacas.forEach(v => {
    const r = resumen[v]
    const total = criterios.reduce((sum, c) => sum + (r.count ? (r[c] / r.count) : 0), 0)
    const media = (total / 4).toFixed(2)
    const html = `
      <div class="resultado">
        <h3>${v}</h3>
        ${criterios.map(c =>
          `${c.toUpperCase()}: ${r.count ? (r[c] / r.count).toFixed(2) : '—'}`
        ).join('<br>')}
        <strong>Puntuación media: ${r.count ? media : '—'}</strong>
      </div>
    `
    resultadosDiv.innerHTML += html
  })
}

// Mostrar al cargar
mostrarResultados()

// Actualizar cada 10 segundos
setInterval(mostrarResultados, 10000)
