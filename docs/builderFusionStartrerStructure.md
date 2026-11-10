frontend-web/
│
├── client/ ← REAL frontend
│
├── server/ ← REAL Express server, but minimal
│ ├── index.ts
│ ├── node-build.ts
│ └── routes/
│ └── demo.ts
│
├── shared/
│ └── api.ts ← shared demo type
│
└── netlify/functions/
└── api.ts ← serverless wrapper around Express
