// أنواع مبسّطة تعكس مخطط قاعدة البيانات (supabase/migrations/0001_init.sql).
// لاحقًا: تُولَّد تلقائيًا عبر `supabase gen types typescript`.

export type Difficulty = "easy" | "medium" | "hard";
export type TaskRepeat =
  | "daily"
  | "weekly"
  | "one_time"
  | "family_challenge"
  | "reflection"
  | "behavioral";
export type ProofType =
  | "self_confirm"
  | "note"
  | "choice_list"
  | "guardian_direct"
  | "photo"
  | "auto_check";
export type AssignedStatus =
  | "assigned"
  | "in_progress"
  | "submitted"
  | "approved"
  | "rejected"
  | "redo_requested";
export type GoalType = "template" | "custom";
export type GoalStatus = "active" | "completed" | "archived";

export interface CoreValue {
  id: string;
  key: string;
  label_ar: string;
  description_ar: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface SubValue {
  id: string;
  core_value_id: string;
  key: string;
  label_ar: string;
  sort_order: number;
}

export interface AgeStage {
  id: string;
  key: string;
  label_ar: string;
  min_age: number;
  max_age: number;
  sort_order: number;
  is_draft: boolean;
}

export interface Family {
  id: string;
  owner_id: string;
  name: string | null;
  created_at: string;
}

export interface Child {
  id: string;
  family_id: string;
  display_name: string;
  age: number | null;
  age_stage_id: string | null;
  gender: string | null;
  created_at: string;
  username?: string | null;
  nickname?: string | null;
  public_name_mode?: string;
  auth_user_id?: string | null;
}

export interface GoalTemplate {
  id: string;
  core_value_id: string;
  sub_value_id: string | null;
  age_stage_id: string | null;
  title_ar: string;
  description_ar: string | null;
  difficulty: Difficulty;
  suggested_duration_days: number | null;
  success_criteria_ar: string | null;
  is_published: boolean;
}

export interface Goal {
  id: string;
  family_id: string;
  child_id: string | null;
  core_value_id: string;
  sub_value_id: string | null;
  source: GoalType;
  template_id: string | null;
  title_ar: string;
  description_ar: string | null;
  measure_ar: string | null;
  start_date: string | null;
  end_date: string | null;
  status: GoalStatus;
  created_at: string;
}

export interface TaskTemplate {
  id: string;
  core_value_id: string;
  sub_value_id: string | null;
  age_stage_id: string | null;
  title_ar: string;
  description_ar: string | null;
  difficulty: Difficulty;
  repeat_type: TaskRepeat;
  proof: ProofType;
  needs_guardian_approval: boolean;
  base_xp: number;
  child_instructions_ar: string | null;
  guardian_guidelines_ar: string | null;
  success_criteria_ar: string | null;
}
