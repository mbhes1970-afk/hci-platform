import { useEffect } from 'react';
import { IcpScrollJourney } from '../components/IcpScrollJourney';
import { QuickQualifier } from '../components/QuickQualifier';
import { ICP1_CONTENT } from '../config/icp-content';
import { useIntelligence } from '../hooks/useIntelligence';

export function EuEntryPage() {
  const { setIcp } = useIntelligence();

  useEffect(() => {
    setIcp('icp1');
  }, [setIcp]);

  return (
    <IcpScrollJourney sections={ICP1_CONTENT.sections}>
      <QuickQualifier icpId="icp1" />
    </IcpScrollJourney>
  );
}
