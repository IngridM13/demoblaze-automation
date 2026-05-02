# Demoblaze UI Automation Framework

End-to-end test automation framework for [Demoblaze](https://www.demoblaze.com), built as part of a technical challenge. It covers full user journeys, web scraping, cart management, and negative testing scenarios across multiple environments.

---

## Architecture & Patterns

| Layer | Technology |
|---|---|
| Test runner | [Playwright](https://playwright.dev/) |
| Language | TypeScript |
| Design pattern | Page Object Model (POM) |
| Multi-environment | `dotenv` with per-environment `.env` files |

**Page Object Model** encapsulates every page's selectors and interactions behind a typed class, keeping tests free of implementation details. Adding a new page or changing a selector only requires updating one file.

```
ui-automation/
├── pages/
│   ├── AuthPage.ts              # Sign up and Log in modals
│   ├── CartPage.ts              # Cart table, Place Order modal, receipt
│   ├── HomePage.ts              # Product catalog, navigation bar
│   └── ProductDetailsPage.ts   # Product detail, Add to cart
├── tests/
│   ├── fixtures.ts                     # Custom authenticatedPage fixture
│   ├── scenarioA.spec.ts               # Web scraping — product catalog
│   ├── scenarioB.spec.ts               # E2E purchase flow
│   ├── fullUserJourney.spec.ts         # Complete user journey (signup → purchase)
│   └── checkoutNegative.spec.ts        # Negative test — credit card validation
├── utils/
│   ├── authHelper.ts      # signUp() and logIn() helpers
│   ├── fileHelper.ts      # Writes products.txt to disk
│   ├── testData.ts        # Centralized purchase data sets
│   └── types.ts           # Shared TypeScript interfaces
├── .github/
│   └── workflows/
│       └── playwright.yml   # CI/CD pipeline
├── playwright.config.ts
└── tsconfig.json
```

**Synchronization strategy:** zero `waitForTimeout` calls. All waiting uses Playwright's built-in auto-waiting (`expect`, `toBeVisible`, `toHaveText`) and network-level synchronization via `waitForResponse` and `waitForEvent` to handle AJAX-heavy pages reliably.

---

## Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (bundled with Node.js)
- **Java** v11 or higher — required by `allure-commandline` to generate and serve Allure reports — [java.com](https://www.java.com)

---

## Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd ui-automation

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install chromium
```

---

## Environment Configuration

The project supports **staging** and **production** environments. Each has its own `.env` file holding the `BASE_URL` and any other environment-specific values.

### Setup

**Step 1 — Create your environment files from the provided templates:**

```bash
cp .env.staging.example .env.staging
cp .env.production.example .env.production
```

**Step 2 — Fill in the values for each file:**

`.env.staging`
```env
BASE_URL=https://www.demoblaze.com
ENV=staging
```

`.env.production`
```env
BASE_URL=https://www.demoblaze.com
ENV=production
```

> **Note:** `.env.staging` and `.env.production` are listed in `.gitignore` and will never be committed. Only the `.example` template files are tracked by git.

### How environment switching works

The target environment is selected by passing the `ENV` variable at runtime. Playwright reads it at startup — before any test runs — and loads the matching `.env` file:

```
ENV=staging npx playwright test
       ↓
playwright.config.ts reads ENV → loads .env.staging
       ↓
BASE_URL is set to the staging URL
       ↓
every page.goto('/') in every test resolves against that base URL
```

The relevant lines in `playwright.config.ts`:

```ts
const env = process.env.ENV || 'staging'; // defaults to staging if ENV is not set
dotenv.config({ path: `.env.${env}` });
```

To switch environments, simply change the `ENV` value when running the tests — no code changes required:

```bash
ENV=staging npx playwright test      # runs against staging
ENV=production npx playwright test   # runs against production
```

The `npm` scripts in `package.json` handle this for you:

```bash
npm run test:staging     # sets ENV=staging automatically
npm run test:production  # sets ENV=production automatically
```

---

## Running the Tests

### Full suite

```bash
# Headless (CI-ready)
npm run test:staging
npm run test:production

# Headed (visible browser — useful for local debugging)
npm run test:staging:headed
npm run test:production:headed
```

### Single test file

```bash
ENV=staging npx playwright test tests/scenarioA.spec.ts
ENV=staging npx playwright test tests/fullUserJourney.spec.ts
```

### HTML report

After any run, open the interactive HTML report:

```bash
npm run test:report
```

---

## Allure Report

The framework integrates [Allure](https://allurereport.org/) for rich, interactive test reports with step-level detail, screenshots on failure, and trace attachments.

### Dependencies

`allure-playwright` (the Playwright adapter) and `allure-commandline` (the CLI that generates and opens the report) are included in `devDependencies`, so `npm install` during setup covers this automatically.

### How it works

`playwright.config.ts` registers the Allure reporter alongside the built-in ones:

```ts
reporter: [
  ['list'],
  ['html', { open: 'never' }],
  ['allure-playwright'],
],
```

Every test run writes raw result data to the `allure-results/` directory. The `allure generate` command then processes that data into a self-contained HTML report in `allure-report/`.

Both directories are listed in `.gitignore` and are never committed.

### Generating the report

The recommended way is to use the combined scripts, which clean previous results, run the tests, and generate the report in one step:

```bash
npm run test:allure:staging     # run against staging + generate report
npm run test:allure:production  # run against production + generate report
```

### Viewing the report

```bash
npm run allure:open
```

This launches a local server and opens the report in your browser. The report includes:

- Pass / fail status per test
- Step-by-step execution timeline
- Screenshots captured on failure
- Playwright traces retained on failure

### Running the steps individually

If you need finer control — for example, to regenerate the report from an existing `allure-results/` without re-running the tests:

```bash
npm run allure:clean      # delete allure-results/ and allure-report/
npm run allure:generate   # process allure-results/ → allure-report/
npm run allure:open       # serve and open allure-report/
```

---

## CI/CD

The pipeline is defined in `.github/workflows/playwright.yml` and runs automatically on every push or pull request to `main`.

### What it does

| Step | Details |
|---|---|
| Install dependencies | `npm ci` — deterministic install from `package-lock.json` |
| Install browsers | Chromium only, with system dependencies (`--with-deps`) |
| Set up environment | Copies `.env.staging.example` → `.env.staging` |
| Run tests | Full suite against staging; job fails if any test fails |
| Generate Allure report | Always runs — even when tests fail |
| Upload artifact | `allure-report/` is uploaded and kept for 30 days |

### Downloading the Allure report

After a workflow run completes, open the run summary on GitHub and scroll to the **Artifacts** section at the bottom. Download `allure-report`, unzip it, and open `index.html` in your browser.

### Parallel execution

In CI the suite runs with `fullyParallel: true` and `workers: 2`, matching the 2-core GitHub Actions runner. Locally, Playwright uses its own default (half the available CPUs).

---

## Test Scenarios Covered

### Scenario A — Product Catalog Scraping (`scenarioA.spec.ts`)

Navigates the product catalog, paginates to page 2, and extracts the **name, price, and URL** of every visible product. Results are written to **`products.txt`** in the project root.

### Scenario B — E2E Purchase Flow (`scenarioB.spec.ts`)

Selects a product, adds it to the cart, and completes the full checkout with dynamic test data, validating the success receipt.

This scenario uses a custom **Playwright fixture** (`authenticatedPage`) to showcase how fixtures provide dependency injection for test infrastructure. The fixture handles user creation and login before the test body runs, so the test receives an already-authenticated page and focuses exclusively on the purchase flow. This pattern avoids repeating auth setup across tests and keeps each test focused on a single responsibility.

```
fixture setup (transparent to the test)
  → create user → sign up → log in
       ↓
test body receives authenticated page
  → select product → add to cart → checkout
```

### Full User Journey (`fullUserJourney.spec.ts`)

The most comprehensive scenario, covering the complete lifecycle of a new user:

1. **Sign up** with dynamically generated credentials
2. **Log in** and assert the welcome message in the nav bar
3. Add **two products** to the cart
4. **Delete one item** and assert the total updates correctly
5. **Complete the purchase** and validate the receipt amount matches the expected price

This scenario intentionally does **not** use the `authenticatedPage` fixture. The signup and login steps are part of the scenario under test — verifying that a user can register and immediately authenticate with the credentials they just created. Abstracting auth into a fixture here would hide behavior that this test is explicitly meant to validate.

### Negative Testing — Checkout Validation (`checkoutNegative.spec.ts`)

Submits the checkout form with an **invalid credit card number** (`1234`) and asserts that a validation error is displayed.

> **Known bug:** Demoblaze does not validate the credit card field and completes the purchase regardless of the input. This test is marked with `test.fail()` so it passes in CI while the bug persists, and will automatically turn red once the validation is implemented.
