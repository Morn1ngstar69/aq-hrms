# AQUA HRMS
### Human Resource Management System

AQUA HRMS is a web-based Human Resource Management System designed to manage employee information, attendance, leave applications, HR operations, company notices, and financial records through a centralized interface.

The project was originally based on a Retool application export and has been rebuilt as an independent Next.js application. It includes separate workspaces for Administrators, HR personnel, Employees, and Accountants.

The repository also includes a standalone HTML preview for exploring the interface without installing the Next.js dependencies.

---

## 1. Interface Preview

You can explore the application directly in your browser without installing anything.

### Option 1: Open the HTML preview

1. Extract the project ZIP file.
2. Open the `AQUA-HRMS-Nextjs` folder.
3. Open `OPEN-HRMS-PREVIEW.html` in your browser.

Alternatively, open `preview/index.html` directly.

If you use Visual Studio Code with Live Server:

1. Open the project folder in VS Code.
2. Navigate to `preview/index.html`.
3. Right-click and select **Open with Live Server**.

### Option 2: Run the local preview server

If Node.js is installed, open a terminal in the project directory and execute:

```bash
npm run preview:html
```

Then visit:

`http://127.0.0.1:4173`

This preview server uses Node.js built-in modules and does not require `npm install`.

### Preview files

```text
OPEN-HRMS-PREVIEW.html
preview/
  index.html
  styles.css
  preview.js
  demo-data.js
  serve.mjs
```

The preview includes the main navigation, dashboard layouts, data tables, dialogs, and representative interactions across all three workspaces.

It supports employee management, leave approvals, attendance records, notices, policy records, salary statements, company accounts, and basic reporting.

The preview uses fictional sample data. Changes are stored locally in the browser and are not connected to the Next.js application's state.

Some advanced operations are simplified. The QR graphic in the preview is illustrative and cannot be scanned.

---

## 2. Technology Stack

| Component | Technology |
|---|---|
| Framework | Next.js 16 |
| Frontend | React 19 |
| Language | JavaScript / JSX |
| Styling | CSS |
| Testing | Node.js Test Runner, Vitest |
| UI Testing | React Testing Library |
| Data Management | Centralized local state |
| QR Functionality | Local QR library and browser camera APIs |

The application runs independently of Retool. Its sample records are bundled with the project, and it does not require an external database, API credentials, or cloud services.

---

## 3. Requirements

Make sure the following are installed:

- Node.js 20.9 or newer (Node.js 22 LTS recommended).
- npm 10 or newer.

An internet connection is required during the initial dependency installation. Once the dependencies are installed, the application can run locally without external API access.

---

## 4. Installation and Setup

Clone or extract the repository and navigate to the project directory.

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the application:

`http://127.0.0.1:3000`

### Production build

To create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

---

## 5. Demo Accounts

The application includes four local demo accounts for testing the different user roles.

| Role | Username | Password | Dashboard |
|---|---|---|---|
| Administrator | `admin` | `demo123` | `/admin` |
| HR | `hr` | `demo123` | `/admin` |
| Employee | `employee` | `demo123` | `/employee` |
| Accountant | `accountant` | `demo123` | `/accountant` |

All accounts use the same demo password.

These credentials are hard-coded for demonstration purposes. They should not be used in a production environment.

---

## 6. Application Modules

### Administrator and HR Workspace

**Employee Management**
- View and search employee records.
- Filter employees by department and employment type.
- View individual employee profiles.
- Add, edit, and remove employee records.
- Manage department and designation assignments.

**Attendance Management**
- View employee attendance records.
- Filter attendance by employee and date.
- Add manual attendance entries.
- Track check-in, check-out, attendance status, and late minutes.
- Review attendance summaries.

**QR Attendance**
- Generate weekly attendance tokens.
- Display the active attendance token.
- Validate employee check-in and check-out.
- Support browser-based QR scanning and manual token entry.

**Leave Management**
- Review submitted leave applications.
- Approve or reject requests.
- Add comments to leave decisions.
- Monitor leave balances.
- Make manual leave balance adjustments.

**Notice Board**
- Publish company announcements.
- Edit and archive notices.
- Organize announcements by category.
- Filter notices.

**HR Dashboard**
- View employee and attendance statistics.
- Monitor department-wise employee distribution.
- Review leave requests.
- Manage payroll periods and payroll locking.

**Approvals**
- Review leave applications.
- Handle attendance correction requests.
- Review overtime requests.

**Policy Administration**
- Manage leave types.
- Configure holidays.
- Maintain work schedules.
- Access local system setup information.

**Reports and Audit**
- Attendance reports.
- Leave and unpaid leave reports.
- Overtime reports.
- Missing punch records.
- Late arrival reports.
- Audit history and CSV exports.

**User Management**
- Assign user roles.
- Activate or deactivate accounts.
- Manage application access.

User management is restricted to administrators.

### Employee Workspace

Employees have access to their personal information and attendance-related activities.

Available features include:

- View and update personal contact information.
- View attendance history and monthly calendars.
- Mark attendance using QR scanning or manual token entry.
- Submit leave applications.
- View leave balances and application history.
- Submit attendance correction requests.
- Submit overtime requests.
- View company announcements.

### Accountant Workspace

The Accountant workspace handles basic payroll-related records and company financial transactions.

**Salary Statements**
- Filter salary statements by month.
- Create and edit salary records.
- Calculate gross and net salary.
- Delete records.
- Export salary information.

**Company Accounts**
- Maintain income and expense records.
- Add, edit, and delete transactions.
- Review financial entries.
- Export account records.

Accountants can also access the notice board and relevant attendance and leave reports.

---

## 7. Authentication and Access Control

The application includes a local authentication system with role-based routing.

Supported roles:

- Administrator
- HR
- Employee
- Accountant

Employees can also register through the self-registration page using a username, password, email address, and image input.

User sessions are maintained locally in the browser. Access to individual workspaces is determined by the assigned role.

---

## 8. Attendance and QR Scanning

The attendance module supports both QR-based and manual token entry.

The application generates machine-readable QR codes using a locally bundled library. On supported browsers, employees can use their device camera to scan attendance tokens through the `BarcodeDetector` API.

If camera scanning is unavailable, employees can enter the attendance token manually.

Camera access generally requires localhost or an HTTPS connection, along with browser permission.

---

## 9. Data Management

Application data is maintained through a centralized state management system.

The main state and business logic are located in:

```text
lib/
  logic.js
  seed.js
  store.jsx
```

- `logic.js` contains the application operations, validation rules, and state update logic.
- `seed.js` contains the initial sample records.
- `store.jsx` manages shared application state across the different workspaces.

The application records state changes in an audit log and validates operations before applying them.

Validation covers areas such as:

- Duplicate usernames.
- Conflicting attendance entries.
- Overlapping leave applications.
- Invalid leave requests.
- Attendance corrections and overtime requests.
- Leave balance adjustments.

Demo data is stored in `sessionStorage`. It remains available after reloading the same browser tab during the current session. When the session ends, the application returns to the initial sample records.

Administrators can restore the original sample data using the reset option.

The initial dataset uses dates around 26 October 2026.

---

## 10. Testing

The project includes automated tests for application logic and interface behavior.

Run the main test suite:

```bash
npm test
```

The Node.js test suite covers:

- Data consistency.
- Employee record operations.
- User permissions and registration.
- Attendance check-in and check-out.
- Leave validation and approval.
- Leave balance calculations.
- Attendance corrections.
- Overtime requests.
- Reports.
- Financial calculations.

Run the UI tests separately:

```bash
npm run test:ui
```

These tests use Vitest and React Testing Library.

---

## 11. Project Structure

```text
AQUA-HRMS-Nextjs/
│
├── app/
│   ├── layout.jsx
│   ├── page.jsx
│   ├── error.jsx
│   ├── not-found.jsx
│   ├── globals.css
│   ├── login/
│   ├── register/
│   ├── admin/
│   ├── employee/
│   └── accountant/
│
├── components/
│   ├── AquaLogo.jsx
│   ├── ScannerCamera.jsx
│   ├── Auth.jsx
│   ├── EmployeePanels.jsx
│   ├── FinancePanels.jsx
│   ├── HRPanels.jsx
│   ├── UI.jsx
│   ├── WorkPanels.jsx
│   └── Workspace.jsx
│
├── lib/
│   ├── logic.js
│   ├── seed.js
│   └── store.jsx
│
├── tests/
│   ├── logic.test.mjs
│   ├── login.test.jsx
│   └── setup.js
│
├── preview/
│   ├── index.html
│   ├── styles.css
│   ├── preview.js
│   ├── demo-data.js
│   └── serve.mjs
│
├── next.config.mjs
├── vitest.config.mjs
├── package.json
├── README.md
└── OPEN-HRMS-PREVIEW.html
```

---

## 12. Implementation Notes and Limitations

The original Retool export included frontend components and server functions that depended on additional Retool resources, including UI component files, generated backend hooks, and database connections. Those dependencies were not included in the export.

The current implementation replaces those dependencies with independent React components, local state management, and bundled sample data.

A few differences from the original implementation are worth noting:

- The application does not currently use a persistent database.
- User authentication is local and is not suitable for real-world account security.
- Employee, attendance, leave, and financial records are stored in browser session storage.
- Some personal, banking, and identity-document fields from the original application are not included.
- Sensitive document uploads and storage have not been implemented.
- The original backend migration process is not included. The local application starts with its bundled sample data.
- Some advanced workflows have been simplified.

The application is intended for local demonstration, interface evaluation, and further development.

---

## 13. Before Production Deployment

The current implementation is a local demonstration and should not be used to manage actual employee or financial information.

Before deploying it for organizational use, the following changes are required:

1. Implement server-side authentication and authorization.
2. Replace hard-coded credentials with secure password hashing and account management.
3. Introduce a persistent database.
4. Move sensitive operations and validation to the server.
5. Implement secure employee document storage.
6. Protect payroll, personal, and financial information.
7. Introduce appropriate audit logging and retention policies.
8. Add proper session management and access controls.
9. Test the application in a multi-user environment.

---

## License

This project is maintained as an internal AQUA HRMS application. Usage and distribution should follow the organization's requirements.
