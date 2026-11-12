# First owner access
- [x] Restrict owner bootstrap and close cross-academy self-enrollment paths.
- [x] Correct public login returns and signup confirmation state.
- [x] Verify destination tests, anonymous claim denial, signed-out Master and mobile login.
- [x] Verify authenticated owner Master end-to-end with the requesting owner's securely minted session.
- [x] Guide owner sign-in and Master verification.

# Public data security
- [x] Confirm public data exposure: academy read allowed to all authenticated accounts; tenant-only policies otherwise intact.
- [x] Restrict public booking reads to an explicit public projection and validate public submissions.
- [x] Verify visitor plans/form, invalid submission rejection and authenticated owner Master access.
- [ ] Review deep-scan result when delivered; the scan started before these fixes and may cite old code.
# Dashboard visual identity
- [ ] Align exact requested palette and matching fitness brand symbols across panels; verify desktop/mobile, lint, and existing tests without altering data.
- [x] Apply the new brand and scoped forest/emerald/teal glass presentation to both panel areas without changing data or handlers.
- [x] Verify authenticated Master rendering, navigation, creation form without submission, and mobile presentation; eight existing tests pass.
- [ ] Verify Academy dashboard with a tenant-member session; the available owner session has only Master access, and permissions must remain unchanged.
