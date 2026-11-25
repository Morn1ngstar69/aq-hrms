# AQUA HRMS: Next.js application and standalone HTML interface preview

## START HERE: See the interface without installing anything

This ZIP includes a **standalone HTML + CSS + JavaScript interface preview**. It reproduces the AQUA visual styling and includes clickable Admin / HR, Employee, and Accountant workspaces with the same initial sample data as the Next.js project.

**Fastest method in Visual Studio Code:**

1. Extract the ZIP and open the `AQUA-HRMS-Nextjs` folder in VS Code.
2. Open `OPEN-HRMS-PREVIEW.html` in your browser, or open `preview/index.html` directly.
3. For Live Server users, right-click `preview/index.html`, then select **Open with Live Server**.
4. Sign in using a demo account below or click one of the demo account tiles.
5. Explore the dark sidebar navigation, form dialogs, data cards and all three workspaces. The role switcher in the top-right allows fast visual comparison.

**Alternative without VS Code extensions:** open a terminal in the project folder and run:

```bash
npm run preview:html
```

Open `http://127.0.0.1:4173`. This command uses the built-in Node.js server only. It does not require `npm install` or internet access.

**Preview directory:**

```text
OPEN-HRMS-PREVIEW.html     One-click entry page
preview/index.html        Actual HTML interface
preview/styles.css        Full standalone CSS, includes AQUA theme
preview/preview.js        Frontend interactions in plain JavaScript
preview/demo-data.js      Bundled demo records copied from lib/seed.js
preview/serve.mjs         Optional zero-dependency local preview server
```

The HTML preview has no Next.js or npm dependency. It supports representative search, navigation, adding/editing/deleting employees, leave approvals, QR token entry, notices, attendance, policy records, salary statements, accounts and reporting. Some advanced workflows are simplified in the preview. The QR graphic is illustrative and **not scannable**. For the real QR component, camera workflow, and full application behavior, run the Next.js project below. All preview data is fictional and changes are only local to your browser session.

---


A standalone rebuild of the uploaded `Aqua_employee-info(3).zip` Retool application export. It uses Next.js 16, React 19, semantic HTML and ordinary CSS. The sample dataset is bundled in the repository. There is no database, Retool dependency, server API, cloud account, API key or remote image dependency.

## Requirements

- Node.js 20.9 or newer, preferably Node.js 22 LTS.
- npm 10 or newer.
- Internet access is needed once for `npm install` on a fresh machine. After dependencies are installed, the HRMS application itself does not use external APIs or need internet access.

## Install and run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

To create and serve a production build:

```bash
npm run build
npm run start
```

## Run tests

```bash
npm test
```

This runs the native Node.js test suite covering data consistency, CRUD, permissions on self-registration, attendance check-in and check-out, leave validation and approval, balance changes, correction and overtime, reports, and financial calculations.

UI tests using Vitest and React Testing Library are also included:

```bash
npm run test:ui
```

## Sign-in credentials

| Role | Username | Password | Route |
| --- | --- | --- | --- |
| Administrator | `admin` | `demo123` | `/admin` |
| HR | `hr` | `demo123` | `/admin` |
| Employee | `employee` | `demo123` | `/employee` |
| Accountant | `accountant` | `demo123` | `/accountant` |

All accounts are local demo identities. Credentials are intentionally hard-coded and are not appropriate for a real production deployment. Never store real employee, financial or health data in the demonstration.

## Features matched to the source

### Admin and HR

- Employees: directory, search, department and employment type filtering, profile view, creation, editing, deletion.
- Designations: department and designation assignment.
- Attendance: filter, employee summary, add manual record, status, late minutes, check-in and check-out.
- QR Attendance and HRMS QR Code: create weekly token, display current token, validate check-in and check-out.
- Leave Requests: review, approve, reject, notes.
- Notice Board: create, edit, archive, filter, categorize.
- HR Dashboard: KPIs, department breakdown, all leave requests, manual leave balance adjustments, payroll periods and locking.
- Approvals: leave, attendance corrections and overtime requests.
- Policy Admin: leave types, holidays, work schedules and local setup information.
- Reports and Audit: attendance, leave, overtime, unpaid leave, missing punches, late arrivals, audit records and CSV export.
- User Management: role assignment and activation, administrator only.

### Employee

- My Profile: personal details, editable contact information and attendance calendar.
- Scan Attendance: reads QR codes with supported browser cameras or allows manual token entry, then marks attendance in shared local data.
- History: attendance calendar and list.
- Leave Request: submit request, view pending or historical requests.
- HRMS Leaves: leave balances, new leave requests and history.
- HRMS Attendance: today, marking attendance, monthly calendar, correction and overtime requests.
- Notice Board: view and filter announcements.

### Accountant

- Salary Statements: month filter, create and edit statements, delete, gross/net calculation and export.
- Company Accounts: income and expense ledger, transaction creation, editing, deletion and export.
- Notice Board.
- Leave and Attendance Reports.

### Authentication

- Sign-in with role-based routing.
- Employee self-registration with username, password, email and image input.
- Local session-only authentication, role visibility, sign-out.

## Design and source limitations

The uploaded export contains a frontend and Retool server functions, but omits its referenced `frontend/lib/shadcn` UI files, generated backend hooks and Retool database. A direct re-run would fail due to those missing resources. This rebuild implements the visible workflows with independent local state instead.

The original scanner relied on camera/QR modules. This build generates a machine-readable QR code with a locally bundled QR library. It supports native browser BarcodeDetector camera scanning where available and has an always-visible manual token entry fallback. No external QR service is needed. Browser camera access requires permission and typically localhost or HTTPS.

The source HRMS migration action initializes real backend tables. Here the System Setup view reports that local demo state is already ready. No migration is performed.

The source contained additional personal, bank and identity-document fields which are not all reproduced in the simplified personal profile form. No storage or upload for sensitive documents is implemented. Financial calculations, employee counts, attendance, leave balances and HR approvals are connected to the same shared local state.

Demo state is stored in `sessionStorage`, so it persists across reloads of the same browser tab for the duration of the tab session. Reopening after the session ends restores the seed records. Admins can restore the initial data using the reset control.

The seed dates are anchored around 26 October 2026 to illustrate historical and pending records consistently.

## Project structure

```text
app/
  layout.jsx
  page.jsx
  error.jsx
  not-found.jsx
  globals.css
  login/page.jsx
  register/page.jsx
  admin/page.jsx
  employee/page.jsx
  accountant/page.jsx
components/
  AquaLogo.jsx
  ScannerCamera.jsx
  Auth.jsx
  EmployeePanels.jsx
  FinancePanels.jsx
  HRPanels.jsx
  UI.jsx
  WorkPanels.jsx
  Workspace.jsx
lib/
  logic.js
  seed.js
  store.jsx
tests/
  logic.test.mjs
  login.test.jsx
  setup.js
next.config.mjs
vitest.config.mjs
package.json
README.md
OPEN-HRMS-PREVIEW.html
preview/
  index.html
  styles.css
  demo-data.js
  preview.js
  serve.mjs
```

## State and error handling

The centralized state reducer in `lib/logic.js` validates each mutation and records it in the audit log. All panels read the same state through `lib/store.jsx`. Invalid submissions, overlapping leave, duplicate usernames and conflicting attendance entries produce on-screen errors. Lists have empty states. Edit and delete operations change the current session immediately.

## Notes for future real deployments

This is a fully local demonstration, not a secure multi-user HR system. Before using real employee data, build server-side authenticated authorization, use encrypted password storage, protect files and payroll information, add a durable database, validate on the server and implement tested audit retention.
