# Performance Measurement — Practical 8: Lazy Loading and Code Splitting

## Before (Single Bundle Baseline)

Measured from Vite production build (`npm run build`) before route-level code splitting:

```
dist/index.html                            0.46 kB │ gzip:   0.29 kB
dist/assets/index-CBtg2Fk5.css            39.50 kB │ gzip:   8.21 kB
dist/assets/sweetalert2.all-CoY_0i9y.js   78.14 kB │ gzip:  20.83 kB
dist/assets/index-CpOV_uh9.js            451.07 kB │ gzip: 143.91 kB
```

- Initial Entry JS: **451.07 kB** (gzip: **143.91 kB**)
- Total JS Chunks: **2**

---

## After (React.lazy + Dynamic import Route Splitting)

Measured from Vite production build (`npm run build`) after code splitting:

```
dist/index.html                             0.70 kB │ gzip:  0.36 kB
dist/assets/Projects-BUP-WeAW.css           4.03 kB │ gzip:  1.31 kB
dist/assets/index-DfSbEf_p.css             35.47 kB │ gzip:  7.41 kB
dist/assets/Experience-CnJVcLfo.js          0.16 kB │ gzip:  0.15 kB
dist/assets/About-ylwpE1gO.js               0.16 kB │ gzip:  0.15 kB
dist/assets/Skills-Bwie_Dfd.js              0.16 kB │ gzip:  0.15 kB
dist/assets/NotFound-ovTiEWgZ.js            0.32 kB │ gzip:  0.23 kB
dist/assets/rolldown-runtime-CNC7AqOf.js    0.87 kB │ gzip:  0.50 kB
dist/assets/preload-helper-Czpn1I53.js      1.19 kB │ gzip:  0.67 kB
dist/assets/Contact-rMKaTxiq.js             1.43 kB │ gzip:  0.57 kB
dist/assets/Register-DrF9oZ2o.js            3.07 kB │ gzip:  1.16 kB
dist/assets/Login-Da8MDY05.js               3.55 kB │ gzip:  1.42 kB
dist/assets/Projects-AJ2Fcty5.js            5.40 kB │ gzip:  2.10 kB
dist/assets/react-9ZasmZpi.js               7.53 kB │ gzip:  2.88 kB
dist/assets/sweetalert2.all-DS0Kjt_M.js    78.15 kB │ gzip: 20.84 kB
dist/assets/Tasks-C75h05Dk.js             141.04 kB │ gzip: 44.99 kB
dist/assets/index-B_32-1Gn.js             288.59 kB │ gzip: 94.66 kB
```

- Initial Entry JS: **288.59 kB** (gzip: **94.66 kB**)
- Total JS Chunks: **14**

---

## Comparison Table

| Metric | Before | After | Delta | % Change |
|---|---|---|---|---|
| **Entry JS (Raw)** | 451.07 kB | 288.59 kB | -162.48 kB | -36.0% |
| **Entry JS (Gzip)** | 143.91 kB | 94.66 kB | -49.25 kB | -34.2% |
| **Total Emitted JS Chunks** | 2 | 14 | +12 chunks | Modular |
| **Tasks Route Chunk** | Bundled in main | 141.04 kB (gzip: 44.99 kB) | Split on demand | - |
| **Projects Route Chunk** | Bundled in main | 5.40 kB (gzip: 2.10 kB) | Split on demand | - |
| **Deferred Modal Lib (`sweetalert2`)** | 78.14 kB | 78.15 kB (gzip: 20.84 kB) | Loaded on action | - |
