# Guía para publicar futuras versiones de NetSpeed

Esta guía sirve para v2.1, v2.2, v3.0 y versiones futuras.

## Antes de tocar producción

1. Guardá una copia de la versión actual.
2. Definí el nuevo número de versión, por ejemplo `2.1.0`.
3. Cambiá el texto de versión en `index.html` y la constante `VERSION` en `app.js`.
4. Cambiá el nombre del caché en `sw.js`, por ejemplo `netspeed-v2.1.0`.
5. Probá la nueva versión en iPhone y, si podés, también en Android/computadora.

## Opción recomendada: probar antes de publicar

1. En GitHub, creá una rama nueva, por ejemplo `v2.1-preview`.
2. Subí o editá los archivos en esa rama.
3. Vercel creará un Preview Deployment para esa rama.
4. Abrí el enlace de Preview y verificá:
   - que cargue la interfaz;
   - que se vea bien en móvil;
   - que el proveedor/ASN no se confundan;
   - que ping y jitter funcionen;
   - que descarga y subida terminen y queden en sus casillas correctas;
   - que la PWA siga abriendo.
5. Si todo está bien, fusioná (merge) la rama a `main`.
6. Vercel desplegará automáticamente `main` a producción.

## Opción rápida

Si el cambio es pequeño y ya lo probaste:

1. Entrá a GitHub > repositorio `netspeed`.
2. Reemplazá o editá los archivos necesarios en `main`.
3. Hacé `Commit changes`.
4. Esperá a que Vercel termine el nuevo deployment.
5. Abrí la URL pública y verificá la versión.

## Si algo sale mal

En Vercel podés volver al deployment anterior (rollback) o promover nuevamente una versión anterior. No borres el proyecto ni el dominio.

## Usuarios que ya instalaron la app

El Service Worker usa un nombre de caché con versión. Al publicar una versión nueva, cambiá ese nombre en `sw.js`. Al volver a abrir NetSpeed, el navegador descargará la actualización. Si un iPhone sigue mostrando la versión anterior, cerrá la app por completo y volvé a abrirla; como último recurso, eliminá NetSpeed de la pantalla de inicio y añadila otra vez desde Safari.

## Checklist antes de anunciar una versión

- [ ] Número de versión actualizado.
- [ ] Caché de `sw.js` actualizado.
- [ ] Ping probado.
- [ ] Jitter probado.
- [ ] Descarga probada.
- [ ] Subida probada.
- [ ] Diseño probado en iPhone.
- [ ] Operador y ASN revisados.
- [ ] Preview de Vercel revisado.
- [ ] Producción revisada después del merge a `main`.
