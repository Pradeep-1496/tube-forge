# TubeForge Frontend — Angular Implementation Plan

## 1. Project Setup & Config

- Base URL: `http://localhost:3000/api`
- Proxy config: `proxy.conf.json` → `/api` → `http://localhost:3000/api`
- Angular CLI workspace: standalone components + Signular (or NgRx if state needs scaling)
- Extras: Angular Material / shadcn-angular, Tailwind CSS

## 2. Folder Structure

```
src/app/
├── core/
│   ├── services/
│   │   └── api.service.ts
│   ├── interceptors/
│   │   └── error.interceptor.ts
│   └── models/
│       ├── video-content.model.ts
│       ├── audio.model.ts
│       ├── background.model.ts
│       ├── background-video.model.ts
│       ├── subscribe-image.model.ts
│       ├── metadata.model.ts
│       ├── create-content.dto.ts
│       ├── update-content.dto.ts
│       ├── generate-video.dto.ts
│       ├── generate-from-video.dto.ts
│       └── create-metadata.dto.ts
├── features/
│   ├── content/
│   │   ├── content-list/
│   │   ├── content-form/
│   │   └── content.service.ts
│   ├── video-generation/
│   │   ├── video-list/
│   │   ├── generate-video-form/
│   │   ├── background-video-selector/
│   │   └── video.service.ts
│   ├── media-library/
│   │   ├── audio-manager/
│   │   ├── background-manager/
│   │   ├── background-video-manager/
│   │   └── subscribe-image-manager/
│   └── metadata/
│       ├── metadata-list/
│       └── metadata-form/
└── shared/
    ├── components/
    │   ├── file-upload/
    │   ├── confirm-dialog/
    │   └── loading-spinner/
    └── utils/
        └── form-helpers.ts
```

## 3. Core HTTP Service

Interface in `core/services/api.service.ts`:
- `get<T>(url: string): Observable<T>`
- `post<T>(url: string, body: any): Observable<T>`
- `put<T>(url: string, body: any): Observable<T>`
- `delete<T>(url: string): Observable<T>`
- `uploadFile(url: string, formData: FormData): Observable<any>`

Error interceptor: catch HTTP errors → show toast/notification; for 401 logout (if auth added later).

## 4. API Endpoints & Types

### Content Management — `content-management.controller.ts`
| Method | Endpoint | Request Body | Response Type | Status |
|--------|----------|--------------|---------------|--------|
| POST | `/content` | `CreateContentDto` | `VideoContent` | 201 |
| GET | `/content` | — | `VideoContent[]` | 200 |
| GET | `/content/:id` | — | `VideoContent` | 200 |
| PUT | `/content/:id` | `UpdateContentDto` | `VideoContent` | 200 |
| DELETE | `/content/:id` | — | `{ message: string }` | 200 |

`VideoContent` model:
```ts
interface VideoContent {
  id: string;
  title: string;
  content: string;
  type?: 'video' | 'audio' | 'image' | 'text';
  createdAt?: string;
  updatedAt?: string;
}
```

`CreateContentDto`:
```ts
interface CreateContentDto {
  title: string;
  content: string;
  type?: 'video' | 'audio' | 'image' | 'text';
}
```

`UpdateContentDto`:
```ts
interface UpdateContentDto {
  title?: string;
  content?: string;
  type?: 'video' | 'audio' | 'image' | 'text';
}
```

---

### Video Generation — `video-generation.controller.ts`
| Method | Endpoint | Request Body | Response Type | Status |
|--------|----------|--------------|---------------|--------|
| GET | `/video-generation/videos` | — | any[] | 200 |
| GET | `/video-generation/video/:id` | — | any | 200 |
| POST | `/video-generation/generate/:id` | `GenerateVideoDto` | any | 200 |
| POST | `/video-generation/generate-from-video/:videoContentId/:backgroundVideoId` | `GenerateFromVideoDto` | any | 200 |
| GET | `/video-generation/themes` | — | `string[]` | 200 |

`GenerateVideoDto`:
```ts
interface GenerateVideoDto {
  backgroundId?: string;
  theme?: 'glassmorphism' | 'neon' | 'viral' | 'apple' | 'gold' | 'none' | 'custome' | 'news';
  audioId?: string;
  subscribeImageId?: string;
}
```

`GenerateFromVideoDto`:
```ts
interface GenerateFromVideoDto {
  audioId?: string;
  theme?: 'glassmorphism' | 'neon' | 'viral' | 'apple' | 'gold' | 'none' | 'custom' | 'news';
  subscribeImageId?: string;
}
```

---

### Audio Management — `audio-management.controller.ts`
| Method | Endpoint | Request Body | Response Type | Status |
|--------|----------|--------------|---------------|--------|
| POST | `/audios/upload` | multipart: `file` + `name` | `Audio` | 201 |
| GET | `/audios` | — | `Audio[]` | 200 |
| GET | `/audios/:id` | — | `Audio` | 200 |
| DELETE | `/audios/:id` | — | `{ message: string }` | 200 |

`Audio` model:
```ts
interface Audio {
  audio_id: string;
  name: string;
  path: string;
  length?: number;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}
```

---

### Background Management — `background-management.controller.ts`
| Method | Endpoint | Request Body | Response Type | Status |
|--------|----------|--------------|---------------|--------|
| POST | `/backgrounds/upload` | multipart: `file` + `name` + `type?` | `Background` | 201 |
| GET | `/backgrounds` | — | `Background[]` | 200 |
| GET | `/backgrounds/:id` | — | `Background` | 200 |
| DELETE | `/backgrounds/:id` | — | `{ message: string }` | 200 |

`Background` model:
```ts
interface Background {
  id: string;
  name: string;
  path: string;
  size?: number;
  type?: 'portrait' | 'landscape';
  createdAt?: string;
  updatedAt?: string;
}
```

---

### Background Video Management — `background-video-management.controller.ts`
| Method | Endpoint | Request Body | Response Type | Status |
|--------|----------|--------------|---------------|--------|
| POST | `/background-videos/upload` | multipart: `file` + `name` + `type?` | `BackgroundVideo` | 201 |
| GET | `/background-videos` | — | `BackgroundVideo[]` | 200 |
| GET | `/background-videos/:id` | — | `BackgroundVideo` | 200 |
| DELETE | `/background-videos/:id` | — | `{ message: string }` | 200 |

`BackgroundVideo` model:
```ts
interface BackgroundVideo {
  bg_video_id: string;
  name: string;
  path: string;
  size?: number;
  type?: 'portrait' | 'landscape';
  createdAt?: string;
  updatedAt?: string;
}
```

---

### Subscribe Image Management — `subscribe-image-management.controller.ts`
| Method | Endpoint | Request Body | Response Type | Status |
|--------|----------|--------------|---------------|--------|
| POST | `/subscribe-images/upload` | multipart: `file` + `name` + `type?` | `SubscribeImage` | 201 |
| GET | `/subscribe-images` | — | `SubscribeImage[]` | 200 |
| GET | `/subscribe-images/:id` | — | `SubscribeImage` | 200 |
| PUT | `/subscribe-images/:id` | multipart: `file?` + `name?` + `type?` | `SubscribeImage` | 200 |
| DELETE | `/subscribe-images/:id` | — | `{ message: string }` | 200 |

`SubscribeImage` model:
```ts
interface SubscribeImage {
  id: string;
  name: string;
  path: string;
  size?: number;
  type?: 'portrait' | 'landscape';
  createdAt?: string;
  updatedAt?: string;
}
```

---

### Metadata Management — `metadata-management.controller.ts`
| Method | Endpoint | Request Body | Response Type | Status |
|--------|----------|--------------|---------------|--------|
| POST | `/metadata` | `CreateMetadataDto` | `Metadata` | 201 |
| GET | `/metadata` | — | `Metadata[]` | 200 |
| GET | `/metadata/:id` | — | `Metadata` | 200 |

`Metadata` model:
```ts
interface Metadata {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  file_name?: string;
  category_id?: string;
  default_language?: string;
  privacy_status?: string;
  publish_at?: string;
  self_declared_made_for_kids?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

## 5. Implementation Steps

1. `ng new frontend --standalone --routing --style=css --skip-git --skip-tests`
2. Add `proxy.conf.json`:
   ```json
   {
     "/api": {
       "target": "http://localhost:3000",
       "changeOrigin": true,
       "secure": false
     }
   }
   ```
3. `ng serve --proxy-config proxy.conf.json`
4. Install Angular Material / Tailwind.
5. Generate shared components (`FileUploadComponent`, `ConfirmDialogComponent`).
6. Implement `ApiService` + `ErrorInterceptor`.
7. Create feature modules and pages listed above.
8. Build generation wizard: select VideoContent → Background/BackgroundVideo → Audio → SubscribeImage → Theme → Generate.
9. Add loading states, error toasts, and preview placeholders for generated video URLs.
