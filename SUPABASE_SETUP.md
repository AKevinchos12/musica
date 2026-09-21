# Base de datos para Nuestra Música

La app ya incluye la API en `/api/cards` y el esquema en `supabase-schema.sql`.

## 1. Crear el proyecto

1. Entra a [supabase.com](https://supabase.com) y crea un proyecto.
2. Abre `SQL Editor` y ejecuta todo el contenido de `supabase-schema.sql`.
3. Ve a `Project Settings > API`.
4. Copia `Project URL` y `service_role key`.

## 2. Configurar Next.js

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

No publiques ni subas `.env.local` a Git. La `service_role key` solo se usa en el servidor.

Reinicia el servidor:

```bash
pnpm dev
```

En la cabecera aparecerá `En la nube` cuando la API responda correctamente.

## 3. Crear una card nueva

Pulsa `Nueva card`, rellena los datos, selecciona el audio y, opcionalmente, una portada. Con Supabase configurado, el audio y la imagen se guardan en Storage y los datos en `music_cards`.

## 4. Añadir audio a una card que ya existe

Cada card tiene un botón con icono de subida en la parte inferior. Selecciona un audio y:

- En una card creada desde la web, reemplaza el audio también en Supabase.
- En una card inicial (`ded-1`, `ded-2`, etc.), el audio se guarda localmente en ese navegador como reemplazo. Las cards iniciales son datos del código, no filas de la base de datos.

Para que una card inicial y su audio estén disponibles en todos los dispositivos, créala de nuevo con `Nueva card` usando el mismo título, o migra esa card a Supabase como una nueva card remota.

## Nota

Sin `.env.local`, la app sigue funcionando con `localStorage`. Esa información no se comparte entre dispositivos; Supabase es lo que activa la biblioteca común.

## 5. Publicarla como web

GitHub guarda el código y Vercel publica la aplicación de Next.js.

1. Crea un repositorio vacío en GitHub, sin README ni `.gitignore` adicional.
2. Sube este proyecto a ese repositorio.
3. Entra a [vercel.com](https://vercel.com), pulsa `Add New Project` y selecciona el repositorio de GitHub.
4. En `Settings > Environment Variables` añade estas dos variables para `Production`, `Preview` y `Development`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

5. Pulsa `Deploy`. Cada push posterior a la rama principal publicará una nueva versión automáticamente.

No subas `.env.local`, la `service_role key`, audios privados ni archivos de build. El `.gitignore` del proyecto ya excluye las variables locales, `node_modules` y `.next`.
