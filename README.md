# NETSPEED 3.0 — Global Edition

**PWA estática, sin dependencias ni build.** Proyecto independiente nacido en Paraguay. Incluye un prototipo funcional de velocidad HTTP, historial local, comparación, exportaciones, catálogo inicial de operadores, búsqueda, calculadora de descargas, diagnósticos básicos, temas, y seis traducciones iniciales (guaraní y Jopara preliminares).

## Publicación en tu GitHub + Vercel

1. **Guardá una copia del repositorio actual** y, preferentemente, creá una rama `netspeed-v3-preview`. No borres la versión pública sin tener respaldo.
2. Descomprimí el ZIP. **Subí el contenido de la carpeta `netspeed3/` a la raíz del repositorio** (no la carpeta contenedora). Reemplazá `index.html` y los archivos anteriores del proyecto que ya no se usen. Asegurate de conservar `icons/` y `data/` con su estructura.
3. Si tu Vercel ya está conectado al repositorio, un commit en `main` normalmente publica automáticamente. Para probar sin afectar la versión pública, subí los archivos primero a la rama de vista previa y abrí el enlace Preview de Vercel.
4. En Vercel usá Framework Preset **Other**, Build Command **vacío**, Output Directory **vacío** o raíz (según interfaz), e Install Command **vacío**. No necesita Node ni npm.
5. Probá desde Safari en iPhone y desde Chrome/Edge en escritorio. Para instalar en iPhone: Safari → Compartir → Añadir a pantalla de inicio.
6. Una vez validado, fusioná la rama con `main` y verificá el despliegue Ready.

## Qué funciona

- Descarga HTTP usando el endpoint público `https://speed.cloudflare.com/__down`, dos transferencias simultáneas; subida HTTP usando `https://speed.cloudflare.com/__up`. **Las mediciones son orientativas** y dependen de que el navegador y el endpoint permitan CORS y del estado del servicio; no equivalen a Speedtest certificado. No hay servidor propio ni selección geográfica de nodos.
- Latencia HTTP aproximada y variación entre muestras (etiquetada jitter, pero **no** es jitter ICMP/UDP). La pérdida de paquetes no se mide.
- IP, ASN y geolocalización aproximada por `https://speed.cloudflare.com/meta`, si el servicio responde. **No es GPS**, ni identifica de forma infalible la compañía que factura el acceso.
- Historial y preferencias en `localStorage` del dispositivo. Comparación de dos pruebas, exportación CSV/JSON, compartir por Web Share API.
- Explorador con **17 fichas de ejemplo** en `data/operators.json`. Los ASN son datos preliminares: verificar en RIR/BGP antes de usar para atribución automática. Se muestran iniciales estilizadas, **no logos oficiales**, porque no se incluyeron recursos de marca licenciados.
- Temas automático, oscuro, claro, OLED, Aero; brillo y animación reducibles. Estilo visual inspirado en Liquid Glass, no API nativa de Apple.
- Idiomas disponibles de forma **parcial**: español paraguayo, guaraní, Jopara, inglés, portugués brasileño, francés. Solo los textos principales de navegación y medidor están traducidos; otras pantallas siguen en español. El resto de idiomas mencionados están planificados, no habilitados. Traducciones guaraní/Jopara requieren revisión lingüística.
- PWA con caché local para archivos estáticos; pruebas y metadatos requieren Internet.

## Qué NO está implementado todavía

- Registro mundial completo de ISP, sincronización RIR/BGP/PeeringDB, geocobertura y mapa interactivo, incidencias en vivo, servidores propios, verificación jurídica, logos oficiales, cuentas en la nube, estadísticas agregadas de terceros, GPS, MCC/MNC, identificación real de 5G/fibra, prueba ICMP, traceroute, DNS arbitrario, WebRTC avanzado, exportación PNG y traducción íntegra a cientos de idiomas.
- No hay backend ni almacenamiento central. Para estas funciones necesitaremos APIs, licencias, presupuesto de tráfico, políticas de privacidad y validación de datos.

## Datos, costos y privacidad

- Una prueba puede consumir aproximadamente 4–40 MB o más (descarga + subida); el consumo real depende de la respuesta. Evitá usarla en planes de datos limitados sin consentimiento.
- Los servicios públicos de Cloudflare son de terceros y pueden cambiar, limitar solicitudes o no admitir la prueba desde algunos navegadores. No hay garantía de disponibilidad.
- No se envía el historial a un servidor del proyecto. Cloudflare sí recibe solicitudes de red al medir y consultar IP. Consultá su política de privacidad antes de publicar a gran escala.
- El directorio es informativo. No afirmamos afiliación con ningún operador. Verificá la titularidad y permisos de logos antes de añadirlos.

## Estructura

```
index.html              interfaz
styles.css              temas, Frutiger Aero, cristal
app.js                  lógica de PWA, medición y herramientas
manifest.webmanifest    instalación PWA
sw.js                   caché estática v3
vercel.json             encabezados de seguridad básicos
data/operators.json     catálogo editable inicial
icons/icon.svg          logo original NETSPEED
icons/icon-192.png      icono PWA
icons/icon-512.png     icono PWA (ruta real: icons/icon-512.png)
```

## Ampliar operadores

Editá `data/operators.json`, manteniendo el JSON válido. Campos: `name`, `legal`, `country`, `code`, `type` (`mobile`, `fixed`, `mixed`, `satellite`), `asns` (lista numérica), `website`, `technologies` (lista), `status`. **No asignar un ASN entero a una marca** cuando el operador usa redes compartidas. Para una atribución real, cruzar prefijos y fuentes con fechas de verificación.

## Próximas etapas recomendadas

1. API propia para datos de operadores con fuentes RIR/RDAP, BGP, PeeringDB y revisión de marcas.
2. Logos con autorización y enlaces oficiales verificados.
3. Pruebas de rendimiento con servidores controlados, múltiples conexiones, duración adaptable y selección regional.
4. Traducciones completas revisadas, RTL, filtros avanzados, mapas con datos autorizados, cuentas opcionales y privacidad reforzada.
5. Tests automatizados de navegadores y accesibilidad, monitorización de errores y presupuesto de rendimiento.
