# CuadraPro — Bóveda de Conciliación Financiera B2B

<div align="center">
  <img src="https://img.shields.io/badge/Cuadra-PRO-00C49F?style=for-the-badge&logo=shield&logoColor=white" alt="CuadraPro Logo" width="220" />
  <p><strong>Plataforma SaaS Multi-Tenant robustecida para el análisis y gestión de flujos de efectivo, deducciones y facturación corporativa.</strong></p>
  
  <p>
    <a href="#arquitectura-tecnológica"><img src="https://img.shields.io/badge/Stack-PERN-blue?style=flat-square&logo=postgresql" alt="Stack PERN" /></a>
    <a href="#estructura-del-directorio"><img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-61DAFB?style=flat-square&logo=react" alt="React" /></a>
    <a href="#arquitectura-tecnológica"><img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=nodedotjs" alt="Node.js" /></a>
    <a href="#seguridad-y-criptografía"><img src="https://img.shields.io/badge/Seguridad-AES--256--GCM%20%2B%20Zod%20%2B%20Helmet-green?style=flat-square&logo=express" alt="Seguridad" /></a>
  </p>
  
  <br />
</div>

---

## Visión General

**CuadraPro** es una solución empresarial avanzada (SaaS) diseñada para resolver la conciliación bancaria y la auditoría fiscal en negocios medianos y corporativos que operan con múltiples pasarelas de pago. La plataforma actúa como una **bóveda centralizada** donde se consolidan estados de cuenta bancarios, facturas CFDI del SAT e ingresos de pasarelas, detectando de forma automática discrepancias contables o comisiones abusivas no declaradas.

El sistema se estructura bajo una arquitectura **Multi-Tenant segura**, aislando estrictamente la información de cada empresa y ofreciendo un rendimiento de alto nivel tanto en modo claro como en modo oscuro.

---

## Diagrama de Funcionamiento

El siguiente flujo describe cómo entran los datos a la plataforma, las capas de validación aplicadas y los resultados contables generados:

```mermaid
flowchart TD
    classDef highlight fill:#00C49F,stroke:#00C49F,stroke-width:1px,color:#fff;
    classDef normal fill:#151922,stroke:#2d3748,stroke-width:1px,color:#fff;
    classDef database fill:#1c2333,stroke:#3b82f6,stroke-width:1px,color:#fff;

    A[Estados de Cuenta Bancarios - CSV/Bancos]:::normal --> D[Bóveda Central CuadraPro]:::highlight
    B[Facturación CFDI del SAT - XML]:::normal --> D
    C[Liquidaciones de Pasarelas - Clip/MercadoPago/Stripe]:::normal --> D

    D --> E{Motor de Conciliación B2B}:::highlight
    E -->|1. Validación de Esquemas| F[Middleware de Seguridad Zod]:::normal
    E -->|2. Detección de Fugas| G[Diferenciales en Tasas de Comisiones]:::normal
    E -->|3. Cruce de Datos| H[Depósitos Bancarios vs SAT]:::normal

    F --> I[(PostgreSQL - Multi Tenant)]:::database
    G --> J[Dashboard Contable & KPIs]:::highlight
    H --> J
    J --> K[Simulador & Reportes - PDF/XLSX/CSV]:::normal
```

---

## Características Principales

El sistema se estructura en los siguientes módulos y funcionalidades del cliente:

*   **Acceso (Login Premium):**
    *   **Google OAuth Real / Simulación:** Selector interactivo inteligente que permite iniciar sesión con cuentas reales de Google o en modo simulado para desarrollo local y pruebas de flujos.
    *   **Botón de Retorno Elegante:** Botón flotante absolute con desenfoque de fondo glassmorphic en la esquina superior izquierda que permite a las personas regresar de forma elegante a la Landing Page del sitio.
*   **Inicio (Dashboard Contable):**
    *   **KPIs en Vivo:** Visualización en tiempo real de Balance Total, Efectivo Disponible, Utilidad Neta y Gastos Totales alimentados por la base de datos local.
    *   **Glosario para No-Devs:** Tooltips contextuales interactivos y animados que explican de forma clara y cotidiana el significado de cada métrica.
    *   **Rendimiento Financiero:** Gráfico compuesto interactivo de Recharts que combina ingresos mensuales vs. gastos en barra y área con degradado neón.
    *   **Desglose de Gastos:** Gráfico de tipo dona (`PieChart`) que representa de forma visual las proporciones de comisiones Clip, Mercado Pago y retenciones del SAT.
*   **Directorio B2B (Cuentas y Tenants):**
    *   Gestión y administración maestro-inquilino (*Multi-Tenant*), permitiendo el registro y vinculación de perfiles de clientes y sus correspondientes niveles de cuenta (Básico, Profesional, Enterprise).
*   **Conciliación (Captura y Cargas):**
    *   Módulo de carga y arrastre de estados de cuenta bancarios (CSV) e integraciones SAT. Formulario de arqueo diario de caja e ingreso manual de transacciones con inputs responsivos.
*   **Reportes (Auditoría Fiscal):**
    *   Módulo de conciliación que contrasta la facturación fiscal emitida en el SAT contra el volumen real conciliado en bancos. Historial descargable de auditorías contables listas para exportar a PDF, XLSX y CSV.
*   **Comisiones (Simulador de Pagos):**
    *   Calculadora de dispersión de comisiones. Permite ingresar un monto y calcular al instante el Neto a Recibir restando la tasa del proveedor (*Clip*, *Mercado Pago*, *Stripe*), el IVA y la retención del SAT.
*   **Configuración (Centro de Control):**
    *   Centro de control donde el administrador puede definir comisiones base, consultar bitácoras de auditoría de seguridad y configurar credenciales fiscales CIEC.
*   **Modo Claro / Oscuro Elástico:**
    *   Toggle de tema integrado en el sidebar con animaciones de Framer Motion. Ajuste inteligente que actualiza gráficos y tablas para una lectura perfecta sin contrastes agresivos.
*   **Control de Inactividad y Seguridad:**
    *   Temporizador de inactividad que lanza un modal interactivo con conteo regresivo en tiempo real tras 90 segundos de inactividad contable. Si no hay interacción al finalizar los 30 segundos del conteo, la sesión se cierra automáticamente.

---

## Seguridad y Criptografía

*   **Protección de Cabeceras HTTP (Helmet):** Mitigación activa de ataques de scripting cruzado (XSS) y Clickjacking.
*   **Validación Estricta con Zod:** Auditoría de esquemas de datos antes de interactuar con la base de datos PostgreSQL, previniendo inyecciones de SQL.
*   **Cifrado Simétrico AES-256-GCM:** Encriptación de tokens bancarios y secretos del SAT en descanso, firmados con tags de autenticación únicos.
*   **Manejador de Errores Centralizado:** Interceptor de fallas de base de datos que previene la fuga de logs y stack traces al entorno del cliente.

---

## Paleta de Colores y Estética

*   **Verde Esmeralda Fintech (`#00C49F`):** Color acento principal utilizado en estados completados, checks de éxito y barras de progreso.
*   **Negro Profundo (`#0B0F19`):** Fondo general del documento en modo oscuro para una estética tipo Figma.
*   **Carbón de Contraste (`#151922`):** Color de fondo para tarjetas y barra lateral en modo oscuro.
*   **Gris Claro (`#f8f9fa`):** Fondo general de la plataforma en modo claro para una visualización limpia y descansada.

---

## Variables de Entorno

**Backend (`cuadrapro-backend/.env`):**
```env
PORT=3000
DATABASE_URL=postgresql://[usuario]:[password]@aws-1-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require
JWT_SECRET=tu_firma_secreta_super_segura
GOOGLE_CLIENT_ID=[id_cliente_google_console]
```

**Frontend (`cuadrapro-frontend/.env`):**
```env
VITE_API_URL=https://cuadrapro.onrender.com
VITE_GOOGLE_CLIENT_ID=[id_cliente_google_console]
```

---

## Guía de Despliegue en Producción

### 1. Servidor Backend (Render.com)
*   **Root Directory:** `cuadrapro-backend`
*   **Build Command:** `npm install`
*   **Start Command:** `npm start`
*   **Escape de Contraseñas (Supabase/PostgreSQL):** Si la contraseña de conexión a la base de datos contiene caracteres especiales como `%`, deben codificarse utilizando formato percent-encoding en la variable `DATABASE_URL` (por ejemplo, reemplazar `%` por `%25` y `%%` por `%25%25`), o configurar las credenciales de forma separada utilizando variables individuales para evitar fallos de resolución DNS del parser de URI de Node.

### 2. Cliente Frontend (Vercel)
*   **Root Directory:** `cuadrapro-frontend`
*   **Framework Preset:** `Vite`
*   **Build Command:** `npm run build`
*   **Output Directory:** `dist`
*   **Redeploy Obligatorio:** Tras añadir o editar cualquier variable de entorno (`VITE_API_URL` o `VITE_GOOGLE_CLIENT_ID`), es indispensable realizar un *Redeploy* manual del despliegue en Vercel para inyectar los valores en el compilado estático.

---

## Estructura del Directorio

```bash
CuadraPro/
├── assets/                        # Recursos estáticos y mockups del proyecto
│   └── cuadrapro_mockup.jpg       # Imagen del Dashboard de CuadraPro
│
├── cuadrapro-backend/             # Código fuente y configs del Backend
│   ├── src/
│   │   ├── config/db.js           # Conexión a PostgreSQL
│   │   ├── controllers/           # Lógica de negocio (auth, conciliaciones, etc.)
│   │   ├── middlewares/           # Capas de seguridad (validateSchema.js, JWT)
│   │   ├── routes/                # Enrutadores Express API v1 con Zod
│   │   ├── utils/cryptoHelper.js  # Suite de cifrado AES-256-GCM en descanso
│   │   └── index.js               # Servidor maestro con Helmet y Global Error Handler
│   ├── package.json               # Dependencias de Backend (helmet, zod, pg)
│   └── .gitignore
│
├── cuadrapro-frontend/            # Aplicación React (SPA)
│   ├── src/
│   │   ├── components/Layout.jsx  # Contenedor B2B (Modo Oscuro, buscador e inactividad)
│   │   ├── pages/                 # Vistas: Dashboard, Clientes, Captura, Reportes, Pagos, Configuración
│   │   └── index.css              # Directivas Tailwind y layers
│   ├── tailwind.config.js         # Configuración del tema y colores 'b2b'
│   └── package.json               # Dependencias Frontend (framer-motion, recharts)
│   
└── .gitignore                     # Políticas de exclusión globales
```

---
<div align="center">
  <i>Construido con precisión contable, rigor de seguridad y refinamiento estético de nivel corporativo.</i>
</div>
