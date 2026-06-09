<div align="center">
  <img src="https://img.shields.io/badge/Cuadra-PRO-00C49F?style=for-the-badge&logo=shield&logoColor=white" alt="CuadraPro Logo" width="200" />
  <h1>Bóveda de Conciliación Financiera B2B</h1>
  <p><em>Plataforma SaaS Multi-Tenant para el análisis y gestión de flujos de efectivo, deducciones y facturación corporativa.</em></p>
  
  <p>
    <a href="#arquitectura"><img src="https://img.shields.io/badge/Stack-PERN-blue?style=flat-square&logo=postgresql" alt="Stack PERN" /></a>
    <a href="#frontend"><img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react" alt="React" /></a>
    <a href="#backend"><img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=nodedotjs" alt="Node.js" /></a>
    <a href="#diseño"><img src="https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" /></a>
  </p>
</div>

---

## 📖 Visión General

**CuadraPro** es una solución de nivel empresarial (SaaS) diseñada para resolver el problema de la conciliación bancaria en negocios que operan con múltiples pasarelas de pago. La plataforma actúa como una bóveda centralizada donde los clientes pueden registrar sus ingresos diarios y obtener una analítica predictiva de sus finanzas, deducciones (Clip, Mercado Pago, SAT) y el estado de salud general de su capital.

Con una arquitectura **Multi-Tenant**, CuadraPro aísla los datos de múltiples empresas bajo una sola infraestructura, ofreciendo paneles administrativos tanto para los dueños de los negocios (Tenants) como para el operador principal del ecosistema (SuperAdmin).

## ✨ Características Principales (Core Features)

### 📊 Dashboard Fintech (Clean SaaS)
- **KPIs en Tiempo Real:** Visualización del "Total Esperado", "Fuga de Comisiones" y "Estado de Salud Financiera".
- **Analítica Visual:** Integración de gráficas de barras con degradados y donas dinámicas (`Recharts`) para desglosar la distribución de deducciones.
- **Tabla Transaccional:** Registro histórico de los "Últimos Movimientos" con diseño *Stripe-like*, estados semánticos (Liquidado, Deducido) y etiquetas de auditoría.

### 🏢 Arquitectura Multi-Tenant Segura
- **Aislamiento de Datos:** Cada usuario solo tiene acceso a los flujos financieros de su empresa asignada (vinculación mediante JWT).
- **Gestor 360:** Módulo administrativo para dar de alta nuevas empresas y generar sus accesos B2B en un solo flujo.

### 💳 Billing & Quotas (Suscripciones)
- **Centro de Control:** Panel adaptativo por rol. Los clientes visualizan el estado de su plan actual, límites de transacciones y barras de progreso de consumo.
- **Matriz de Beneficios:** Comparativa técnica integrada (Planes Lite, Pro, Enterprise) para facilitar estrategias de *upselling*.

### 📥 Motor de Reportes
- Exportación nativa de datos financieros a formato **Excel (.xlsx)** estructurado en múltiples pestañas (Resumen Ejecutivo y Detalle Transaccional), listo para uso contable.

---

## 🛠 Arquitectura Tecnológica (PERN Stack)

El ecosistema CuadraPro se divide en dos grandes monolitos, conviviendo en el mismo repositorio para facilitar el despliegue rápido.

### Backend (Node.js + Express)
El núcleo de la lógica de negocio y la seguridad.
- **Motor:** Node.js.
- **Framework:** Express.js.
- **Base de Datos:** PostgreSQL (con conexión lista para Supabase/Neon mediante `pg`).
- **Seguridad:** Autenticación por Tokens JWT (`jsonwebtoken`) y cifrado básico.

### Frontend (React + Vite)
La capa de presentación, diseñada bajo el patrón "Clean & Minimalist SaaS".
- **Compilador:** Vite (ultra rápido).
- **UI Framework:** Tailwind CSS v3.4 (con diseño responsivo "Mobile-First").
- **Componentes:** React.js con hooks funcionales (`useState`, `useEffect`).
- **Iconografía:** `lucide-react` para una consistencia visual de alta gama.

---

## 🚀 Despliegue en Producción

La plataforma está preparada para ser desplegada en entornos de nube modernos (PaaS).

### Requisitos Previos
1. Una instancia de base de datos **PostgreSQL** (Recomendado: Supabase o Neon.tech).
2. Entorno de ejecución para **Node.js** (Recomendado: Render o Railway).
3. Entorno de hosting estático para **React** (Recomendado: Vercel o Netlify).

### Variables de Entorno (.env)

**Backend:**
```env
PORT=3000
DATABASE_URL=postgresql://[usuario]:[password]@db.[tudominio].supabase.co:5432/postgres
JWT_SECRET=tu_firma_secreta_super_segura
```

**Frontend (`cuadrapro-frontend/.env`):**
```env
VITE_API_URL=https://api.tu-backend-render.com
```

---

## 📂 Estructura del Directorio

```bash
CuadraPro/
├── src/                        # 🧠 Código fuente del Backend
│   ├── config/db.js            # Conexión a PostgreSQL (con soporte SSL dinámico)
│   ├── controllers/            # Lógica de negocio (auth, clientes, conciliaciones)
│   ├── middlewares/            # Capas de seguridad (verificación JWT)
│   ├── routes/                 # Enrutadores Express API v1
│   └── index.js                # Archivo Maestro (Punto de entrada)
│
├── cuadrapro-frontend/         # 🎨 Aplicación React (SPA)
│   ├── src/
│   │   ├── components/Layout.jsx  # Contenedor Maestro B2B (Sidebar/Topbar)
│   │   ├── pages/                 # Vistas: Dashboard, Clientes, Captura, Configuración, Login
│   │   └── index.css              # Directivas Tailwind globales
│   ├── tailwind.config.js      # Definición de tema monocromático y colores 'b2b'
│   └── package.json            # Dependencias Frontend
│
├── .gitignore                  # Políticas de exclusión (Protección de .env)
└── package.json                # Dependencias Backend
```

---

## 🔒 Consideraciones de Seguridad
El sistema utiliza un middleware que intercepta todas las peticiones a la API para validar la vigencia y autenticidad del Token JWT. El decodificador en el Frontend se utiliza **exclusivamente** para renderizado condicional (UX), mientras que la verdadera restricción de acceso a los datos (`WHERE empresa_id = $1`) ocurre a nivel de base de datos en el Backend, asegurando que la arquitectura sea inviolable desde el cliente.

---
<div align="center">
  <i>Construido con precisión técnica y rigor estético.</i>
</div>
