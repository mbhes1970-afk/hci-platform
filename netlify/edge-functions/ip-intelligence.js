/**
 * SignalMesh v2 — IP Intelligence (Netlify Edge Function)
 * ─────────────────────────────────────────────────────────────
 * Draait VOOR de pagina rendert — injecteert org/sector hint als meta tags.
 * GDPR: B2B organisatie-niveau, geen persoonsdata, legitimate interest.
 * ─────────────────────────────────────────────────────────────
 */
export default async (request, context) => {
  const response = await context.next();

  // Alleen HTML responses verwerken
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  // Haal IP op
  const ip = request.headers.get('x-nf-client-connection-ip')
    || (request.headers.get('x-forwarded-for') || '').split(',')[0].trim();

  if (!ip || ip === '127.0.0.1' || ip.startsWith('192.168') || ip.startsWith('10.')) {
    return response;
  }

  try {
    const token = Netlify.env.get('IPINFO_TOKEN') || '';
    const apiUrl = token
      ? `https://ipinfo.io/${ip}?token=${token}`
      : `https://ipinfo.io/${ip}/json`;

    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(800) });
    if (!res.ok) return response;

    const data = await res.json();

    // Alleen organisatie-niveau data — GEEN persoonsdata
    const hint = {
      org: data.org || '',
      city: data.city || '',
      country: data.country || '',
      timezone: data.timezone || '',
    };

    // Sector inferentie op basis van org-naam
    const orgLower = (hint.org + ' ' + (data.hostname || '')).toLowerCase();
    let sectorHint = '';
    if (/gemeente|province|overheid|ministerie|rijks|gemeent/.test(orgLower)) sectorHint = 's01';
    else if (/hospital|ziekenhuis|zorg|health|clinic|ggz|huisarts/.test(orgLower)) sectorHint = 's02';
    else if (/software|saas|hosting|cloud|digital|tech|ict/.test(orgLower)) sectorHint = 's03';
    else if (/bank|financial|finance|verzeker|pensioen|abn|rabobank|ing\b/.test(orgLower)) sectorHint = 's04';
    else if (/telecom|kpn|vodafone|t-mobile|ziggo|tele2|telenet/.test(orgLower)) sectorHint = 's05';
    else if (/energy|energie|water|utility|eneco|vattenfall|stedin/.test(orgLower)) sectorHint = 's06';
    else if (/university|universiteit|hogeschool|school|onderwijs/.test(orgLower)) sectorHint = 's01';

    // Strip ASN prefix (e.g. "AS1234 Company Name" → "Company Name")
    const orgName = hint.org.replace(/^AS\d+\s+/i, '').trim();

    // Injecteer als meta tags in de HTML <head>
    const metaTags = [
      `<meta name="sm-org" content="${encodeURIComponent(orgName)}">`,
      `<meta name="sm-city" content="${hint.city}">`,
      `<meta name="sm-country" content="${hint.country}">`,
      `<meta name="sm-sector-hint" content="${sectorHint}">`,
    ].join('\n    ');

    const html = await response.text();
    const modifiedHtml = html.replace('<head>', '<head>\n    ' + metaTags);

    return new Response(modifiedHtml, {
      status: response.status,
      headers: response.headers,
    });

  } catch (e) {
    // Silent fail — IPInfo is een hint, geen vereiste
    return response;
  }
};

export const config = { path: '/*' };
