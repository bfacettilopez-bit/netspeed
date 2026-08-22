# NetSpeed Paraguay

Web pública instalable como PWA para medir ping, jitter, descarga y subida.

## Datos de red
- Detecta IP, organización/ISP y ubicación aproximada mediante IP pública.
- Mapea Tigo, Personal, Claro, VOX y COPACO a sus razones sociales verificadas.
- Usa Cloudflare Speed Network para la prueba y muestra el nodo/colo cuando está disponible.
- El tipo físico de acceso (5G/4G/3G, fibra, HFC, ADSL) no siempre es accesible desde el navegador; por eso se permite confirmarlo manualmente.

## Publicar en Vercel
Desde esta carpeta, con una cuenta de Vercel autenticada:

    vercel --prod

También se puede arrastrar/importar este proyecto en Vercel o publicar como sitio estático en cualquier hosting HTTPS.

## Instalar como app
Una vez publicada por HTTPS:
- Android/Chrome: usar “Instalar app”.
- iPhone/Safari: Compartir > Añadir a pantalla de inicio.
