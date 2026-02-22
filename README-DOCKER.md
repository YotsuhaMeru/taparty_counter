# Docker Setup Instructions

This project can be run using Docker and Docker Compose.

## Prerequisites

- Docker
- Docker Compose

## Setup and Run

1.  **Environment Variables**
    Ensure you have a `.env` file in the root directory. You can use `sample.json` as a reference or the existing `.env` file.
    The `docker-compose.yml` file is configured to use the `.env` file for secrets like `JWT_SECRET` and `INVITATION_CODE`.

    _Note: `DATABASE_URL`, `NEXT_PUBLIC_RP_ID`, and `NEXT_PUBLIC_ORIGIN` are overridden in `docker-compose.yml` to work with the local Docker environment._

2.  **Build and Start**
    Run the following command to build the image and start the containers:

    ```bash
    docker-compose up -d --build
    ```

3.  **Database Migration**
    After the containers are running, you need to apply the database migrations. Run:

    ```bash
    docker-compose exec app prisma migrate deploy
    ```

    _Note: This command executes the migrations inside the running `app` container against the `db` container._

4.  **Access the Application**
    Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## Stopping and Restarting

### Stop the application

To stop the containers without removing data:

```bash
docker-compose stop
```

To stop and remove containers (data in volumes will persist):

```bash
docker-compose down
```

### Restart the application

If you have stopped the containers with `docker-compose stop`:

```bash
docker-compose start
```

If you have removed the containers with `docker-compose down`, or to start fresh:

```bash
docker-compose up -d
```

_Note: You don't need `--build` unless you have modified the code or Dockerfile._

## Troubleshooting

- **Database Connection Issues**: Ensure the `db` service is healthy. You can check logs with `docker-compose logs db`.
- **Rebuilding**: If you make changes to `package.json` or the Dockerfile, make sure to rebuild with `docker-compose up -d --build`.
