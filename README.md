

 PAF-Project

## Run the project

Open two terminals from the repo root.

Backend:

```powershell
.\run-backend.ps1
```

Frontend:

```powershell
.\run-frontend.ps1
```

## What was fixed

- Updated the backend Lombok version so the Spring Boot project compiles with newer JDKs.
- Switched the frontend Tailwind integration to the PostCSS path so Vite builds reliably on this Windows setup.
- Added a local Maven runtime under `backend/apache-maven-3.9.9` because the machine did not have `mvn` installed.

## Notes

- Backend runs on `http://localhost:8080`.
- Frontend usually runs on `http://127.0.0.1:5173`. If that port is busy, Vite automatically chooses the next free port such as `5174`.
