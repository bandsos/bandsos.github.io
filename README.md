# BanD-SOS - Bangladesh Delta Floodings: An Integrated Framework for Social Adaptation to Cyclone Surges
Experimented on the Bengal delta in Bangladesh, BanD-SOS aims to establish a pre-operational service for forecasting cyclonic flooding and the associated societal risk. This service will have two components: a forecast of the flooding hazard in real time when a tropical cyclone hits the coast, and a coupling of this forecast with a mapping of the vulnerability of the exposed populations.

## Overview
The Bengal delta, straddling Bangladesh and India, is hit by a major tropical cyclone every 3 years on average. Their occurrence is relatively moderate compared to other tropical regions, representing only 5% of global cyclones. The impact of these events is however major, representing 50% of the cyclone victims recorded on the whole globe. This is due to the very low topography of the delta above sea level (less than 5 meters) and the fragility of coastal defense structures, combined with the high density of the vulnerable population.

The exposure of the Bengal delta to cyclonic flooding is increasing in the current context of sea level rise due to climate change. The objective of the BanD-SOS project is to develop a pre-operational flood forecasting system that will :

- Provide in real time the basic information necessary for the implementation of evacuation and protection operations when a hurricane event occurs,
- Assist in the development of public policies for adaptation to the flood hazard necessary to ensure the resilience of the Delta population in the medium to long term.

To this end, the BanD-SOS service will consist in pre-operationalizing a numerical forecasting platform for cyclonic flooding over Bengal, for which we have completed the proof-of-concept (Khan et al., 2021). The BanD-SOS service will ensure the prediction of the flood hazard, combined with spatialized information of the socio-spatial vulnerability of the exposed territories

The main user of the first operational service available will be the Bangladesh Flood Forecasting and Warning Center (FFWC). The pre-operational version is based on the database of the Bangladesh Water Development Board (BWDB), a FFWC's parent organization.

The demonstration of the replication of this pre-operational chain will be realized with the porting of the solution on the Amazon Delta.

## Objective
The objective of the project is to build a pre-operational production chain for our coastal flooding prediction platform. It can be activated on demand and in real time by non-specialists end users, via an intuitive web interface based on a Google Earth Engine application. A specificity of this forecasting chain will consist in highlighting the risk level of the exposed territories for the end user.

## Funding
The project is funded by Space Climate Observatory (SCO), France - https://www.spaceclimateobservatory.org/band-sos-bengal-delta.

Funding duration: 2 years.

## Partners
- LEGOS, France
- LIENSs, France
- FFWC/BWDB, Bangladesh
- Arizona State University, USA
- Ohio State University, USA
- CNES, France

## Reference
Khan, Md. J. U., Durand, F., Bertin, X., Testut, L., Krien, Y., Islam, A. K. M. S., Pezerat, M., and Hossain, S.: Towards an efficient storm surge and inundation forecasting system over the Bengal delta: chasing the Supercyclone Amphan, Nat. Hazards Earth Syst. Sci., 21, 2523–2541, https://doi.org/10.5194/nhess-21-2523-2021, 2021.

## Local development setup

Install Node.js 24.15 or newer (which includes npm), clone this repository, and change into the project directory. Install the exact dependency versions recorded in `package-lock.json` with `npm ci`, then start the Vite development server:

```sh
npm ci
npm start
```

Open the local URL printed by Vite, usually `http://localhost:5173`. The server supports hot reload as you edit files.

### Local forecast and status data

Vite environment variables configure the forecast-data base URL and platform status JSON independently:

- `VITE_DATA_URL` defaults to `https://coastal.ffwc.gov.bd` during local development and to an empty base in production. The empty production base makes forecast requests same-origin (for example, `/2026102006/manifest.json`).
- `VITE_STATUS_URL` defaults to the public status file at `https://raw.githubusercontent.com/bandsos/status/refs/heads/main/status.json`.

To use live data while running locally, create `.env.development.local` in the project root:

```env
VITE_DATA_URL=https://coastal.ffwc.gov.bd
# Optional; this is the default status URL.
VITE_STATUS_URL=https://raw.githubusercontent.com/bandsos/status/refs/heads/main/status.json
```

To serve a local copy instead, place the status file at `public/status.json` and mirror the forecast data under `public/data/`, including each cycle's `manifest.json` and all files it references (tiles, station CSVs, and colorbar). Configure:

```env
VITE_DATA_URL=/data
VITE_STATUS_URL=/status.json
```

You can select a locally available forecast cycle directly with `http://localhost:5173/?cycle=YYYYMMDDCC`. The `.env.development.local` file is ignored by Git. Vite embeds these values when it builds the app, so a production override requires rebuilding and redeploying; these client-side values must not contain secrets.

Useful project checks:

```sh
npm test
npm run lint
npm run build
```
