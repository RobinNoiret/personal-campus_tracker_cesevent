import campusData from '@/data/campus-aliases.json'

export interface CampusConfig {
  name: string
  hashtags: string[]
  aliases: string[]
}

export type CampusId = keyof typeof campusData

export const CAMPUS_CONFIG: Record<string, CampusConfig> = campusData

export const getAllCampusIds = (): string[] => {
  return Object.keys(CAMPUS_CONFIG)
}

export const getCampusConfig = (campusId: string): CampusConfig | undefined => {
  return CAMPUS_CONFIG[campusId.toLowerCase()]
}

export const getCampusName = (campusId: string): string => {
  const config = getCampusConfig(campusId)
  return config?.name || campusId
}
