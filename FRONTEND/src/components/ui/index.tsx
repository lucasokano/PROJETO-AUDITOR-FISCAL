import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Page({ className = "", ...props }: HTMLAttributes<HTMLElement>) { return <section className={`ui-page ${className}`} {...props} />; }
export function Section({ className = "", ...props }: HTMLAttributes<HTMLElement>) { return <section className={`ui-section ${className}`} {...props} />; }
export function Card({ className = "", ...props }: HTMLAttributes<HTMLElement>) { return <article className={`ui-card ${className}`} {...props} />; }
export function Panel({ className = "", ...props }: HTMLAttributes<HTMLElement>) { return <section className={`ui-panel ${className}`} {...props} />; }
export function Toolbar({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={`ui-toolbar ${className}`} {...props} />; }
export function Divider() { return <hr className="ui-divider" />; }

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <header className="ui-page-header"><div>{eyebrow && <span className="ui-eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="ui-page-actions">{actions}</div>}</header>;
}

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) { return <button className={`ui-button ui-button-${variant} ${className}`} {...props} />; }
export function IconButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) { return <button className={`ui-icon-button ${className}`} {...props} />; }
export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={`ui-input ${className}`} {...props} />; }
export function SearchInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input type="search" className={`ui-input ui-search-input ${className}`} {...props} />; }
export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={`ui-input ui-textarea ${className}`} {...props} />; }
export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) { return <select className={`ui-input ui-select ${className}`} {...props} />; }
export function Checkbox({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) { return <label className="ui-checkbox"><input type="checkbox" {...props} /><span>{label}</span></label>; }
export function Badge({ tone = "neutral", className = "", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "success" | "danger" | "accent" }) { return <span className={`ui-badge ui-badge-${tone} ${className}`} {...props} />; }

export function Table({ children, className = "" }: { children: ReactNode; className?: string }) { return <div className={`ui-table-wrap ${className}`}><table className="ui-table">{children}</table></div>; }
export function LoadingState({ message = "Carregando..." }: { message?: string }) { return <div className="ui-state" role="status"><span className="ui-spinner" />{message}</div>; }
export function ErrorState({ title = "Não foi possível carregar", message }: { title?: string; message?: string }) { return <div className="ui-state ui-state-error" role="alert"><strong>{title}</strong>{message && <p>{message}</p>}</div>; }
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) { return <div className="ui-state"><strong>{title}</strong>{description && <p>{description}</p>}{action}</div>; }

export function Modal({ open, title, children, onClose, footer }: { open: boolean; title: string; children: ReactNode; onClose: () => void; footer?: ReactNode }) {
  if (!open) return null;
  return <div className="ui-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="ui-modal" role="dialog" aria-modal="true" aria-labelledby="ui-modal-title"><header><h2 id="ui-modal-title">{title}</h2><IconButton type="button" onClick={onClose} aria-label="Fechar">×</IconButton></header><div className="ui-modal-body">{children}</div>{footer && <footer>{footer}</footer>}</section></div>;
}
export function ConfirmModal({ open, title, description, confirmLabel = "Confirmar", onConfirm, onClose }: { open: boolean; title: string; description: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void }) { return <Modal open={open} title={title} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button></>}><p>{description}</p></Modal>; }
