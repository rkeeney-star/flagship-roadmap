export type Team = 'LaunchX' | 'WebX' | 'MMC' | 'Platform'
export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL'

export interface Project {
  id: number
  name: string
  team: Team
  size: Size
  start: number
  dur: number
  status: string
  label: string
}

export interface DragState {
  type: 'move' | 'resize'
  id: number
  startX: number
  origStart: number
  origDur: number
}
