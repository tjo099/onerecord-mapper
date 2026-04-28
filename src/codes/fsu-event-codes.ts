// Codes derived from IATA-Cargo XFSU Status Codes.xlsx via the sibling
// onerecord-xlsx-tools convert script; pinned by SHA256 of the upstream
// xlsx blob in test/fixtures/iata/xfsu-status-codes.json. v0.2.0 adopted
// the upstream 26 codes (Phase 0.2 Outcome C, see spec §2.4); 6 codes
// changed in each direction vs. the v0.1.x hand-pin.
export const FSU_EVENT_CODES = Object.freeze({
  ARR: 'ARR',
  AWD: 'AWD',
  AWR: 'AWR',
  BKD: 'BKD',
  CCD: 'CCD',
  CRC: 'CRC',
  DDL: 'DDL',
  DEP: 'DEP',
  DIS: 'DIS',
  DLV: 'DLV',
  DOC: 'DOC',
  DPU: 'DPU',
  FIW: 'FIW',
  FOH: 'FOH',
  FOW: 'FOW',
  MAN: 'MAN',
  NFD: 'NFD',
  OCI: 'OCI',
  OSI: 'OSI',
  PRE: 'PRE',
  RCF: 'RCF',
  RCS: 'RCS',
  RCT: 'RCT',
  TFD: 'TFD',
  TGC: 'TGC',
  TRM: 'TRM',
} as const)

export type FsuCode = keyof typeof FSU_EVENT_CODES

export interface FsuEventMapping {
  readonly fsuCode: FsuCode
  readonly eventTypeCode: string
}

export function fsuCodeToEventTypeCode(fsuCode: FsuCode): string {
  return FSU_EVENT_CODES[fsuCode]
}
