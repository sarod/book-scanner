# Book Scanner

A React-based web application for scanning books and match them against a library book list to facilitate collection before return.
Upload a list of books from CSV, scan ISBN codes using your camera, and automatically match scanned books to your imported list.

Deployed at https://sarod.github.io/book-scanner/

ℹ️ Note: Scanner works a lot better on android where it relies on Web standard https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API

## Usage

1. Upload your library book list using the file upload button (supports CSV files)
2. Click "Start scanning" to begin scanning ISBN codes with your camera
3. Scanned books will automatically fetch metadata and match against your list
4. View results showing matched books (https://lucide.dev/icons/book-check), books to match (https://lucide.dev/icons/book-dashed), and extraneous scans (https://lucide.dev/icons/triangle-alert)

## Dev

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start development server:

   ```bash
   pnpm dev
   ```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests with Vitest
- `pnpm preview` - Preview production build
