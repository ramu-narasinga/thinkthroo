# Security and Billing Runbook

## Verify Single Charge vs Duplicate

1. Find the idempotency key in GitHub app logs for the deduction request.
2. Query `credit_transactions` by `organization_id` and `idempotency_key`.
3. Expected result: exactly one row for each unique key.
4. Confirm related `ai_usage_logs.credit_transaction_id` rows point to that single transaction.

## Investigate Retry Storms

1. Check Slack alerts for `credits_deduct_idempotent_hit` and `command_throttled`.
2. Correlate timestamps with PostHog logs for upstream retries or webhook redeliveries.
3. Confirm no duplicate charges by validating one `idempotency_key` -> one transaction.

## Handle Failed Internal Auth Spikes

1. Check Slack alerts for `internal_auth_failed_*` signals.
2. Verify `PLATFORM_API_SECRET` matches between platform and github-app environments.
3. Rotate the secret if unauthorized traffic appears malicious.

## Handle Slack OAuth Invalid State

1. Check whether callbacks are missing state or state is expired/tampered.
2. Validate `SLACK_CLIENT_SECRET` is consistent across deploys.
3. Ask user to reconnect Slack integration if state is expired.

## Temporary Mitigations

1. Pause expensive command handling by disabling command routes or temporary feature flag.
2. Raise command cooldown window if abuse is ongoing.
3. Communicate to affected users when mitigation is active.
