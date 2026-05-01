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
│   ├── AuthPage.ts        # Sign up and Log in modals
│   ├── CartPage.ts        # Cart table, Place Order modal, receipt
│   ├── HomePage.ts        # Product catalog, navigation bar
│   └── ProductPage.ts     # Product detail, Add to cart
├── tests/
│   ├── scenarioA.spec.ts           # Web scraping — product catalog
│   ├── scenarioB.spec.ts           # E2E purchase flow
│   ├── fullUserJourney.spec.ts     # Complete user journey (signup → purchase)
│   └── checkoutNegative.spec.ts    # Negative test — credit card validation
├── utils/
│   ├── fileHelper.ts      # Writes products.txt to disk
│   └── types.ts           # Shared TypeScript interfaces
├── playwright.config.ts
└── tsconfig.json
```

**Synchronization strategy:** zero `waitForTimeout` calls. All waiting uses Playwright's built-in auto-waiting (`expect`, `toBeVisible`, `toHaveText`) and network-level synchronization via `waitForResponse` and `waitForEvent` to handle AJAX-heavy pages reliably.

---

## Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (bundled with Node.js)

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

The project supports **staging** and **production** environments. Environment variables are loaded automatically from the corresponding `.env` file based on the `ENV` variable passed at runtime.

**Step 1 — Create your environment files:**

```bash
# Copy the example templates
cp .env.staging.example .env.staging
cp .env.production.example .env.production
```

**Step 2 — Fill in your values:**

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

`playwright.config.ts` reads the appropriate file automatically:

```ts
const env = process.env.ENV || 'staging';
dotenv.config({ path: `.env.${env}` });
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

## Test Scenarios Covered

### Scenario A — Product Catalog Scraping (`scenarioA.spec.ts`)

Navigates the product catalog, paginates to page 2, and extracts the **name, price, and URL** of every visible product. Results are written to **`products.txt`** in the project root.

### Scenario B — E2E Purchase Flow (`scenarioB.spec.ts`)

Selects a product, adds it to the cart, and completes the full checkout with dynamic test data, validating the success receipt.

### Full User Journey (`fullUserJourney.spec.ts`)

The most comprehensive scenario, covering the complete lifecycle of a new user:

1. **Sign up** with dynamically generated credentials
2. **Log in** and assert the welcome message in the nav bar
3. Add **two products** to the cart
4. **Delete one item** and assert the total updates correctly
5. **Complete the purchase** and validate the receipt amount matches the expected price

### Negative Testing — Checkout Validation (`checkoutNegative.spec.ts`)

Submits the checkout form with an **invalid credit card number** (`1234`) and asserts that a validation error is displayed.

> **Known bug:** Demoblaze does not validate the credit card field and completes the purchase regardless of the input. This test is marked with `test.fail()` so it passes in CI while the bug persists, and will automatically turn red once the validation is implemented.
