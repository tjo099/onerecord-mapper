// Codes verified against IATA-Cargo XFSU-Status-Codes.xlsx via the fixture
// at test/fixtures/iata/xfsu-status-codes.json (Task 37a). Per spec
// acceptance #2: exactly 26 codes.
export const FSU_EVENT_CODES = Object.freeze({
  ARR: 'ARR',
  AWD: 'AWD',
  AWR: 'AWR',
  BKD: 'BKD',
  CCD: 'CCD',
  CLR: 'CLR',
  CRC: 'CRC',
  DDL: 'DDL',
  DEP: 'DEP',
  DIS: 'DIS',
  DLV: 'DLV',
  FOH: 'FOH',
  FOO: 'FOO',
  FWB: 'FWB',
  MAN: 'MAN',
  NFD: 'NFD',
  OFD: 'OFD',
  PRE: 'PRE',
  RCF: 'RCF',
  RCM: 'RCM',
  RCS: 'RCS',
  RCT: 'RCT',
  RCV: 'RCV',
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
