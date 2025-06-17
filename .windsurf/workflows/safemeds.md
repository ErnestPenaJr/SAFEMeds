# Windsurf Rules for SAFEMeds Project

## Project Structure
The project follows a structure common for React/React Native applications.

- `app/`: Contains the main application screens or routes.
- `assets/`: For static assets like images and fonts.
- `components/`: Reusable UI components.
- `hooks/`: Custom React hooks.
- `lib/`: Utility functions and libraries.
- `src/`: Source code, potentially for backend services if following a monorepo structure.
- `supabase/`: Supabase specific configuration and migrations.
- `public/`: Publicly accessible files.
- `node_modules/`: Project dependencies.

## Tech Stack

### Frontend
- **Framework**: React + React Native with Expo
- **Language**: TypeScript
- **Styling**: TBD (likely StyleSheet or a library like Styled Components/Tamagui)
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Validation**: Zod
- **Authentication**: JWT + Passport.js

### Database
- **Primary**: SQL Server with Prisma ORM.
- **Note**: The presence of a `supabase` directory suggests Supabase might be used. Please clarify if Supabase is used alongside or instead of SQL Server.

### Hosting
- **Platform**: Azure App Service

## Code Style
- Follow existing code patterns.
- Use Prettier for automated code formatting.
- Use CamelCase for variables and functions.
- Use PascalCase for components and classes.
- Keep files focused on a single responsibility.

## Security
- Use HTTPS for all communication.
- Implement robust authentication and authorization using JWT and Passport.js.
- Store sensitive information like API keys and database credentials in environment variables (`.env`) and never commit them to version control.
- Validate all user input on both client and server sides (using Zod on the backend).
- Protect against common web vulnerabilities (XSS, CSRF, etc.).
- Use secure cookie settings.
- Implement secure file uploads if applicable.

## Workflow
- Create a `CHANGELOG.md` to document changes.
- Create a `DEBUG_LOG.md` for debugging sessions.
- Use Git for version control, with meaningful commit messages.
- All new features should be developed in separate branches.
- Code should be reviewed before merging into the main branch.
