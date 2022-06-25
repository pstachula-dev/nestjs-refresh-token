# Description:
### Frontend: Next.js
### API: Nest.js

### Features
- JWT with refresh token rotation
- CSRF and XSS protection

## How to run:

Requirements:
- nodejs16+
- docker

Run:
1. `docker-compose up db`
2. `npm run db:prisma:migrate`
3. `npm run be:dev`
4. `npm run fe:dev`
5. Click on `Sign up` button and create a hardcoded user
