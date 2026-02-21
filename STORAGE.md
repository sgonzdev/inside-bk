# Storage (MinIO / S3)

## Arquitectura

El proyecto usa **MinIO** como almacenamiento de objetos compatible con S3.  
Se levanta automáticamente con `docker compose up`.

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| MinIO API | `9000` | Endpoint S3 (usado por el backend) |
| MinIO Console | `9001` | UI web para administrar buckets |

> Consola web: [http://localhost:9001](http://localhost:9001)  
> Usuario: `minioadmin` / Contraseña: `minioadmin`

---

## Variables de entorno

```env
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=insideout
S3_REGION=us-east-1
S3_PUBLIC_URL=http://localhost:9000
```

- `S3_ENDPOINT` usa `minio` (nombre del servicio Docker) dentro de la red.
- `S3_PUBLIC_URL` es la URL que el frontend usará para acceder a los archivos.

---

## Endpoints

### `POST /api/v1/upload/avatar`

Sube o reemplaza el avatar del usuario autenticado.

- **Auth**: Bearer token requerido
- **Content-Type**: `multipart/form-data`
- **Campo**: `avatar` (archivo de imagen)
- **Tipos permitidos**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- **Tamaño máximo**: 5 MB

```bash
curl -X POST http://localhost:3000/api/v1/upload/avatar \
  -H "Authorization: Bearer <token>" \
  -F "avatar=@foto.jpg"
```

**Respuesta exitosa:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Santiago",
    "lastName": "García",
    "avatarUrl": "http://localhost:9000/insideout/avatars/userId/uuid.jpg",
    "..."
  }
}
```

### `DELETE /api/v1/upload/avatar`

Elimina el avatar del usuario autenticado.

- **Auth**: Bearer token requerido

```bash
curl -X DELETE http://localhost:3000/api/v1/upload/avatar \
  -H "Authorization: Bearer <token>"
```

---

## Códigos de error

| Código | Descripción |
|--------|-------------|
| `UPLOAD_NO_FILE` | No se envió ningún archivo |
| `UPLOAD_INVALID_TYPE` | Tipo de archivo no permitido |
| `UPLOAD_TOO_LARGE` | Archivo excede 5 MB |
| `UPLOAD_FAILED` | Error interno al subir |

---

## Estructura de archivos en el bucket

```
insideout/
  avatars/
    {userId}/
      {uuid}.jpg
      {uuid}.png
```

---

## Cómo funciona internamente

1. **Multer** recibe el archivo en memoria (`memoryStorage`).
2. Se genera un key único: `avatars/{userId}/{uuid}.{ext}`.
3. Se sube a MinIO vía `@aws-sdk/client-s3` (`PutObjectCommand`).
4. Si el usuario ya tenía avatar, se elimina el anterior del bucket.
5. Se actualiza `avatarUrl` en la tabla `users`.
6. El bucket se crea automáticamente al iniciar el servidor (`ensureBucket()`).

---

## Usar en producción

Para producción, reemplaza las variables de entorno con las de tu proveedor S3:

```env
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=tu-access-key
S3_SECRET_KEY=tu-secret-key
S3_BUCKET=tu-bucket
S3_REGION=us-east-1
S3_PUBLIC_URL=https://tu-bucket.s3.amazonaws.com
```

El código es 100% compatible con AWS S3, DigitalOcean Spaces, Cloudflare R2, etc.
