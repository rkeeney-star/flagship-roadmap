import { Project, Team, Size } from './types'

export const TEAMS: Team[] = ['LaunchX', 'WebX', 'MMC', 'Platform']
export const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL']
export const SIZE_DAYS: Record<Size, number> = { XS: 2, S: 5, M: 10, L: 20, XL: 30 }
export const TEAM_KEY: Record<Team, string> = {
  LaunchX: 'launchx',
  WebX: 'webx',
  MMC: 'mmc',
  Platform: 'platform',
}

export const DAY_W = 34
export const DC4_START = 33
export const DC5_START = DC4_START + 42  // Jun 22
export const DC6_START = DC5_START + 42  // Aug 3
export const DC7_START = DC6_START + 42  // Sep 14
export const UNSCHEDULED_START = 210
export const UNSCHEDULED_WIDTH = 42

export const DC_CFG = {
  DC3: { bg: 'rgba(159,225,203,0.16)', line: '#97C459', band: '#edf8f3', bandTxt: '#27500A' },
  DC4: { bg: 'rgba(133,183,235,0.16)', line: '#85B7EB', band: '#eaf3fb', bandTxt: '#0C447C' },
  DC5: { bg: 'rgba(175,169,236,0.16)', line: '#AFA9EC', band: '#f1effe', bandTxt: '#3C3489' },
  DC6: { bg: 'rgba(239,159,39,0.12)',  line: '#EF9F27', band: '#fdf4e3', bandTxt: '#633806' },
  DC7: { bg: 'rgba(212,83,126,0.10)',  line: '#D4537E', band: '#fdf0f5', bandTxt: '#72243E' },
}

export const DC_SEGMENTS = [
  { dc: 'DC3' as const, s: 0,          e: DC4_START },
  { dc: 'DC4' as const, s: DC4_START,  e: DC5_START },
  { dc: 'DC5' as const, s: DC5_START,  e: DC6_START },
  { dc: 'DC6' as const, s: DC6_START,  e: DC7_START },
  { dc: 'DC7' as const, s: DC7_START,  e: UNSCHEDULED_START },
]

export function recomputeTotalDays(projects: Project[]): number {
  const scheduledMax = projects
    .filter(p => p.start < UNSCHEDULED_START)
    .reduce((m, p) => Math.max(m, p.start + p.dur), 0)

  const DC_STARTS = [0, DC4_START, DC5_START, DC6_START, DC7_START]
  let dcEnd = DC7_START + 42
  for (let i = 0; i < DC_STARTS.length; i++) {
    if (scheduledMax <= DC_STARTS[i] + 42) {
      dcEnd = (DC_STARTS[i + 1] || DC_STARTS[i] + 42) + 42
      break
    }
  }

  const hasUnscheduled = projects.some(p => p.start >= UNSCHEDULED_START)
  const scheduledEnd = Math.max(dcEnd, scheduledMax + 14)
  return hasUnscheduled ? UNSCHEDULED_START + UNSCHEDULED_WIDTH : scheduledEnd
}

export const INITIAL_PROJECTS: Project[] = [
  { id: 1,  name: 'Onboarding Hub: Physical IDX Agreement Trigger', team: 'LaunchX', size: 'M', start: 0,   dur: 10, status: 'Planned', label: '2025 DC8' },
  { id: 2,  name: 'Default Service Area for existing customers (Migration of data)', team: 'LaunchX', size: 'M', start: 0, dur: 10, status: 'Planned', label: '2025 DC8' },
  { id: 3,  name: 'Service Area - Part 2 of 2 (Onboarding Hub & Settings)', team: 'LaunchX', size: 'L', start: 0, dur: 20, status: 'Planned', label: '2026 DC1' },
  { id: 4,  name: 'Service Areas + Client Price Point: Post-MVP Enhancements', team: 'LaunchX', size: 'M', start: 0, dur: 10, status: 'Planned', label: '2026 DC2' },
  { id: 5,  name: '[Community] Account Hoteling - Part 1 of 3', team: 'LaunchX', size: 'L', start: 0, dur: 20, status: 'Planned', label: '2026 DC2' },
  { id: 6,  name: 'Improved UI for "Dashboard" page in Presence during Onboarding', team: 'LaunchX', size: 'XL', start: 0, dur: 30, status: 'Planned', label: '2026 DC3' },
  { id: 7,  name: '[Community] Account Hoteling - Part 2 of 2', team: 'LaunchX', size: 'XL', start: 0, dur: 30, status: 'Planned', label: '2026 DC3' },
  { id: 8,  name: '[Stretch] Automated Subdomains — Part 1 of 2', team: 'LaunchX', size: 'M', start: 0, dur: 10, status: 'Planned', label: '2026 DC3' },
  { id: 9,  name: 'Automated Subdomains — Part 2 of 2', team: 'LaunchX', size: 'M', start: 33, dur: 10, status: 'Planned', label: '2026 DC4' },
  { id: 10, name: '[Community] Account Hoteling — Part 2 of 3', team: 'LaunchX', size: 'L', start: 33, dur: 20, status: 'Planned', label: '2026 DC4' },
  { id: 11, name: '[Tentative] Service Areas + Client Price Point: Post-MVP | Cross-Feature Adoption (AI Blogs & Lead Generation Target Location)', team: 'LaunchX', size: 'M', start: 33, dur: 10, status: 'Planned', label: '2026 DC4' },
  { id: 12, name: 'Neighborhood CMS "Demographics & Map" Revamp', team: 'LaunchX', size: 'M', start: 33, dur: 10, status: 'Planned', label: '2026 DC4' },
  { id: 13, name: '[Community] ARM: Automatic Community user accounts for new CMS agents', team: 'LaunchX', size: 'XL', start: 33, dur: 30, status: 'Planned', label: '2026 DC4' },
  { id: 14, name: 'Onboarding Hub: "Content migration guidelines" field', team: 'LaunchX', size: 'M', start: 75, dur: 10, status: 'Planned', label: '2026 DC5' },
  { id: 15, name: '[Community] Automatic Community user accounts for new CMS agents - Part 2 of 2', team: 'LaunchX', size: 'L', start: 75, dur: 20, status: 'Planned', label: '2026 DC5' },
  { id: 16, name: '[Community] Bulk invites: User accounts created for all existing agents in CMS', team: 'LaunchX', size: 'L', start: 75, dur: 20, status: 'Planned', label: '2026 DC5' },
  { id: 17, name: '[Tentative] Agent Service Area & budget preferences', team: 'LaunchX', size: 'L', start: 210, dur: 20, status: 'Backlog', label: 'Backlog' },
  { id: 18, name: 'Streamlined Settings', team: 'LaunchX', size: 'M', start: 210, dur: 10, status: 'Backlog', label: 'Backlog' },
  { id: 19, name: 'Automate Domain setup', team: 'LaunchX', size: 'M', start: 210, dur: 10, status: 'Backlog', label: 'Backlog' },
  { id: 20, name: 'Better onboarding emails', team: 'LaunchX', size: 'XL', start: 210, dur: 30, status: 'Backlog', label: 'Backlog' },
  { id: 21, name: 'Sunset IAO', team: 'LaunchX', size: 'M', start: 210, dur: 10, status: 'On Hold', label: 'On Hold' },
  { id: 22, name: 'Remove Duplicate Listings in CMS', team: 'MMC', size: 'XL', start: 0, dur: 30, status: 'Planned', label: '2026 DC1' },
  { id: 23, name: 'MLS Board on admin view', team: 'MMC', size: 'L', start: 0, dur: 20, status: 'Planned', label: '2026 DC2' },
  { id: 24, name: 'MLS Auth on admin view', team: 'MMC', size: 'L', start: 0, dur: 20, status: 'Planned', label: '2026 DC2' },
  { id: 25, name: 'Authorization Discrepancy Cleanup', team: 'MMC', size: 'M', start: 0, dur: 10, status: 'Planned', label: '2026 DC3' },
  { id: 26, name: 'Part 2 of MLS Auth on admin view', team: 'MMC', size: 'L', start: 0, dur: 20, status: 'Planned', label: '2026 DC3' },
  { id: 27, name: 'CMS Agent Profile UI', team: 'MMC', size: 'L', start: 0, dur: 20, status: 'Planned', label: '2026 DC3' },
  { id: 28, name: 'Configurable "Exclusive Listings" Label', team: 'MMC', size: 'M', start: 0, dur: 10, status: 'Planned', label: '2026 DC3' },
  { id: 29, name: 'Add tenant comp to CMS & property elements', team: 'MMC', size: 'M', start: 0, dur: 10, status: 'Planned', label: '2026 DC3' },
  { id: 30, name: 'ARM for Custom Media Layout (pka Grouped Floorplans) in Dev CMS', team: 'MMC', size: 'M', start: 0, dur: 10, status: 'Planned', label: '2026 DC3' },
  { id: 31, name: 'Spike & Designs: Daily/Weekly Digest for Listing Feed Syndication', team: 'MMC', size: 'M', start: 0, dur: 10, status: 'Planned', label: '2026 DC3' },
  { id: 32, name: 'Daily/Weekly Digest for Listing Feed Syndication', team: 'MMC', size: 'M', start: 33, dur: 10, status: 'Planned', label: '2026 DC4' },
  { id: 33, name: 'Custom Media Layout (pka Grouped Floorplans) in Dev CMS', team: 'MMC', size: 'L', start: 33, dur: 20, status: 'Planned', label: '2026 DC4' },
  { id: 34, name: 'Improve Dev<>Prop Assignment', team: 'MMC', size: 'M', start: 75, dur: 10, status: 'Planned', label: '2026 DC5' },
  { id: 35, name: 'Testimonial Tree Integration', team: 'MMC', size: 'XL', start: 75, dur: 30, status: 'Planned', label: '2026 DC5' },
  { id: 36, name: '[Spike] Build Mid-Market Client Insights Dashboard', team: 'MMC', size: 'M', start: 75, dur: 10, status: 'Planned', label: '2026 DC5' },
  { id: 37, name: 'Development Data Import & Display (v2: Miami)', team: 'MMC', size: 'M', start: 117, dur: 10, status: 'Planned', label: '2026 DC6' },
  { id: 38, name: 'Sunset Feature Flags', team: 'MMC', size: 'M', start: 117, dur: 10, status: 'Planned', label: '2026 DC6' },
  { id: 39, name: 'Nested Neighborhoods', team: 'MMC', size: 'M', start: 159, dur: 10, status: 'Planned', label: '2026 DC7' },
  { id: 40, name: 'RSS Feed for Blog Sharing', team: 'MMC', size: 'M', start: 159, dur: 10, status: 'Planned', label: '2026 DC7' },
  { id: 41, name: '[Tentative] Blogs on Agent & Team Subdomains', team: 'MMC', size: 'M', start: 210, dur: 10, status: 'Backlog', label: 'Backlog' },
  { id: 42, name: 'Intranet', team: 'MMC', size: 'M', start: 210, dur: 10, status: 'Backlog', label: 'Backlog' },
  { id: 43, name: 'User Role Updates (User "Units")', team: 'MMC', size: 'M', start: 210, dur: 10, status: 'Backlog', label: 'Backlog' },
  { id: 44, name: '[ARM] Comply with TRREB VOW Requirements', team: 'MMC', size: 'L', start: 210, dur: 20, status: 'On Hold', label: 'On Hold' },
  { id: 45, name: 'Comply with TRREB VOW Requirements', team: 'MMC', size: 'M', start: 210, dur: 10, status: 'On Hold', label: 'On Hold' },
  { id: 46, name: 'Customize Saved Search Emails from Agents instead of Account Lead', team: 'MMC', size: 'M', start: 210, dur: 10, status: 'On Hold', label: 'On Hold' },
  { id: 47, name: 'Part 2 of Add "Internal-Facing" UI to Presence Pain Points', team: 'WebX', size: 'M', start: 0, dur: 10, status: 'Planned', label: '2026 DC1' },
  { id: 48, name: 'Custom Media Layout (pka Grouped Floorplans) in Dev CMS', team: 'WebX', size: 'L', start: 33, dur: 20, status: 'Planned', label: '2026 DC4' },
  { id: 49, name: 'PDF Uploads for Buttons', team: 'WebX', size: 'M', start: 210, dur: 10, status: 'On Hold', label: 'On Hold' },
  { id: 50, name: 'International area code drop down in phone number field', team: 'WebX', size: 'M', start: 210, dur: 10, status: 'On Hold', label: 'On Hold' },
  { id: 51, name: 'Bulk Delete Pages in Website Builder', team: 'WebX', size: 'M', start: 210, dur: 10, status: 'On Hold', label: 'On Hold' },
  { id: 52, name: 'Centralized Social Media Profile URLs', team: 'WebX', size: 'L', start: 210, dur: 20, status: 'On Hold', label: 'On Hold' },
  { id: 53, name: 'Additional Agent CMS fields', team: 'WebX', size: 'M', start: 210, dur: 10, status: 'On Hold', label: 'On Hold' },
  { id: 54, name: 'Additional Map Element Configurations', team: 'WebX', size: 'M', start: 210, dur: 10, status: 'On Hold', label: 'On Hold' },
  { id: 55, name: '"Exclude" Filters for Website Elements', team: 'WebX', size: 'M', start: 210, dur: 10, status: 'On Hold', label: 'On Hold' },
  { id: 56, name: 'Typography Configurations', team: 'WebX', size: 'XL', start: 210, dur: 30, status: 'On Hold', label: 'On Hold' },
  { id: 57, name: 'Allow Users to Change their email (with improved security)', team: 'Platform', size: 'L', start: 0, dur: 20, status: 'Planned', label: '2026 DC3' },
  { id: 58, name: 'Next Gen Audit Log Phase 8 of 9: Dashboard Content & Settings', team: 'Platform', size: 'L', start: 33, dur: 20, status: 'Planned', label: '2026 DC4' },
  { id: 59, name: 'Next Gen Audit Log Phase 9 of 9: UI', team: 'Platform', size: 'M', start: 75, dur: 10, status: 'Planned', label: '2026 DC5' },
]
