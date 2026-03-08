// M13 vult dit verder in. Dit is de stub voor UTM/DealFlow pre-fill.

export function useIntelligence() {
  // Lees UTM parameters uit de URL
  const params = new URLSearchParams(window.location.search);

  return {
    utmSource: params.get('utm_source'),
    utmCampaign: params.get('utm_campaign'),
    utmMedium: params.get('utm_medium'),
    dealflowRef: params.get('ref') || params.get('dealflow'),

    // Stub: later uitbreiden met IP-detectie en DealFlow lookup
    detectedIcp: null as string | null,
    detectedSector: null as string | null,
    preFillOrg: null as string | null,
  };
}
