import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";
import { PrivacyBadge } from "@/components/shared/PrivacyBadge";

interface BaseFieldProps {
  label: string;
  htmlFor: string;
  /** Marca o campo como visível apenas ao Mestre. */
  private?: boolean;
  hint?: string;
  children: ReactNode;
}

/** Wrapper de label + controle, com marca de privacidade opcional. */
export function Field({
  label,
  htmlFor,
  private: isPrivate,
  hint,
  children,
}: BaseFieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <label htmlFor={htmlFor} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
        {isPrivate && <PrivacyBadge />}
      </div>
      {children}
      {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

type InputFieldProps = {
  label: string;
  private?: boolean;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function InputField({
  label,
  private: isPrivate,
  hint,
  id,
  name,
  className = "",
  ...props
}: InputFieldProps) {
  const fieldId = id ?? name;
  return (
    <Field label={label} htmlFor={fieldId ?? ""} private={isPrivate} hint={hint}>
      <input id={fieldId} name={name} className={`input ${className}`} {...props} />
    </Field>
  );
}

type TextareaFieldProps = {
  label: string;
  private?: boolean;
  hint?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextareaField({
  label,
  private: isPrivate,
  hint,
  id,
  name,
  rows = 3,
  className = "",
  ...props
}: TextareaFieldProps) {
  const fieldId = id ?? name;
  return (
    <Field label={label} htmlFor={fieldId ?? ""} private={isPrivate} hint={hint}>
      <textarea
        id={fieldId}
        name={name}
        rows={rows}
        className={`input resize-y ${className}`}
        {...props}
      />
    </Field>
  );
}

type SelectFieldProps = {
  label: string;
  private?: boolean;
  hint?: string;
  options: { value: string; label: string }[];
} & SelectHTMLAttributes<HTMLSelectElement>;

export function SelectField({
  label,
  private: isPrivate,
  hint,
  options,
  id,
  name,
  className = "",
  ...props
}: SelectFieldProps) {
  const fieldId = id ?? name;
  return (
    <Field label={label} htmlFor={fieldId ?? ""} private={isPrivate} hint={hint}>
      <select id={fieldId} name={name} className={`input ${className}`} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
