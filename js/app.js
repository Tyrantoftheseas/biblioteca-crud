// Sistema CRUD de Biblioteca
// Agregar, listar y editar libros

(function () {
  // Elementos del form
  const form = document.getElementById('formAgregarLibro');
  const alertPlaceholder = document.getElementById('alertPlaceholder');
  const inputTitulo = document.getElementById('titulo');
  const inputAutor = document.getElementById('autor');
  const inputIsbn = document.getElementById('isbn');
  const inputAnio = document.getElementById('anio');
  const chkDisponible = document.getElementById('disponible');
  const btnAgregar = document.getElementById('btnAgregar');

  // Elementos de la tabla
  const tabla = document.getElementById('tablaLibros');
  const tbody = document.getElementById('tablaLibrosBody');
  const sinLibrosMsg = document.getElementById('sinLibrosMsg');
  const contadorLibros = document.getElementById('contadorLibros');

  // id del libro que se edita
  let libroEditandoId = null;

  //Funciones del localStorage

  // Leer libros
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

  //Funciones visuales

  function showAlert(message, type = 'success') {
    alertPlaceholder.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
      </div>`;
  }

  function crearCelda(texto) {
    const td = document.createElement('td');
    td.textContent = texto;
    return td;
  }

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

  //Modo edicion

  function cargarLibroEnFormulario(idLibro) {
    const libros = getLibros();
    // Comparar como string para compatibilidad
    const libro = libros.find((l) => String(l.id) === String(idLibro));

    if (!libro) {
      showAlert('No se encontró el libro a editar.', 'danger');
      return;
    }

    // Cargar valores en los inputs
    inputTitulo.value = libro.titulo ?? '';
    inputAutor.value = libro.autor ?? '';
    inputIsbn.value = libro.isbn ?? '';
    inputAnio.value = libro.anio ?? '';
    chkDisponible.checked = !!libro.disponible;

    // Marcar qué libro estamos editando
    libroEditandoId = idLibro;

    btnAgregar.textContent = 'Actualizar Libro';
    btnAgregar.classList.remove('btn-primary');
    btnAgregar.classList.add('btn-success');

    form.scrollIntoView({ behavior: 'smooth' });
  }

  function resetModoEdicion() {
    libroEditandoId = null;
    btnAgregar.textContent = 'Agregar Libro';
    btnAgregar.classList.remove('btn-success');
    btnAgregar.classList.add('btn-primary');
    form.reset();
    form.classList.remove('was-validated');
  }
  
  //Eliminar libros

  function eliminarLibro(idLibro) {
    const confirmar = confirm('¿Seguro que deseas eliminar este libro?');

    if (!confirmar) {
      return;
    }

    const libros = getLibros();

    // Filtrar el libro que no coincide con el id
    const nuevosLibros = libros.filter((l) => String(l.id) !== String(idLibro));

    setLibros(nuevosLibros);

    // Si el libro que se elimina estaba en modo edición, resetear
    if (String(libroEditandoId) === String(idLibro)) {
      resetModoEdicion();
    }

    showAlert('✅ Libro eliminado correctamente.', 'success');
    renderLibros();
  }

  //Mostrar libros

  function renderLibros() {
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

    if (cantidad === 0) {
      // Si no hay libros
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

      const tdAcciones = document.createElement('td');

      // Botón Editar
      const btnEditar = document.createElement('button');
      btnEditar.className = 'btn btn-sm btn-warning me-2';
      btnEditar.textContent = 'Editar';

      // Guardar el id en una propiedad para usarlo en el evento
      btnEditar.dataset.id = String(libro.id);

      btnEditar.addEventListener('click', function () {
        const id = this.dataset.id; // Mantener como string
        cargarLibroEnFormulario(id);
      });

      // Botón Eliminar
      const btnEliminar = document.createElement('button');
      btnEliminar.className = 'btn btn-sm btn-danger';
      btnEliminar.textContent = 'Eliminar';

      btnEliminar.dataset.id = String(libro.id);

      btnEliminar.addEventListener('click', function () {
        const id = this.dataset.id; // Mantener como string
        eliminarLibro(id);
      });

      tdAcciones.appendChild(btnEditar);
      tdAcciones.appendChild(btnEliminar);
      tr.appendChild(tdAcciones);

      tbody.appendChild(tr);
    });
  }

  //Validar form

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

  //Enviar form

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();

    form.classList.add('was-validated');

    if (!validarFormulario()) {
      showAlert('Por favor, completa los campos obligatorios.', 'danger');
      return;
    }

    const libros = getLibros();

    if (libroEditandoId === null) {
      //MODO AGREGAR
      const nuevoLibro = {
        id: 'libro_' + Date.now(),
        titulo: inputTitulo.value.trim(),
        autor: inputAutor.value.trim(),
        isbn: inputIsbn.value.trim(),
        anio: inputAnio.value.trim(),
        disponible: !!chkDisponible.checked,
      };

      // Evitar ISBN duplicado
      if (libros.some((l) => l.isbn === nuevoLibro.isbn)) {
        showAlert('⚠️ Ya existe un libro con ese ISBN.', 'warning');
        inputIsbn.classList.add('is-invalid');
        return;
      }

      libros.push(nuevoLibro);
      setLibros(libros);
      showAlert('✅ Libro agregado correctamente.', 'success');
      resetModoEdicion();
    } else {
      //MODO EDITAR
      const indice = libros.findIndex(
        (l) => String(l.id) === String(libroEditandoId)
      );

      if (indice === -1) {
        showAlert('No se pudo actualizar el libro (no encontrado).', 'danger');
      } else {
        libros[indice].titulo = inputTitulo.value.trim();
        libros[indice].autor = inputAutor.value.trim();
        libros[indice].isbn = inputIsbn.value.trim();
        libros[indice].anio = inputAnio.value.trim();
        libros[indice].disponible = !!chkDisponible.checked;

        setLibros(libros);
        showAlert('✅ Libro actualizado correctamente.', 'success');
      }

      resetModoEdicion();
    }

    renderLibros();
  });

  //Iniciar
  document.addEventListener('DOMContentLoaded', renderLibros);
})();