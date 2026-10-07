import type {
  EventStatus,
  EventType,
  RegistrationStatus,
  PaymentStatus,
  TicketStatus,
  VerifierStatus,
  UserRole,
} from "../constants";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface OrganizationRow {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationUserRow {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface PaymentConfig {
  payment_method: string;
  account_number: string;
  account_name: string;
  amount: string;
  currency: string;
  instructions: string;
}

export interface EventRow {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string | null;
  status: EventStatus;
  event_type: EventType;
  date_start: string | null;
  date_end: string | null;
  location: string | null;
  payment_config: PaymentConfig | null;
  settings: Record<string, Json>;
  created_at: string;
  updated_at: string;
}

export type FormFieldType =
  "text" | "email" | "phone" | "number" | "dropdown" | "radio" | "checkbox" | "textarea";

export interface FormFieldDefinition {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
}

export interface RegistrationFormRow {
  id: string;
  event_id: string;
  fields: FormFieldDefinition[];
  created_at: string;
  updated_at: string;
}

export interface RegistrationRow {
  id: string;
  event_id: string;
  form_id: string;
  email: string;
  participant_name: string;
  status: RegistrationStatus;
  form_data: Record<string, Json>;
  payment_status: PaymentStatus | null;
  transaction_id: string | null;
  payment_reviewed_by: string | null;
  payment_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketRow {
  id: string;
  event_id: string;
  registration_id: string | null;
  ticket_number: string;
  token_hash: string;
  status: TicketStatus;
  participant_name: string;
  participant_email: string;
  participant_data: Record<string, Json> | null;
  issued_by: string | null;
  issued_at: string;
  checked_in_at: string | null;
  checked_in_by: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  created_at: string;
}

export interface EventVerifierRow {
  id: string;
  event_id: string;
  organization_id: string;
  name: string;
  email: string;
  invitation_token_hash: string | null;
  status: VerifierStatus;
  expires_at: string;
  last_accessed_at: string | null;
  created_at: string;
}

export interface CheckinRow {
  id: string;
  ticket_id: string;
  event_id: string;
  verifier_id: string;
  checked_in_at: string;
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  organization_id: string | null;
  event_id: string | null;
  actor_id: string | null;
  actor_type: "USER" | "VERIFIER" | "SYSTEM";
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, Json> | null;
  ip_address: string | null;
  created_at: string;
}

/**
 * Supabase Database interface for strict typing
 */
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: OrganizationRow;
        Insert: Omit<OrganizationRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<OrganizationRow, "id">>;
      };
      organization_users: {
        Row: OrganizationUserRow;
        Insert: Omit<OrganizationUserRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<OrganizationUserRow, "id">>;
      };
      events: {
        Row: EventRow;
        Insert: Omit<EventRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<EventRow, "id">>;
      };
      registration_forms: {
        Row: RegistrationFormRow;
        Insert: Omit<RegistrationFormRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<RegistrationFormRow, "id">>;
      };
      registrations: {
        Row: RegistrationRow;
        Insert: Omit<RegistrationRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<RegistrationRow, "id">>;
      };
      tickets: {
        Row: TicketRow;
        Insert: Omit<TicketRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<TicketRow, "id">>;
      };
      event_verifiers: {
        Row: EventVerifierRow;
        Insert: Omit<EventVerifierRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<EventVerifierRow, "id">>;
      };
      checkins: {
        Row: CheckinRow;
        Insert: Omit<CheckinRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CheckinRow, "id">>;
      };
      audit_logs: {
        Row: AuditLogRow;
        Insert: Omit<AuditLogRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<AuditLogRow, "id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
