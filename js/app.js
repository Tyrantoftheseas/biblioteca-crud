/* ========== FUNCIONES COMPARTIDAS ========== */

// Leer libros guardados
function getLibros() {
  try {
    const data = localStorage.getItem('libros');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('No se pudo leer localStorage:', e);
    return [];
  }
}

// Guardar libros
function setLibros(libros) {
  try {
    localStorage.setItem('libros', JSON.stringify(libros));
  } catch (e) {
    console.error('No se pudo guardar en localStorage:', e);
    throw e;
  }
}

/* ========== MÓDULO: AGREGAR LIBRO ========== */

(function () {
  // Elementos del form
  const form = document.getElementById('formAgregarLibro');
  const alertPlaceholder = document.getElementById('alertPlaceholder');
  const inputTitulo = document.getElementById('titulo');
  const inputAutor = document.getElementById('autor');
  const inputIsbn = document.getElementById('isbn');
  const inputAnio = document.getElementById('anio');
  const chkDisponible = document.getElementById('disponible');

  // Mostrar mensaje
  function showAlert(message, type = 'success') {
    alertPlaceholder.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
      </div>`;
  }

  // Validar campos
  function validarFormulario() {
    let valido = true;
    [inputTitulo, inputAutor, inputIsbn, inputAnio].forEach((el) => {
      el.classList.remove('is-invalid');
    });

    if (!inputTitulo.value.trim()) {
      inputTitulo.classList.add('is-invalid');
      valido = false;
    }
    if (!inputAutor.value.trim()) {
      inputAutor.classList.add('is-invalid');
      valido = false;
    }
    if (!inputIsbn.value.trim()) {
      inputIsbn.classList.add('is-invalid');
      valido = false;
    }
    if (!inputAnio.value.trim()) {
      inputAnio.classList.add('is-invalid');
      valido = false;
    }

    return valido;
  }

  // Cuando se envía el form
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();

    form.classList.add('was-validated');

    if (!validarFormulario()) {
      showAlert('Por favor, completa los campos obligatorios.', 'danger');
      return;
    }

    const nuevoLibro = {
      id: 'libro_' + Date.now(),
      titulo: inputTitulo.value.trim(),
      autor: inputAutor.value.trim(),
      isbn: inputIsbn.value.trim(),
      anio: inputAnio.value.trim(),
      disponible: !!chkDisponible.checked,
    };

    try {
      const libros = getLibros();

      // Evitar ISBN duplicado
      if (libros.some((l) => l.isbn === nuevoLibro.isbn)) {
        showAlert('Ya existe un libro con ese ISBN.', 'warning');
        inputIsbn.classList.add('is-invalid');
        return;
      }

      libros.push(nuevoLibro);
      setLibros(libros);
      renderLibros(); // Actualizar la lista
      showAlert('✅ Libro agregado correctamente.', 'success');
      form.reset();
      form.classList.remove('was-validated');
      inputTitulo.focus();
    } catch (err) {
      showAlert(
        'Ocurrió un error guardando el libro. Revisa la consola.',
        'danger'
      );
      console.error(err);
    }
  });
})();

/* ========== MÓDULO: LISTADO DE LIBROS ========== */

// Crear celda de tabla
function crearCelda(texto) {
  const td = document.createElement('td');
  td.textContent = texto;
  return td;
}

// Crear badge de estado
function crearBadgeEstado(disponible) {
  const span = document.createElement('span');
  span.classList.add('badge', 'badge-estado');
  if (disponible) {
    span.classList.add('bg-success', 'text-white');
    span.textContent = 'Disponible';
  } else {
    span.classList.add('bg-secondary', 'text-white');
    span.textContent = 'No disponible';
  }
  return span;
}

// Mostrar los libros
function renderLibros() {
  const tabla = document.getElementById('tablaLibros');
  const tbody = document.getElementById('tablaLibrosBody');
  const sinLibrosMsg = document.getElementById('sinLibrosMsg');
  const contadorLibros = document.getElementById('contadorLibros');

  if (!tabla || !tbody || !sinLibrosMsg) {
    console.warn('Elementos del listado no encontrados en el DOM.');
    return;
  }

  // Limpiar tabla
  tbody.innerHTML = '';

  const libros = getLibros();
  const cantidad = libros.length;

  if (contadorLibros) {
    contadorLibros.textContent = `${cantidad} ${
      cantidad === 1 ? 'libro' : 'libros'
    }`;
  }

  // Si no hay libros
  if (cantidad === 0) {
    sinLibrosMsg.style.display = 'block';
    tabla.style.display = 'none';
    return;
  }

  // Si hay libros
  sinLibrosMsg.style.display = 'none';
  tabla.style.display = 'table';

  // Crear filas
  libros.forEach((libro) => {
    const tr = document.createElement('tr');
    tr.appendChild(crearCelda(libro.titulo ?? '—'));
    tr.appendChild(crearCelda(libro.autor ?? '—'));
    tr.appendChild(crearCelda(libro.isbn ?? '—'));
    tr.appendChild(crearCelda(libro.anio ?? '—'));

    const tdEstado = document.createElement('td');
    tdEstado.appendChild(crearBadgeEstado(!!libro.disponible));
    tr.appendChild(tdEstado);

    tbody.appendChild(tr);
  });
}

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', renderLibros);
