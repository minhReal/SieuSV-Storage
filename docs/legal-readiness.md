# Legal readiness review — SieuSV Library

> **Preliminary issue-spotting only; not legal advice, not a compliance certification, and not a determination by a Vietnamese authority.** The operator should review this with a parent/guardian and a qualified lawyer in Viet Nam before restoring any community feature. Do not publish a home address, private phone number, identity document or other personal details in this repository.

Review date: **7 November 2026**

## Current technical status

The production Worker is in **read-only GitHub catalog mode**. Google sign-in, community profiles, uploads, edits, votes and report submissions are paused at the API layer. The interface also explains the read-only status. GitHub-hosted curated source files remain available.

Existing community records in Cloudflare D1 have **not** been deleted. The pause prevents normal public API access to them; it does not erase past processing, satisfy a retention obligation or automatically resolve any earlier compliance issue.

## What the previous website actually did

Before the pause, the site allowed Google OAuth sign-in, public user profiles, community uploads of Luau source/metadata/images, votes, reports, and version snapshots. It stored data such as a Google account subject identifier, usernames, display names, avatar URLs, bios, profile IDs, timestamps, script content and metadata, version history, votes, report text and rate-limit counters.

The OAuth callback read Google's verified email field when generating a default username. The application schema did not contain a column that stores the full email address. The stable Google subject identifier was stored for account recognition.

Configured providers found in the project: Cloudflare Workers, D1 and Turnstile; Google OAuth; GitHub-hosted source files. The D1 API's serving-region metadata is not proof of the database's physical data residency. Actual processing and storage locations, subprocessors and contractual terms still need to be confirmed with each provider.

## Viet Nam: possible social-network classification under Decree 147/2024/ND-CP

Article 3(25) defines a social network in broad terms as an information system built on a website or application that provides services or tools for users to provide, exchange, interact and share information with one another. The previous combination of accounts, profiles, public user uploads and votes has features that could bring the service within that definition.

This is **not a final classification**. A curated, read-only source-code catalog is different from a platform that lets users publish and interact. The legal analysis should consider the actual features during the period when community features were enabled, audience, access, traffic, ownership/operator and how the site was presented.

If the authority classifies the former service as a domestic social network, Decree 147 may require an eligible Vietnamese-established organization/business operator and the applicable license or notification confirmation, depending on the classification and traffic threshold. It also contains domain, technical, personnel, account-verification, content-handling and data-retention requirements. Do not assume that a small project or a free service is automatically exempt.

The site used a workers.dev hostname and the repository does not evidence a Vietnamese legal entity, license or notification confirmation, local infrastructure, designated moderation personnel or all required operational records. This is why community features have been paused pending advice.

Read: [Decree 147/2024/ND-CP — Government legal document portal](https://vanban.chinhphu.vn/?docid=211654&pageid=27160).

## Viet Nam: personal data and cross-border processing

Law 91/2025/QH15 on Personal Data Protection and Decree 356/2025/ND-CP took effect on 1 January 2026. Relevant topics include:

- Consent and transparency: explain the data categories, purposes, controller/processor roles, rights and other required information; obtain valid consent where required and do not treat silence as consent.
- Processing impact assessment: determine whether an impact-assessment dossier must be prepared and submitted, the applicable deadline and whether an exemption applies.
- Cross-border processing: assess whether the use of foreign services such as Cloudflare, Google and GitHub to process data collected in Viet Nam triggers a cross-border-transfer dossier or a specific exception.
- Data-subject rights and governance: provide a private contact channel, handle correction/deletion/withdrawal requests, document lawful purposes, establish a retention schedule and govern processors/subprocessors.

The repository does not evidence completed impact-assessment or cross-border-transfer dossiers, provider-specific data-processing review, or a complete retention and deletion process. These matters cannot be fixed merely by adding a privacy paragraph to the website.

Read: [Law 91/2025/QH15](https://vanban.chinhphu.vn/?classid=1&docid=214590&pageid=27160&typegroupid=3) and [Decree 356/2025/ND-CP](https://vanban.chinhphu.vn/?classid=1&docid=216387&pageid=27160).

## Could there be a fine?

Administrative sanctions exist for violations of applicable cybersecurity and personal-data obligations. Whether a particular fine applies depends on the operator, legal classification, the conduct and dates, data types, impact, exemptions, mitigating/aggravating facts and the competent authority's findings. A public GitHub repository by itself does not prove a violation, and this review cannot calculate or predict a fine.

Do not assume that pausing the site removes obligations for past processing. Keep a factual record of the feature history, providers, data categories, dates and the read-only change. Ask a qualified Vietnamese lawyer or the competent authority to assess whether any past filing or remediation is needed.

## Other jurisdictions to consider

- **EU/EEA GDPR:** mere worldwide accessibility does not by itself establish GDPR territorial scope. It can apply where the operator is established in the EU/EEA, or where a non-EU operator offers services to people in the EU/EEA or monitors their behaviour there. Assess actual targeting and analytics before relying on this distinction. [GDPR Article 3 — EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679).
- **United States COPPA:** assess this if the service is directed to children under 13 or the operator has actual knowledge that it collects personal information from a child under 13. A Roblox-related audience makes an age/audience review sensible; a generic age statement alone does not settle the issue. [FTC COPPA FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions).
- **United States DMCA 17 U.S.C. §512:** if the operator wants to rely on the hosting safe-harbour framework for user-submitted material, requirements can include a publicly listed and registered designated agent, a notice/takedown process and a repeat-infringer policy. A generic Report button alone is not enough. [17 U.S.C. §512 — U.S. Code](https://uscode.house.gov/uscode-cgi/fastweb.exe?search).

## Before restoring community functionality

1. Have a parent/guardian involved in deciding who is legally responsible for operating the service. Do not publish personal home contact details or identity documents.
2. Get a written classification review for Decree 147 based on the old and proposed features. Confirm whether the read-only catalog itself is in scope and what requirements apply before adding accounts, user uploads, profiles or interactions again.
3. If Decree 147 applies, confirm the operator entity, license/notification route, domain, technical infrastructure, logs, local phone verification, moderation responsibility and other applicable requirements before launch.
4. Map each personal-data field, purpose, legal basis/consent, recipient, provider, processing location, retention period and access role. Complete any required assessment/submission for processing and cross-border transfers.
5. Add a private privacy contact channel and documented workflows for access, correction, export, deletion, consent withdrawal and complaints. Do not route private data requests to public GitHub Issues.
6. Set and implement retention/deletion schedules for accounts, content, reports, version snapshots, backups and security records. Existing D1 records need a deliberate decision; this deployment has not purged them.
7. Review minors' data, audience and age-appropriate design. Assess COPPA only where its scope is met, and GDPR only where its territorial scope is met.
8. Create a documented moderation and copyright process, including a private notice channel and takedown/review record. Assess the DMCA designated-agent and repeat-infringer requirements before relying on §512.
9. Reassess any new payments, sales, subscriptions, advertising or creator monetization under applicable e-commerce, consumer and tax rules before enabling them.

## Engineering changes completed

- [x] Community routes switched to read-only mode at the Worker API layer.
- [x] Public UI and README updated to describe read-only status.
- [x] Community profile, sign-in, upload, edit, vote and report endpoints paused; GitHub source routes remain available.
- [x] D1 session-version field added and verified; logout now invalidates all sessions for the account.
- [x] `website/schema.sql` synchronized with the live application tables and indexes.
- [x] GitHub Actions CI checks Worker syntax, Wrangler config and D1 schema.
- [x] CodeQL analysis workflow added for JavaScript/TypeScript.
- [ ] Legal classification and any required licensing/notification confirmed by qualified counsel/authority.
- [ ] Personal-data and cross-border impact-assessment duties confirmed and completed where required.
- [ ] Retention schedule, private rights-request channel, deletion/export workflow and moderation process implemented.
- [ ] Community functionality re-enabled only after legal and privacy sign-off.

## Important limitation

This document is an engineering and compliance-readiness checklist, not a legal opinion. It does not prove that the earlier operation complied or violated any law. A local lawyer or competent Vietnamese authority must determine the legal classification and obligations using the full operational facts.