'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Project, DragState, Size, Team } from '@/app/lib/types'
import {
  TEAMS, SIZES, SIZE_DAYS, TEAM_KEY, DAY_W,
  DC4_START, DC5_START, DC6_START, DC7_START,
  UNSCHEDULED_START, UNSCHEDULED_WIDTH,
  DC_CFG, DC_SEGMENTS, recomputeTotalDays,
} from '@/app/lib/data'
import ProjectModal from './ProjectModal'

const today = new Date()
today.setHours(0, 0, 0, 0)

function dayDate(n: number): Date {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return d
}

function fmt(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function GanttChart() {
  const [projects, setProjects]           = useState<Project[]>([])
  const [loading, setLoading]             = useState(true)
  const [activeFilters, setActiveFilters] = useState(new Set(TEAMS))
  const [modalProjectId, setModalProjectId] = useState<number | null | undefined>(undefined)
  const dragRef = useRef<DragState | null>(null)

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => { setProjects(data); setLoading(false) })
  }, [])

  const totalDays  = recomputeTotalDays(projects)
  const canvasW    = totalDays * DAY_W
  const hasUnscheduled = projects.some(p => p.start >= UNSCHEDULED_START)
  const visible    = projects.filter(p => activeFilters.has(p.team))

  // ── Drag handlers ──────────────────────────────────────────────
  const onMouseMove = useCallback((e: MouseEvent) => {
    const d = dragRef.current
    if (!d) return
    const dx = Math.round((e.clientX - d.startX) / DAY_W)
    setProjects(prev => prev.map(p => {
      if (p.id !== d.id) return p
      if (d.type === 'move') {
        return { ...p, start: Math.max(0, Math.min(totalDays - p.dur, d.origStart + dx)) }
      } else {
        return { ...p, dur: Math.max(1, Math.min(totalDays - p.start, d.origDur + dx)) }
      }
    }))
  }, [totalDays])

  const onMouseUp = useCallback(() => {
    const d = dragRef.current
    if (d) {
      setProjects(prev => {
        const p = prev.find(x => x.id === d.id)
        if (p) fetch(`/api/projects/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ start: p.start, dur: p.dur }) })
        return prev
      })
    }
    dragRef.current = null
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }, [onMouseMove])

  function startDrag(e: React.MouseEvent, id: number) {
    e.preventDefault()
    const p = projects.find(x => x.id === id)!
    dragRef.current = { type: 'move', id, startX: e.clientX, origStart: p.start, origDur: p.dur }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  function startResize(e: React.MouseEvent, id: number) {
    e.preventDefault()
    e.stopPropagation()
    const p = projects.find(x => x.id === id)!
    dragRef.current = { type: 'resize', id, startX: e.clientX, origStart: p.start, origDur: p.dur }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  // ── Filter ─────────────────────────────────────────────────────
  function toggleFilter(team: Team) {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(team)) {
        if (next.size === 1) return prev
        next.delete(team)
      } else {
        next.add(team)
      }
      return next
    })
  }

  // ── Size cycle ─────────────────────────────────────────────────
  function cycleSize(id: number) {
    setProjects(prev => {
      const next = prev.map(p => {
        if (p.id !== id) return p
        const size = SIZES[(SIZES.indexOf(p.size) + 1) % SIZES.length]
        return { ...p, size, dur: SIZE_DAYS[size] }
      })
      const updated = next.find(p => p.id === id)!
      fetch(`/api/projects/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ size: updated.size, dur: updated.dur }) })
      return next
    })
  }

  // ── Modal ──────────────────────────────────────────────────────
  async function handleSave(data: Omit<Project, 'id'>) {
    if (modalProjectId != null) {
      const res = await fetch(`/api/projects/${modalProjectId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const updated = await res.json()
      setProjects(prev => prev.map(p => p.id === modalProjectId ? updated : p))
    } else {
      const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const created = await res.json()
      setProjects(prev => [...prev, created])
    }
    setModalProjectId(undefined)
  }

  async function handleDelete() {
    await fetch(`/api/projects/${modalProjectId}`, { method: 'DELETE' })
    setProjects(prev => prev.filter(p => p.id !== modalProjectId))
    setModalProjectId(undefined)
  }

  // ── CSV export ─────────────────────────────────────────────────
  function exportCSV() {
    const rows = [['Name', 'Team', 'Size', 'Duration', 'Start offset', 'Start date', 'End date', 'Status', 'DC Label']]
    projects.forEach(p => rows.push([
      p.name, p.team, p.size, String(p.dur), String(p.start),
      fmt(dayDate(p.start)), fmt(dayDate(p.start + p.dur)),
      p.status, p.label,
    ]))
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'flagship-roadmap.csv'
    a.click()
  }

  // ── Render timeline header ─────────────────────────────────────
  function renderDcHeader() {
    return (
      <div className="tl-dc-row" style={{ width: canvasW }}>
        {DC_SEGMENTS.map(seg => {
          const w = (Math.min(seg.e, UNSCHEDULED_START) - seg.s) * DAY_W
          if (w <= 0) return null
          return (
            <div key={seg.dc} className={`dc-band ${seg.dc.toLowerCase()}`} style={{ width: w }}>
              {seg.dc}
            </div>
          )
        })}
        {hasUnscheduled && (
          <>
            <div style={{ width: 4 * DAY_W, flexShrink: 0, background: '#f5f4f0', borderLeft: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#bbb', letterSpacing: '.04em' }}>
              ···
            </div>
            <div style={{ width: UNSCHEDULED_WIDTH * DAY_W, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, background: '#f1efe8', color: '#888', borderLeft: '2px dashed #ccc', letterSpacing: '.05em' }}>
              Unscheduled
            </div>
          </>
        )}
      </div>
    )
  }

  function renderWkHeader() {
    const weeks: React.ReactNode[] = []
    for (let i = 0; i < UNSCHEDULED_START; i += 7) {
      const w = Math.min(7, UNSCHEDULED_START - i) * DAY_W
      const isBoundary = [DC4_START, DC5_START, DC6_START, DC7_START].includes(i)
      weeks.push(
        <div key={i} className={`wk-label${isBoundary ? ' dc-start' : ''}`} style={{ width: w }}>
          {fmt(dayDate(i))}
        </div>
      )
    }
    return (
      <div className="tl-wk-row" style={{ width: canvasW }}>
        {weeks}
        {hasUnscheduled && (
          <>
            <div style={{ width: 4 * DAY_W, flexShrink: 0, background: '#f5f4f0', borderLeft: '2px dashed #ccc' }} />
            <div style={{ width: UNSCHEDULED_WIDTH * DAY_W, flexShrink: 0, fontSize: 10, color: '#bbb', display: 'flex', alignItems: 'center', paddingLeft: 5, borderLeft: '2px dashed #ccc' }}>
              No target DC
            </div>
          </>
        )}
      </div>
    )
  }

  function renderBarCanvas(p: Project) {
    const isUnscheduled = p.start >= UNSCHEDULED_START
    const rowCanvasW = hasUnscheduled ? (UNSCHEDULED_START + 4 + UNSCHEDULED_WIDTH) * DAY_W : canvasW

    return (
      <div className="bar-canvas" style={{ width: rowCanvasW }}>
        {/* DC shading */}
        {DC_SEGMENTS.map(seg => {
          const w = (Math.min(seg.e, totalDays) - seg.s) * DAY_W
          if (w <= 0) return null
          return (
            <div key={seg.dc} className="dc-sh" style={{ left: seg.s * DAY_W, width: w, background: DC_CFG[seg.dc].bg }} />
          )
        })}

        {/* DC boundary lines */}
        {[DC4_START, DC5_START, DC6_START, DC7_START].map((d, i) => {
          if (d >= totalDays) return null
          const colors = [DC_CFG.DC4.line, DC_CFG.DC5.line, DC_CFG.DC6.line, DC_CFG.DC7.line]
          return <div key={d} className="dc-ln" style={{ left: d * DAY_W, background: colors[i] }} />
        })}

        {/* Unscheduled zone */}
        {isUnscheduled && (
          <>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: UNSCHEDULED_START * DAY_W, width: UNSCHEDULED_WIDTH * DAY_W, background: 'rgba(200,198,192,0.15)', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: UNSCHEDULED_START * DAY_W, width: 2, background: 'repeating-linear-gradient(to bottom,#ccc 0px,#ccc 4px,transparent 4px,transparent 8px)', pointerEvents: 'none', zIndex: 3 }} />
          </>
        )}

        {/* Today line */}
        <div className="today-ln" />

        {/* Bar */}
        <div
          className={`bar bar-${TEAM_KEY[p.team]}${isUnscheduled ? ' bar-unscheduled' : ''}`}
          style={{ left: p.start * DAY_W, width: p.dur * DAY_W }}
          title={`${p.name} · ${fmt(dayDate(p.start))} – ${fmt(dayDate(p.start + p.dur))} · ${p.dur} days`}
          onMouseDown={e => startDrag(e, p.id)}
        >
          <span style={{ pointerEvents: 'none' }}>{p.name}</span>
          <div className="rh" onMouseDown={e => startResize(e, p.id)} />
        </div>
      </div>
    )
  }

  const modalProject = modalProjectId != null
    ? projects.find(p => p.id === modalProjectId) ?? null
    : null

  if (loading) {
    return <div style={{ padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#999', background: '#f5f4f0', minHeight: '100vh' }}>Loading…</div>
  }

  return (
    <div style={{ padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#111', minHeight: '100vh', background: '#f5f4f0' }}>
      {/* Header */}
      <div className="page-header">
        <h1>Flagship Design Roadmap</h1>
        <span>{fmt(today)} – {fmt(dayDate(totalDays))}</span>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="team-filter">
          {TEAMS.map(t => (
            <span
              key={t}
              className={`pill pill-${TEAM_KEY[t]} ${activeFilters.has(t) ? 'active' : 'inactive'}`}
              onClick={() => toggleFilter(t)}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="toolbar-right">
          <button className="btn" onClick={exportCSV}>Export CSV</button>
          <button className="btn btn-primary" onClick={() => setModalProjectId(null)}>+ Add project</button>
        </div>
      </div>

      {/* Gantt */}
      <div className="gantt-outer">
        {/* Frozen panel */}
        <div className="frozen-panel">
          <div className="row-dc">Project</div>
          <div className="row-wk" style={{ fontSize: 11, color: '#aaa', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>Size</div>

          {visible.length === 0 ? (
            <div className="empty-state">No projects. Adjust filters or add one.</div>
          ) : (
            visible.map(p => (
              <div key={p.id} className="frozen-row">
                <div className="f-name">
                  <span className="project-name" onClick={() => setModalProjectId(p.id)}>{p.name}</span>
                  <div className="meta-row">
                    <span className={`team-tag pill-${TEAM_KEY[p.team]}`}>{p.team}</span>
                    {p.label && <span className="dc-tag">{p.label}</span>}
                  </div>
                </div>
                <div className="f-size">
                  <span className={`size-badge size-${p.size}`} onClick={() => cycleSize(p.id)} title="Click to cycle">
                    {p.size}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Scroll panel */}
        <div className="scroll-panel">
          {renderDcHeader()}
          {renderWkHeader()}
          {visible.map(p => (
            <div key={p.id} className="bar-row">
              {renderBarCanvas(p)}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="legend">
        <span className="legend-item"><span className="legend-dot" style={{ background: '#85B7EB' }} />LaunchX</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#AFA9EC' }} />WebX</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#97C459' }} />MMC</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#EF9F27' }} />Platform</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#E24B4A', opacity: 0.75 }} />Today</span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, fontSize: 11, color: '#aaa' }}>
          <span>XS=2d</span><span>S=5d</span><span>M=10d</span><span>L=20d</span><span>XL=30d</span>
        </span>
      </div>

      {/* Modal */}
      {modalProjectId !== undefined && (
        <ProjectModal
          project={modalProject}
          totalDays={totalDays}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModalProjectId(undefined)}
        />
      )}
    </div>
  )
}
