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
  form.innerHTML = `
    <h2>${vaca}</h2>
    ${criterios.map(c =>
      `<label>${c}: <input type="range" name="${c}" min="1" max="5" value="3" /></label><br>`
    ).join('')}
    <button type="submit">Votar</button>
  `

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const datos = Object.fromEntries(new FormData(form))
    const voto = {
      vaca,
      ...Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, parseInt(v)]))
    }
    const { error } = await supabase.from('votos').insert([voto])
    if (error) {
      alert("Error al votar 😞")
      console.error(error)
    } else {
      alert(`¡Gracias por votar por ${vaca}! 🐄`)
      await mostrarResultados()  // actualiza inmediatamente tras votar
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
          `${c}: ${r.count ? (r[c] / r.count).toFixed(2) : '—'}`
        ).join('<br>')}
        <strong>Puntuación media: ${r.count ? media : '—'}</strong>
      </div>
    `
    resultadosDiv.innerHTML += html
  })
}

// Mostrar resultados al cargar
mostrarResultados()

// Refrescar cada 10 segundos
setInterval(mostrarResultados, 10000)

