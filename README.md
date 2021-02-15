# muttle
Web application to develop student software testing habits through improved testing feedback.

## Initial Setup
Follow these steps for initial setup

1. Install and setup mySQL v8.0.22 or higher
2. Clone the repository: `git clone git@github.com:jlai12/muttle.git && cd muttle`
3. Run `muttle db-setup <admin> [password]` with admin credentials for your mysql database*
4. Execute any of the [usage commands](#usage)!

[*] Should you run into issues using the `muttle db-setup` command, you may need to execute the
commands from the [database setup script](/scripts/db-setup.sql) in order to create a database and
credentials for the application. Alternatively, you may manually set up credentials and a database
and then configure the database connection in the [ORM config](backend/ormconfig.json).

## Usage
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
* `db-setup <admin> [password]`: Runs the [db-setup.sql](/scripts/db-setup.sql) script using the
   provided mySQL admin credentials to create the database and credentials necessary for the backend
   application to connect to mySQL.
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
* `yarn`: 1.22.10
* `mySQL`: 8.0.22
* `python`: 3.7.9
* See the backend [package.json](backend/package.json) for additional information.

## Frontend
React frontend using Bootstrap CSS framework.

### Dependencies:
* `NodeJS`: 14.15.4
* `yarn`: 1.22.10
* See the frontned [package.json](frontend/package.json) for additional information.

