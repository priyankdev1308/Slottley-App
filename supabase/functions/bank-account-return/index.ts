// Served as the return_url/refresh_url for the Stripe onboarding Account
// Link. Loaded inside the app's in-app WebView (not a real browser tab),
// so the mobile equivalent of a web popup's `window.opener.callback()` is
// `window.ReactNativeWebView.postMessage(...)` — the app's WebView
// `onMessage` handler listens for this exact string, closes the modal,
// and refetches the connect status.
//
// Called directly by the user's browser session inside the WebView, not
// by the app's own authenticated client — like stripe-connect-webhook,
// this function MUST be deployed with `--no-verify-jwt`.
const HTML = `<!doctype html>
<html>
  <head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
  <body style="font-family: -apple-system, sans-serif; text-align: center; padding-top: 80px;">
    <p>Bank account connected. Returning to the app…</p>
    <script>
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage('bank_connect_complete');
      }
    </script>
  </body>
</html>`;

Deno.serve(() => new Response(HTML, { headers: { 'Content-Type': 'text/html' } }));
