import { useEffect } from 'react';
import { IcpScrollJourney } from '../components/IcpScrollJourney';
import { QuickQualifier } from '../components/QuickQualifier';
import { ICP2_CONTENT } from '../config/icp-content';
import { useIntelligence } from '../hooks/useIntelligence';

export function GrowthPage() {
  const { setIcp } = useIntelligence();

  useEffect(() => {
    setIcp('icp2');
  }, [setIcp]);

  return (
    <IcpScrollJourney sections={ICP2_CONTENT.sections}>
      <QuickQualifier icpId="icp2" />
    </IcpScrollJourney>
  );
}
