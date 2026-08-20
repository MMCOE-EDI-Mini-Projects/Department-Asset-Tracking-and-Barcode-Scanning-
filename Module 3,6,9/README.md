# Department Asset Tracking System - Week 1 Prototype

**Technology Stack:** HTML, CSS, JavaScript, Node.js, Express, MySQL, Tesseract.js, Sharp

## Progress

The Week 1 prototype of the Department Asset Tracking System has been developed with the core asset management workflow implemented.

### Implemented Components

* Asset registration and storage using MySQL
* Asset identification through Asset Code search
* OCR-based asset identification using uploaded images
* Department and location data integration
* Disposal request workflow with pending status
* Sample asset and tag data for demonstration
* Backend API using Node.js and Express
* Frontend pages for asset registration and identification
* MySQL database schema and supporting tables
* OCR preprocessing using Sharp and Tesseract.js

### Database

The existing database structure has been retained, with the `disposal_requests` table added to support the Module 9 disposal workflow. Sample assets and tags have also been added for prototype demonstration.

### Current Prototype Structure

```text
backend/
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   ├── disposal_requests.sql
│   └── seed_assets.sql
├── src/
│   ├── index.js
│   ├── db/pool.js
│   ├── routes/assets.js
│   ├── routes/disposal.js
│   ├── routes/lookups.js
│   └── services/ocrService.js

frontend/
├── index.html
├── register.html
├── identify.html
├── css/style.css
└── js/
    ├── api.js
    ├── register.js
    └── identify.js
```

The current prototype establishes the foundation for asset registration, identification, OCR-based lookup, and disposal request handling.
