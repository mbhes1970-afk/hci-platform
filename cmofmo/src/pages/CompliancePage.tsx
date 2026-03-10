import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IcpScrollJourney } from '../components/IcpScrollJourney';
import { QuickQualifier } from '../components/QuickQualifier';
import { SectorSelector } from '../components/SectorGrid';
import { getIcp3Content, SECTOR_MAP } from '../config/icp-content';
import { useIntelligence } from '../hooks/useIntelligence';
import type { SectorId } from '../config/types';

export function CompliancePage() {
  const { sectorId } = useParams<{ sectorId?: string }>();
  const { setIcp, setSector, selectedSector } = useIntelligence();

  const activeSector = (sectorId as SectorId) || selectedSector;
  const content = getIcp3Content(activeSector);

  useEffect(() => {
    setIcp('icp3');
    if (sectorId && sectorId in SECTOR_MAP) {
      setSector(sectorId as SectorId);
    }
  }, [sectorId, setIcp, setSector]);

  return (
    <div>
      {/* Sector selector if no sector pre-selected */}
      {!sectorId && (
        <section className="px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <span className="inline-block font-mono text-xs tracking-widest uppercase text-brand-primary mb-4 px-3 py-1 rounded-full bg-brand-primary-dim">
              8 sectoren
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-brand-text-bright mb-4">
              In welke sector werkt uw organisatie?
            </h2>
            <p className="text-brand-text mb-10 max-w-2xl">
              Selecteer uw sector voor een gepersonaliseerde compliance journey.
            </p>
            <SectorSelector />
          </div>
        </section>
      )}

      {/* Scroll journey with sector-specific content */}
      <IcpScrollJourney sections={content.sections}>
        <QuickQualifier icpId="icp3" preselectedSector={activeSector || undefined} />
      </IcpScrollJourney>
    </div>
  );
}
