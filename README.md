# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Data Persistence

All configuration parameters (project name, ownership duration, cars, and expenses)
are automatically saved to the browser's `localStorage` and restored after a page
reload. Use the **Clear Data** button in the navigation bar to remove the stored data
and reset the app to its defaults.

## Import / Export

Use the **Export** button in the navigation bar to merge all configuration
properties (project name, ownership duration, cars, and expenses) into a single
JSON file and download it to your computer. The downloaded file is named
`carfin-{project-name}.json` (e.g. `carfin-my-project.json`); when no project
name is set it falls back to `carfin-config.json`.

Use the **Import** button to select a previously exported JSON file. When a valid
file is selected, any existing data is automatically cleared and the imported
parameters are loaded and stored in the browser. Any unsaved maintenance draft is
discarded when a configuration is imported or **Clear Data** is used. If the
selected file is invalid, an error message is displayed and the current configuration
and any open draft remain unchanged.

## Maintenance expenses

In **Expenses**, select a car and use **Maintenance** to choose a **Calculation
method**. New cars start with **Annual estimate**, set to 0. Existing saved annual
estimates continue to work. Switching methods keeps both the estimate and saved
records; only the selected method contributes to results.

With **Recorded costs**, use **Add record**, enter a cost of 0 or more and a valid
maintenance date, and optionally describe the work in Notes. Use **Save** to commit
or **Cancel** to discard a draft. **Edit** changes any record field, and **Delete**
immediately removes a saved record. Records are listed chronologically; records
with the same date remain separate. Switching cars discards unsaved drafts.

**First maintenance month** defaults to 12 and accepts whole nonnegative months,
including 0. It counts months after ownership starts; 0 means immediately. Records
follow their calendar-month gaps from the earliest maintenance date. Day differences
within a month are ignored, including at month ends and on leap days. For example,
dates 2021-01-01, 2022-01-01, and 2022-07-01 with first month 12 schedule at
ownership months 12, 24, and 30. Adding, editing, or deleting the earliest record
re-anchors the whole schedule. The **How scheduling works** disclosure in Expenses
also explains these rules.

Each recorded cost is charged once, without projecting future maintenance. The
chart steps up at each scheduled month; the comparison table sums charges inside
the ownership period. Both include the endpoint at the ownership duration in years
multiplied by 12 and rounded to the nearest month. The **Maintenance cost schedule**
shows recorded dates, ownership months, costs, and whether each record contributes
to totals. Records beyond ownership remain saved and editable. Annual estimates
retain their existing behavior: table totals multiply the estimate by ownership
years, while the chart charges it at month 0 and every 12 months, including the
endpoint anniversary.

**Annualized history average** is informational: it uses all saved maintenance
records over a period of at least 12 months. The averaging span and first/last
recorded dates are shown when available. Empty history shows 0; one record or
records within a year use a one-year denominator. The example above totals 1,200
over 18 months, averaging 800 per year. This includes records outside ownership
and does not change with the first month or ownership duration. Result totals use
scheduled costs.

Mode, offset, entries, IDs, dates, prices, and notes persist through reload and
JSON export/import. Invalid maintenance imports show a field-specific error and
leave the current configuration intact. **Clear Data** resets maintenance along
with the rest of the configuration.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
