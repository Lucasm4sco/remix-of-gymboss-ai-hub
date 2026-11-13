# First owner access
- [ ] Client first access: fix completed empty-tenant routing and visible, retry-safe onboarding failures; validate destinations and setup stages without publishing.
- [x] Kiwify: signed webhook, atomic processing, Master review, tenant isolation, official signature vector and disposable SQL tests implemented; authenticated Master empty state verified on desktop/mobile.
- [ ] Kiwify activation: user must register the webhook and save KIWIFY_WEBHOOK_TOKEN securely; publication and real-payment end-to-end checks are deliberately pending.
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

# Modern Dark identity
- [x] Apply the requested brand copy and shared neutral dark/orange presentation without changing handlers or data.
- [x] Verify eight tests, automatic compilation, authenticated Master navigation and desktop/mobile layouts without overflow; lint reports 2504 errors and 8 warnings, left unchanged outside visual scope.
- [ ] Verify Gabriel's client dashboard: blocked by lack of an authorized session for that account; shared Academy layout verified through onboarding only.
