

# DBER | Database design tool based on entity relation diagram
Install the dependences.
```bash
npm install
# or
yarn install
```

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Run in the production mode:

```bash
npm run build && npm run start
```

Export static pages:

```bash
npm run gen
```

## Build & Startup with docker

Build docker image with command:

```
docker build -t dber .
```

Then run it with docker or docker compose:

```
docker run -p 3000:3000 dber
```

OR

```bash
docker-compose up -d
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Inspired by
[dbdiagram](https://dbdiagram.io/)
[antv x6](https://x6.antv.vision/)
