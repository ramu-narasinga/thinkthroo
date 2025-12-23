# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into your Next.js 15 project. The integration includes client-side event tracking using the `posthog-js` SDK, initialized via the `instrumentation-client.ts` file (the recommended approach for Next.js 15.3+). Environment variables have been configured for the PostHog API key and host. The integration tracks 11 key business events across user authentication, GitHub app installation, document management, and subscription management flows. Error tracking has been enabled with `capture_exceptions: true` and explicit `captureException()` calls in error handlers. User identification is implemented on signup to link anonymous sessions with identified users.

## Events Implemented

| Event Name | Description | File Path |
|------------|-------------|-----------|
| `user_signed_up` | User successfully completes signup with email/password | `components/signup-form.tsx` |
| `login_with_github_clicked` | User clicks the GitHub login button (conversion funnel top) | `components/login-form.tsx` |
| `github_app_installation_completed` | User successfully installs the GitHub app and repositories are synced | `app/(platform)/installation-success/page.tsx` |
| `github_app_installation_failed` | GitHub app installation fails with an error | `app/(platform)/installation-success/page.tsx` |
| `add_repositories_clicked` | User clicks button to add more repositories via GitHub app | `app/(platform)/repositories/(list)/components/AddReposButton.tsx` |
| `document_created` | User creates a new file or folder in the architecture documentation | `app/(platform)/repositories/[repository]/architecture/hooks/useDocumentMutations.ts` |
| `document_deleted` | User deletes a document from architecture documentation | `app/(platform)/repositories/[repository]/architecture/hooks/useDocumentMutations.ts` |
| `document_saved` | User saves changes to an architecture document | `app/(platform)/repositories/[repository]/architecture/components/EditorPanel/index.tsx` |
| `manage_subscription_clicked` | User clicks to manage their subscription (monetization funnel) | `app/(platform)/subscription/page.tsx` |
| `delete_account_clicked` | User clicks delete account button (churn indicator) | `app/(platform)/subscription/page.tsx` |
| `repository_tab_switched` | User switches between accessible and revoked repository tabs | `app/(platform)/repositories/(list)/features/RepositoriesListPage.tsx` |

## Files Created/Modified

### New Files
- `instrumentation-client.ts` - PostHog client-side initialization
- `.env` - Added PostHog environment variables (`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`)

### Modified Files
- `components/signup-form.tsx` - Added signup tracking and user identification
- `components/login-form.tsx` - Added GitHub login click tracking
- `app/(platform)/installation-success/page.tsx` - Added installation success/failure tracking with error capture
- `app/(platform)/repositories/(list)/components/AddReposButton.tsx` - Added add repositories click tracking
- `app/(platform)/repositories/[repository]/architecture/hooks/useDocumentMutations.ts` - Added document create/delete tracking
- `app/(platform)/repositories/[repository]/architecture/components/EditorPanel/index.tsx` - Added document save tracking
- `app/(platform)/subscription/page.tsx` - Added subscription and delete account click tracking
- `app/(platform)/repositories/(list)/features/RepositoriesListPage.tsx` - Added repository tab switch tracking

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- [Analytics basics](https://us.posthog.com/project/269139/dashboard/915842) - Main dashboard with all insights

### Insights
- [User Acquisition Funnel](https://us.posthog.com/project/269139/insights/ZsUwGuyR) - Track user signups and login attempts over time
- [GitHub App Installation Funnel](https://us.posthog.com/project/269139/insights/oM9CXBHO) - Track successful and failed GitHub app installations
- [Document Activity](https://us.posthog.com/project/269139/insights/vKuu5iCh) - Track document creation, saves, and deletions
- [Churn Risk Indicators](https://us.posthog.com/project/269139/insights/eb6cgpLt) - Track potential churn signals like delete account clicks
- [Monetization Funnel](https://us.posthog.com/project/269139/insights/rh03Auds) - Track subscription management interactions

## Configuration

PostHog is configured with the following settings:
- **API Host**: `https://us.i.posthog.com`
- **Defaults**: `2025-11-30` (latest recommended defaults)
- **Exception Capture**: Enabled
- **Debug Mode**: Enabled in development

To verify the integration is working, start your development server and check the browser console for PostHog debug messages.
