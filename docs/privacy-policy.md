# Sieu-Sv_Library Privacy Policy

**Policy version:** 2026-11-10-v2  
**Last updated:** November 10, 2026

## 1. Service and operator

Sieu-Sv_Library is a read-only catalog for curated Luau scripts in the public SieuSV-Storage GitHub repository. Google sign-in is available for account access. New website accounts are created only after Google verifies the identity, the user reviews the profile details and submits the Create account form. Community uploads, profile edits, votes and reports are disabled.

The repository maintainer operates this service. A dedicated private privacy-contact email has not yet been configured. Do not include personal or sensitive information in public GitHub issues or discussions. Account deletion can be requested from the signed-in profile.

## 2. Information processed

- **Google sign-in:** stable Google account identifier (subject), verified-email status, display name and profile-photo URL received during OAuth. The application does not intentionally store the Google email address or OAuth access token.
- **Account profile:** username, display name, avatar URL, optional bio, public profile identifier and account creation or name-change timestamps.
- **Consent record:** accepted Terms version, Privacy Policy version and acceptance timestamp.
- **Security/session data:** signed session and short-lived OAuth cookies, session-version counter and technical request metadata processed by Cloudflare to deliver and protect the service.
- **Legacy community records:** the D1 database may still contain data from earlier community features, including scripts, versions, votes, reports and rate-limit counters. Those community features are paused and are not exposed by the read-only website.

## 3. Purposes and providers

Information is used to verify Google sign-in, create and display the website account, record policy acknowledgement, maintain session security, respond to account actions and operate the library. The service uses Cloudflare Workers and D1 for hosting and database storage, Google OAuth for sign-in, and GitHub for repository content. Each provider processes information under its own terms and privacy documentation. Data may be processed outside Viet Nam; the service has not independently verified every provider's data location or cross-border mechanism.

## 4. Cookies

The site uses a Secure, HttpOnly, SameSite=Lax session cookie with a seven-day lifetime. OAuth state, consent, pending-registration and account-deletion verification cookies are signed and short-lived (up to ten minutes, or five minutes for the final deletion confirmation). These cookies are needed for authentication, request integrity and account security.

## 5. Account deletion

A signed-in user can choose **Delete Account** in their Profile. The service starts a Google OAuth account-selection step and verifies that the returned Google subject matches the account currently signed in. The user must then type **DELETE** and submit the final confirmation. Merely opening the Google page or returning from it does not delete anything.

After the final confirmation succeeds, the service immediately removes the account from the active D1 database and deletes the associated account-consent record, profile data, session authority, username history, account rate-limit records, account-submitted reports, account votes and likes, and any community scripts and version records owned by that account. Editor attribution on another user's version record is detached. Existing sessions stop working because the user record no longer exists. The Google Account itself is not deleted and its access to Google is not revoked by this action. A later sign-in may create a new Sieu-Sv_Library account.

The deletion does not remove public GitHub commits, repository files, forks, third-party copies, or information held independently by Google, GitHub or Cloudflare. Any record that must be retained under a specific legal obligation may be retained only to the extent and for the period required, with access restricted; the service does not retain all account data merely for convenience.

## 6. Database recovery history

The active D1 records are deleted by the account-deletion process. Cloudflare D1 Time Travel is a provider-managed point-in-time recovery feature, so older database states may remain restorable for a limited period after deletion. Cloudflare currently documents up to seven days on the Free plan and up to 30 days on paid plans. These recovery states are not the active application database; if a recovery operation restores an earlier state, the service must re-apply valid deletion requests. The actual retention depends on the Cloudflare plan and database configuration.

## 7. Public repository content

The GitHub repository is public. Files, commits, pull requests, forks and copies stored by GitHub or other people are separate from the website account database and are not removed by deleting a Sieu-Sv_Library account. Check the repository license and any third-party license before reuse.

## 8. Your choices and requests

You can sign out at any time. You can request account deletion from Profile after Google verification. Other privacy requests should not be sent through public issue trackers with personal data. The service does not currently offer a self-service account export. Requests may be subject to applicable legal exceptions, identity verification and a narrowly scoped retention obligation.

## 9. Children and guardian involvement

Where applicable law requires parent or guardian involvement for processing a child's personal data or exercising the child's rights, the user should obtain that involvement. A checkbox in the sign-in process is a declaration by the user; it does not independently verify a guardian's identity or permission.

## 10. Changes

This policy may be updated as the service changes. Material changes will be reflected here with a revised version date. This notice describes the current implementation and is not a legal opinion or a promise that all provider-side processing is controlled by the site operator.
