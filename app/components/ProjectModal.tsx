'use client'

import { useEffect, useRef } from 'react'
import { Project, Team, Size } from '@/app/lib/types'
import { TEAMS, SIZES, SIZE_DAYS, TEAM_KEY } from '@/app/lib/data'

interface Props {
  project: Project | null
  totalDays: number
  onSave: (data: Omit<Project, 'id'>) => void
  onDelete: () => void
  onClose: () => void
}

export default function ProjectModal({ project, totalDays, onSave, onDelete, onClose }: Props) {
  const nameRef    = useRef<HTMLInputElement>(null)
  const teamRef    = useRef<HTMLSelectElement>(null)
  const sizeRef    = useRef<HTMLSelectElement>(null)
  const durRef     = useRef<HTMLInputElement>(null)
  const startRef   = useRef<HTMLInputElement>(null)
  const statusRef  = useRef<HTMLInputElement>(null)
  const labelRef   = useRef<HTMLInputElement>(null)

  useEffect(() => { nameRef.current?.focus() }, [])

  function handleSave() {
    const name = nameRef.current!.value.trim()
    if (!name) { alert('Project name required.'); return }
    const size = sizeRef.current!.value as Size
    const dur = Math.max(1, parseInt(durRef.current!.value) || SIZE_DAYS[size])
    const start = Math.max(0, parseInt(startRef.current!.value) || 0)
    onSave({
      name,
      team: teamRef.current!.value as Team,
      size,
      dur,
      start,
      status: statusRef.current!.value.trim(),
      label: labelRef.current!.value.trim(),
    })
  }

  function handleDelete() {
    if (confirm('Delete this project?')) onDelete()
  }

  function syncDur() {
    if (durRef.current && sizeRef.current) {
      durRef.current.value = String(SIZE_DAYS[sizeRef.current.value as Size])
    }
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="modal-bg"
      onClick={handleBackdrop}
    >
      <div className="modal">
        <h3>{project ? 'Edit project' : 'New project'}</h3>

        <div className="form-row">
          <label>Project name</label>
          <input ref={nameRef} type="text" defaultValue={project?.name ?? ''} placeholder="Project name" />
        </div>

        <div className="form-row">
          <label>Team</label>
          <select ref={teamRef} defaultValue={project?.team ?? TEAMS[0]}>
            {TEAMS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Size</label>
          <select ref={sizeRef} defaultValue={project?.size ?? 'M'} onChange={syncDur}>
            {SIZES.map(s => (
              <option key={s} value={s}>{s} (~{SIZE_DAYS[s]}d)</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Duration (days)</label>
          <input ref={durRef} type="number" min={1} max={totalDays} defaultValue={project?.dur ?? 5} />
        </div>

        <div className="form-row">
          <label>Start (days from today)</label>
          <input ref={startRef} type="number" min={0} max={totalDays - 1} defaultValue={project?.start ?? 0} />
        </div>

        <div className="form-row">
          <label>Status</label>
          <input ref={statusRef} type="text" defaultValue={project?.status ?? ''} placeholder="Planned, In Design…" />
        </div>

        <div className="form-row">
          <label>DC Label</label>
          <input ref={labelRef} type="text" defaultValue={project?.label ?? ''} placeholder="2026 DC3" />
        </div>

        <div className="modal-actions">
          {project && (
            <span className="del-link" onClick={handleDelete}>Delete</span>
          )}
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {project ? 'Save changes' : 'Add project'}
          </button>
        </div>
      </div>
    </div>
  )
}
