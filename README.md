# muttle
A web application for students to practice software testing and for instructors and researchers to experiment with different feedback mechanisms.

## Quickstart development environment 

Commands below assume you're in the `muttle` directory (project root).

**Important notes**:
* Please work from the `staging` branch. If you create new branches, branch off the `staging` branch. The `main` branch is for deployments.
* The `backend/.env` file is only for development secrets—please don't add production keys to this file. 

### Install dependencies

Ensure you have Node > v16 installed. Preferably also install `yarn` for package management.

```bash
npm install -g yarn
```

#### `frontend`

```bash
cd frontend
yarn 
```

#### `backend`

```bash
cd backend
yarn 
```

Muttle uses [MutPy](https://github.com/mutpy/mutpy) to run mutation analysis. MutPy doesn't work with Python versions >= 3.9. So you need to install Python 3.7.12.

To avoid downgrading your preferred Python version, it's recommended that you use [pyenv](https://github.com/pyenv/pyenv) to manage Python versions. Once you have pyenv setup, set the Python version for the `backend` to Python 3.7.12.

```bash
# assuming you're in the muttle/backend directory
pyenv install 3.7.12 # this will take some time
pyenv local 3.7.12
```

### Set up the database

Install PostgreSQL:

```bash
brew install postgresql@14
```

Start the Postgres server:

```
brew services postgresql@14 start
```

This will start your database server at localhost:5432

Create the user and database. First enter the psql console for the default database `postgres` as the default user (your system username).

```bash
psql -d postgres -U {your username}
```

Run the following SQL queries to create the database and user.

```sql
CREATE DATABASE muttle;
CREATE USER professorx WITH PASSWORD 'mutants';
GRANT ALL PRIVILEGES ON DATABASE "muttle" TO professorx;
```

### Environment variables

Set the following environment variables:

* `MUTTLE_DB_HOST`: `postgresql://localhost:5432`
* `MUTTLE_DB_USER`: `professorx`
* `MUTTLE_DB_PW`: `mutants`
* `JWT_SECRET`: {needed for db seeding, can be set to anything}

These are needed because the values above are referred to by environment variables in the codebase. The same code runs in production, where the values are replaced with values for the production database, which are not visible for obvious reasons.

### Set up and seed the database

Do the following to set up and seed the database:

```bash
yarn db:populate
```

This drops the schema, re-creates it based on the entities in [backend/src/entity](src/entity), and seeds it with some dummy data (see [backend/src/seeds](backend/src/seeds)).

## Run servers

When everything is set up, do the following to run servers:

```
cd backend 
yarn start-dev
cd ../frontend
yart start-dev
```

Backend runs at http://localhost:3000. Frontend runs at http://localhost:3001.

