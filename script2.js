const loginContainer = document.getElementById('login-container')
const mainContainer = document.getElementById('main-container')
const nombreInput = document.getElementById('nombre-usuario')
const btnLogin = document.getElementById('btn-login')
const nombreMostrado = document.getElementById('nombre-mostrado')

let usuario = null

btnLogin.addEventListener('click', () => {
  const nombre = nombreInput.value.trim()
  if (!nombre) {
    alert('Por favor, escribe tu nombre.')
    return
  }

  usuario = nombre
  localStorage.setItem('usuarioMissVaca', usuario)

  loginContainer.style.display = 'none'
  mainContainer.style.display = 'block'
  nombreMostrado.textContent = usuario
})
