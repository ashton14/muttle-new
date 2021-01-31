# muttle
Web application to develop student software testing habits through mutation testing.

## Usage:
`muttle <command> [--dev | --no-build]` (only to be run from **project root**)

Commands:
 * `install`: Installs all dependencies via `npm` for both frontend/backend.
 * `build`: Generates build artifacts for frontend/backend.
   * frontend: Uses react-scripts build to generate optimized static assets.
   * backend: Transpiles Typescript to Javascript and type declarations (not currently used, server
     instead uses `ts-node`).
* `run`: Runs the application. May be used in development mode to enable live reloads on backend/
  frontend applications.
* `clean`: Remove build artifacts and node modules.
* `clean-install`: Runs `npm ci`, which performs a clean install of node_modules for backend/frontend
   applications.
* `help`: Print help message.

Options:
 * `--dev | -D`: Run the application in development mode, with live reloads  on changes to the 
 frontend/backend applications. Frontend is accessible via the port used by `react-scripts start`
 (3001).
 * `--no-build`: Run the application, skipping the build and install steps. The development option
 supersedes this and already skips the build/install steps."


## Backend
Node/Express server backed by MySQL

### Dependencies:
* `NodeJS`: 14.15.4
* `npm`: 6.14.10
* `mySQL`: 8.0.22
* `python`: 3.7.9
* See `backend/package.json` for additional information.

## Frontend
React frontend using Bootstrap CSS framework.

### Dependencies:
* `NodeJS`: 14.15.4
* `npm`: 6.14.10
* See `frontend/package.json` for additional information.
