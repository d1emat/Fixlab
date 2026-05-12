# FixLab

Sitio web estático de **FixLab S.L.** para reparación de móviles, reserva de servicios y catálogo de productos reacondicionados y accesorios.

- **Web en producción:** [https://d1emat.github.io/Fixlab/](https://d1emat.github.io/Fixlab/)
- **Repositorio:** [https://github.com/d1emat/Fixlab](https://github.com/d1emat/Fixlab)

---

## Funcionalidades

- Landing corporativa responsive.
- Páginas de servicios, tiendas físicas (Valladolid y Burgos), contacto y secciones legales.
- Formulario de reserva con notificación por email ([Web3Forms](https://web3forms.com/)) y guardado en Supabase.
- Formulario de valoración con notificación por email y guardado en Supabase.
- Panel de administración con gestión de reservas, clientes, reseñas y estadísticas.
- Seguimiento público de reparaciones por código.
- Login y registro de cliente (demo front-end).
- Tienda con filtros por tipo, marca, texto y precio máximo.

---

## Tecnologías

- HTML5, CSS3, JavaScript vanilla
- [Supabase](https://supabase.com/) — base de datos (PostgreSQL + API REST)
- [Web3Forms](https://web3forms.com/) — envío de notificaciones por email

---

## Estructura

```
Fixlab/
├── index.html
├── servicios.html
├── tiendas.html
├── tienda.html
├── producto.html
├── reserva.html
├── valoracion.html
├── seguimiento-publico.html
├── panel_control.html
├── login.html
├── registro.html
├── contacto.html
├── aviso-legal.html
├── politica-privacidad.html
├── politica-cookies.html
├── assets/
│   ├── css/styles.css
│   └── js/
│       ├── script.js
│       ├── supabase-config.js   ← credenciales Supabase
│       └── supabase-db.js
└── Fotos/
```

---

## Uso local

```bash
python3 -m http.server 8000
```

Visita `http://localhost:8000`.

---

## Configuración de Supabase

Edita `assets/js/supabase-config.js` con tus credenciales:

```js
window.FIXLAB_SUPABASE_CONFIG = {
  url: "https://tu-proyecto.supabase.co",
  anonKey: "tu_anon_key",
  table: "fixlab_records"
};
```

El esquema de la tabla está en `supabase-schema.sql`. Ejecútalo en el SQL Editor de Supabase para crear la tabla.

---

## Despliegue en GitHub Pages

1. Ve a `Settings` → `Pages`
2. En `Build and deployment` selecciona `Deploy from a branch`
3. Elige `main` y `/ (root)` y guarda

---

## Flujo de trabajo con Git

**Actualizar el repositorio con tus cambios:**

```bash
git add .
git commit -m "descripción del cambio"
git push origin main
```

**Bajar los últimos cambios del repositorio:**

```bash
git pull origin main
```

> Haz siempre `pull` antes de ponerte a trabajar si hay más de una persona editando el proyecto.

---

## Consideraciones de seguridad

- El login actual es solo front-end, no apto para producción.
- La `anonKey` de Supabase es pública por diseño, pero configura bien las RLS policies para limitar qué puede hacer un usuario no autenticado.

---

## Autores

**Diego Mateo Paredes** · **Víctor Alonso Fuente**  
Proyecto: **FixLab S.L.**
