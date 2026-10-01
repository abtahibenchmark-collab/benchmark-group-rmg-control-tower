# Benchmark Group | RMG Control Tower

A starter production-ready architecture for the RMG flow:

**Order Master → Material PO → Store → Cutting → Sewing → Finishing → FG/Packing → Shipment → Reconciliation**

The management page is named **Management View**.

## Included

- Next.js 15.5.24 + TypeScript
- Responsive Vercel-ready UI
- Management View
- Orders
- Material Control
- Cutting / Sewing / Finishing / FG / Shipment views
- Action Required risk list
- End-to-end pipeline
- Google Apps Script API
- Google Sheets transaction structure
- Automatic reconciliation logic
- Demo data so the application runs immediately

The architecture follows the supplied specification: Google Sheets as the initial single source of truth, Vercel as the operating application, Apps Script as the integration layer, and Power BI as an optional advanced analytics layer.

## Run in Visual Studio Code

1. Extract the ZIP.
2. Open the extracted folder in VS Code.
3. Open Terminal.
4. Run:

```bash
npm install
npm run dev
```

5. Open:

`http://localhost:3000`

## Deploy to Vercel

Push the folder to GitHub, then import the repository into Vercel.

Optional environment variable:

`GOOGLE_SCRIPT_URL`

Set it to your deployed Google Apps Script Web App `/exec` URL.

## Google Sheets

1. Create a Google Sheet.
2. Extensions → Apps Script.
3. Copy `google-apps-script/Code.gs`.
4. Run `setupSystem()` once.
5. Deploy → New deployment → Web app.
6. Execute as: Me.
7. Who has access: Anyone as appropriate for your organization.
8. Copy the `/exec` URL.
9. Add it to Vercel as `GOOGLE_SCRIPT_URL`.

## Important

This ZIP is the **working foundation** of the system. The demo uses sample data in `lib/data.ts`. The Apps Script creates the connected transaction sheets and reconciliation model. Before live factory use, replace demo data with your actual master/input data and apply your preferred authentication and user permissions.

## Data model

Order quantity is entered once in ORDER MASTER. Departments enter their own transactions. Reconciliation calculates the downstream quantities instead of allowing departments to manually overwrite the master order quantity.
