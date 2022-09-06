# muttle
Web application to develop student software testing habits through improved testing feedback.

### Quickstart development environment 

Commands below assume you're in the `muttle` directory (project root).

1. Install Docker.
2. Clone this repository.
3. In the `muttle` directory, run

```bash
docker compose up
```

This will take some time to run for the first time while it builds the images for the frontend and backend and downloads the image for the database. Subsequent runs should go quicker.

This command does three things:
* Sets up a PostgreSQL database running at port `5432`. This can be accessed through any relational database client, even if you don't have Postgres installed on your computer.
  - If you run into errors saying `no database named "muttle"`, connect to the database and create it manually.
* Sets up and serves the frontend at `http://localhost:3001`.
* Sets up and serves the backend API at `http://localhost:3000` (even though the console output says "App listening on port 80").

Changes you make to the backend or frontend code should be reflected in the running servers.

Navigate to http://localhost:3001 to see the website.

To stop servers:

```bash
docker compose down
```

To run commands inside one of the containers (e.g., to run CLI commands inside the backend container), prefix your command with `docker compose run [service name]`. So to end up in a terminal in the (running) backend container:

```bash
docker compose run backend bash
```
