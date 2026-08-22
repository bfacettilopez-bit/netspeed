# NetSpeed v2.0.0

PWA para medir ping, jitter, descarga y subida, con datos de proveedor/red y confirmación manual del tipo de acceso.

## Cambios principales de v2.0

- Separa **operador comercial** de **ASN/red pública** para evitar falsos positivos.
- Ping calculado con varias muestras y mediana; jitter con variación entre muestras.
- Descarga multiconexión durante varios segundos.
- Subida multiconexión durante varios segundos.
- La interfaz muestra correctamente cada fase y guarda descarga/subida por separado.
- Mejor adaptación a iPhone.
- Service Worker actualizado a `netspeed-v2.0.0` para facilitar futuras actualizaciones.

## Publicación

El repositorio conectado a Vercel se despliega automáticamente al actualizar la rama `main`.

Leé `RELEASE_GUIDE.md` antes de publicar futuras versiones.
