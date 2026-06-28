# AzureVerse

AzureVerse is a lightweight jewelry gallery frontend for Azure Jewelry.  
It turns the classified local image library into a client-facing web experience with:

- category filters
- stone-color filters
- image ID search
- mobile-friendly gallery browsing
- Vercel-ready static deployment

## Stack

- Vite
- React 19
- static local JSON data
- static image assets

## Local Development

```bash
npm install
npm run import:gallery
npm run dev
```

## Build

```bash
npm run build
```

## Data Source

This frontend imports its gallery content from:

`/Users/trunix/Azurejewelry/各种素材图收集_已编号分类/00_清单/image_classification_results.csv`

The import script copies classified images into `public/gallery-images` and generates:

`src/data/gallery.json`

## Deployment

### Vercel

1. Push this folder to GitHub
2. Import the GitHub repo into Vercel
3. Framework preset: `Vite`
4. Build command: `npm run build`
5. Output directory: `dist`

### Tencent Cloud Server

1. Build the project with `npm run build`
2. Upload the `dist` folder to Nginx static hosting
3. Bind your domain and HTTPS

## Notes

- Current gallery includes the 138 classified images prepared in the workspace
- For future batches, rerun `npm run import:gallery` after updating the CSV and image folders
