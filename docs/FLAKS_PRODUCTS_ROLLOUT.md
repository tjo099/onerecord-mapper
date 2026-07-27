# Flaks products ONE Record rollout

This rollout keeps Flaks Connect as the low-friction product setup fabric while
making every product usable by a peer that knows only ONE Record.

## Order of operations

1. Release `@flaks/onerecord` using `RELEASE_0_5.md`, then pin the same exact
   version in Cargo ERP, Skidd and Booking Portal.
2. Apply database migrations before deploying application code:
   - Cargo ERP:
     `20260726100000_connect_reliable_delivery_amendments.sql`
   - Skidd:
     `20260726010000_onerecord_standalone_profile.sql`,
     `20260726020000_flaks_connect_peer_profile.sql`, then
     `20260726030000_onerecord_subscription_2_2.sql`
   - Booking Portal: `0007_onerecord.sql`
3. Cargo ERP and Skidd already operate on stable public URLs. Preserve those
   origins as their ONE Record identities and verify after every release that
   `ServerInformation`, OpenID discovery, JWKS and data-holder Company IRIs
   remain reachable over HTTPS. Configure the equivalent stable identity for
   Booking Portal before its external production enablement.
4. Provision standards-only peer clients separately from Flaks Connect.
   Connect remains the 1-2-3 path inside the Flaks sphere; it is not required
   for an external ONE Record peer.
5. Run two smoke paths for every release:
   - Flaks path: operator-created relationship, airline approval, durable local
     credential capture, exact delivery acknowledgement, unattended status
     reconciliation.
   - Standards path: OIDC client credentials, ServerInformation, Logistics
     Object GET/HEAD, Action Request, Subscription, Notification, and Access
     Delegation request without any Connect headers.

## Signing-key rotation

- Cargo ERP and Skidd rotate per-tenant asymmetric keys and publish active and
  retiring public keys in JWKS. Skidd limits the overlap to 24 hours.
- Booking Portal uses deployment-managed keys. First deploy the new private
  key, public JWK and `kid` while placing the former public key in
  `ONERECORD_SIGNING_PREVIOUS_PUBLIC_JWKS`. Keep the former public key for at
  least the maximum token TTL plus clock tolerance; remove it in a later
  deployment.
- Never place private keys, OAuth client secrets, Connect workload keys or
  HMAC material in the Connect peer profile, audit payloads or logs.

## Operational acceptance

Do not call a product ONE Record conformant solely because its unit tests pass.
Before production enablement, run the IATA conformance/interoperability suite
against the deployed URL and archive:

- the tested API and ontology versions;
- the test report and timestamp;
- the public server profile and JWKS key IDs;
- a successful standards-only exchange with a non-Flaks implementation;
- retry/duplicate evidence for notifications and Connect delivery;
- key-rotation and revocation evidence.

Database backups, outbox age, dead-letter volume, failed credential
acknowledgements, expired signing-key overlap and amendment queues should be
production alerts, not dashboard-only metrics.
