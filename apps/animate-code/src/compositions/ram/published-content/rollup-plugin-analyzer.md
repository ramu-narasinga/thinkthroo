!videoTitle Understanding rollup-plugin-analyzer Usage in tRPC Scripts

## !!steps
!duration 200

!title 1. Importing rollup-plugin-analyzer

```ts ! trpc/scripts/analyzeSizeChange.ts
// !callout[/analyze/] `analyze` is imported from the `rollup-plugin-analyzer` package to analyze bundle sizes.
import analyze from 'rollup-plugin-analyzer';

export default function analyzeSizeChange(
  packageDir: string
) {
  let analyzePluginIterations = 0;
  return analyze({
    summaryOnly: process.env.CI ? undefined : true,
    skipFormatted: process.env.CI ? true : undefined,
    onAnalysis: (analysis) => {
      // Analysis happens here
    },
  });
}
```

## !!steps
!duration 210

!title 2. Options for rollup-plugin-analyzer

```ts ! trpc/scripts/analyzeSizeChange.ts
// !callout[/analyze/] The options control the format and detail of the bundle analysis output.
return analyze({
  // Output summary only in CI
  summaryOnly: process.env.CI ? undefined : true, 
  // Skip formatted output in CI
  skipFormatted: process.env.CI ? true : undefined, 
  onAnalysis: (analysis) => {
    // Log the analysis results
  },
});
```

## !!steps
!duration 220

!title 3. onAnalysis Callback Breakdown

```ts ! trpc/scripts/analyzeSizeChange.ts
// !callout[/onAnalysis/] The `onAnalysis` callback receives an analysis object with bundle size and module details.
onAnalysis: (analysis) => {
  const { bundleSize, modules } = analysis;
  
  console.log(`Bundle size: ${bundleSize} bytes`);
  
  modules.forEach((module) => {
    console.log(`
      Module: ${module.id}, 
      Size: ${module.size} bytes`
    );
  });
},
```

## !!steps
!duration 210

!title 4. Where is analyzeSizeChange Used?

```ts ! trpc/scripts/getRollupConfig.ts
// !callout[/analyzeSizeChange/] The `analyzeSizeChange` function is used inside the Rollup config to track bundle size changes.
import analyzeSizeChange from './analyzeSizeChange';

export function getRollupConfig() {
  analyzeSizeChange('packages/client');
  // Other Rollup configuration here
}
```

## !!steps
!duration 200

!title 5. When is the Script Executed?

```json ! packages/client/package.json
// !callout[/scripts/] The `analyzeSizeChange` function is executed during the build process to log bundle size changes.
"scripts": {
  "build": 'rollup 
            --config rollup.config.ts 
            --configPlugin rollup-plugin-swc3
            '
}
```