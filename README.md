<div align="center">
  <img src="https://img.shields.io/badge/Cuadra-PRO-00C49F?style=for-the-badge&logo=shield&logoColor=white" alt="CuadraPro Logo" width="200" />
  <h1>Bóveda de Conciliación Financiera B2B (v2.2-Hardening)</h1>
  <p><em>Plataforma SaaS Multi-Tenant robustecida para el análisis y gestión de flujos de efectivo, detección de fugas en pasarelas, cruce fiscal y facturación corporativa.</em></p>
  
  <p>
    <a href="#arquitectura"><img src="https://img.shields.io/badge/Stack-PERN-blue?style=flat-square&logo=postgresql" alt="Stack PERN" /></a>
    <a href="#frontend"><img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-61DAFB?style=flat-square&logo=react" alt="React" /></a>
    <a href="#backend"><img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=nodedotjs" alt="Node.js" /></a>
    <a href="#seguridad"><img src="https://img.shields.io/badge/Seguridad-AES--256--GCM%20%2B%20Zod%20%2B%20Helmet-green?style=flat-square&logo=express" alt="Seguridad" /></a>
  </p>
</div>

---

## 📖 Visión General

**CuadraPro** es una solución empresarial avanzada (SaaS) diseñada para resolver la conciliación bancaria y auditoría fiscal en negocios medianos y corporativos que operan con múltiples pasarelas de pago. La plataforma actúa como una bóveda centralizada donde se consolidan estados de cuenta bancarios, facturas CFDI del SAT e ingresos de pasarelas, detectando de forma automática discrepancias contables o comisiones abusivas no declaradas.

El sistema se estructura bajo una arquitectura **Multi-Tenant** segura y robustecida bajo directrices de nivel senior, aislando estrictamente la información de cada empresa.

---

## ✨ Características Principales (Core Features)

### 📊 Dashboard Fintech Premium
* **KPIs Interactivos con Tooltips:** Muestra métricas clave como el "Total Esperado", "Fuga en Pasarelas" (comisiones abusivas cobradas por Clip/MercadoPago), "Salud Fiscal SAT" (cruce de timbrados vs depósitos) y el "Estado de Salud" contable global.
* **Glosario No-Devs Integrado:** Cada KPI dispone de un tooltip contextual animado (`HelpCircle`) que explica de forma cotidiana y en lenguaje claro el significado y relevancia de la métrica para el negocio.
* **Analítica Visual:** Gráficos semanales (`Recharts`) y dona de distribución con degradados de color dinámicos.
* **Historial de Conciliación en Tiempo Real**: Tabla transaccional que lee y desglosa en tiempo real los cortes de caja del perfil activo (Depósitos, deducciones de pasarela y retención SAT), con buscador, paginación y filtrado.

### 🌓 Modo Oscuro Elástico y Persistente
* Interruptor visual en la Sidebar que alterna entre temas claros y oscuros con transiciones ultra-suaves de `Framer Motion`.
* Persistencia en `localStorage` y adaptación de paleta de colores corporativos.

### 🧭 Asistente de Inicio de Bóveda (Onboarding Widget)
* Panel de gamificación que mide y reporta el porcentaje de configuración de la bóveda contable del usuario.
* Lista de pasos interactivos que guían de forma amigable a los usuarios administrativos a completar su primera conciliación diaria.

### 🔒 Autenticación & Registro con Google (OAuth)
* Botón interactivo de inicio rápido con cuentas de Google/Gmail.
* **Auto-registro Seguro**: Creación automática y transparente de perfiles para nuevos correos vinculados al Tenant correspondiente.
* **Autocierre por Inactividad**: Mecanismo de escucha de eventos físicos que cierra sesión tras 2 minutos de inactividad, previniendo intrusiones en terminales de caja.

---

## 🛡 Arquitectura de Seguridad (Backend Hardening)

* **Protección de Cabeceras HTTP (Helmet)**: Inyección de middlewares de seguridad para mitigar ataques comunes de scripting cruzado (XSS) y clickjacking.
* **Validación de Datos con Zod**: Middleware `validateSchema.js` que audita de forma estricta los formatos de entrada (correos, contraseñas y estructuras contables) antes de que toquen la base de datos PostgreSQL, blindando el backend contra SQL Injection.
* **Cifrado Simétrico AES-256-GCM**: Módulo criptográfico `cryptoHelper.js` que encripta en descanso tokens bancarios y secretos de pasarelas, generando tags de autenticación únicos para prevenir alteración de registros.
* **Manejador de Errores Global**: Middleware centralizado de Express que intercepta fallos de base de datos o lógica, retornando respuestas estructuradas en JSON con código `500` y previniendo la fuga de *stack traces* en entornos de producción.

---

## 🎨 Paleta de Colores y Estética Corporativa

* **Verde Esmeralda Fintech (`#00C49F`)**: Color acento principal utilizado en estados completados, checks de éxito y barras de progreso.
* **Negro Profundo (`#0a0a0a`)**: Fondo general del documento en modo oscuro para reducir la fatiga visual.
* **Carbón de Contraste (`#121212`)**: Color de fondo para tarjetas, cabecera del header flotante y barra lateral en modo oscuro.
* **Tipografías Premium**:
  * **Plus Jakarta Sans**: Tipografía sans-serif principal para una jerarquía visual SaaS moderna.
  * **IBM Plex Mono**: Tipografía para valores numéricos, montos y hashes transaccionales.

---

## 🚀 Variables de Entorno (.env)

**Backend (`cuadrapro-backend/.env`):**
```env
PORT=3000
DATABASE_URL=postgresql://[usuario]:[password]@db.[tudominio].supabase.co:5432/postgres
JWT_SECRET=tu_firma_secreta_super_segura
```

**Frontend (`cuadrapro-frontend/.env`):**
```env
VITE_API_URL=http://localhost:3000
```

---

## 📂 Estructura del Directorio Actualizada

```bash
CuadraPro/
├── cuadrapro-backend/             # 🧠 Código fuente y configs del Backend
│   ├── src/
│   │   ├── config/db.js           # Conexión a PostgreSQL (con soporte SSL dinámico)
│   │   ├── controllers/           # Lógica de negocio (auth, conciliaciones, etc.)
│   │   ├── middlewares/           # Capas de seguridad (validateSchema.js, JWT)
│   │   ├── routes/                # Enrutadores Express API v1 con Zod
│   │   ├── utils/cryptoHelper.js  # Suite de cifrado AES-256-GCM en descanso
│   │   └── index.js               # Servidor maestro con Helmet y Global Error Handler
│   ├── .gitignore                 # Exclusiones de backend (node_modules, .env, *.log)
│   └── package.json               # Dependencias de Backend (helmet, zod, pg)
│
├── cuadrapro-frontend/            # 🎨 Aplicación React (SPA)
│   ├── src/
│   │   ├── components/Layout.jsx  # Contenedor B2B (Switch Modo Oscuro y navegación móvil)
│   │   ├── pages/                 # Vistas: Dashboard, Clientes, Captura, Configuración
│   │   └── index.css              # Directivas Tailwind, sombras premium y layers
│   ├── tailwind.config.js         # Configuración del tema y colores 'b2b'
│   └── package.json               # Dependencias Frontend (framer-motion, recharts)
│
└── .gitignore                     # Políticas de exclusión globales
```

---
<div align="center">
  <i>Construido con precisión técnica, rigor de seguridad y refinamiento estético.</i>
</div>
