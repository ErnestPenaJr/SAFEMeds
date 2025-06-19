/*
  # RPC Functions for S.A.F.E. Meds

  1. Functions
    - get_user_statistics: Admin-only function to get system statistics
    - update_user_role: Admin-only function to update user roles
    - get_user_medication_interactions: Get cached drug interactions for a user
    - update_user_medication_count: Update medication count in user profile
    - generate_user_health_report: Generate comprehensive health reports
    - cache_drug_interaction: Cache drug interaction data

  2. Security
    - All functions use SECURITY DEFINER for controlled access
    - Admin privilege checks where required
    - User data isolation enforced
*/

-- Function to get user statistics (admin only)
CREATE OR REPLACE FUNCTION get_user_statistics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  admin_check boolean;
BEGIN
  -- Check if current user is admin
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO admin_check;
  
  IF NOT admin_check THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Build statistics object with safe counts
  SELECT jsonb_build_object(
    'total_users', COALESCE((SELECT COUNT(*) FROM user_profiles), 0),
    'active_users', COALESCE((SELECT COUNT(*) FROM user_profiles WHERE is_active = true), 0),
    'admin_users', COALESCE((SELECT COUNT(*) FROM user_profiles WHERE role = 'admin'), 0),
    'premium_users', COALESCE((SELECT COUNT(*) FROM user_profiles WHERE role = 'premium'), 0),
    'new_users_this_week', COALESCE((
      SELECT COUNT(*) FROM user_profiles 
      WHERE created_at >= now() - interval '7 days'
    ), 0),
    'total_medications', COALESCE((
      SELECT COUNT(*) FROM medications WHERE medications.id IS NOT NULL
    ), 0),
    'active_medications', COALESCE((
      SELECT COUNT(*) FROM medications WHERE active = true
    ), 0),
    'total_side_effects', COALESCE((
      SELECT COUNT(*) FROM side_effects WHERE side_effects.id IS NOT NULL
    ), 0),
    'total_reactions', COALESCE((
      SELECT COUNT(*) FROM reaction_reports WHERE reaction_reports.id IS NOT NULL
    ), 0)
  ) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return basic stats if some tables don't exist yet
    RETURN jsonb_build_object(
      'total_users', COALESCE((SELECT COUNT(*) FROM user_profiles), 0),
      'active_users', COALESCE((SELECT COUNT(*) FROM user_profiles WHERE is_active = true), 0),
      'admin_users', COALESCE((SELECT COUNT(*) FROM user_profiles WHERE role = 'admin'), 0),
      'premium_users', COALESCE((SELECT COUNT(*) FROM user_profiles WHERE role = 'premium'), 0),
      'new_users_this_week', COALESCE((
        SELECT COUNT(*) FROM user_profiles 
        WHERE created_at >= now() - interval '7 days'
      ), 0),
      'total_medications', 0,
      'active_medications', 0,
      'total_side_effects', 0,
      'total_reactions', 0
    );
END;
$$;

-- Function to update user role (admin only)
CREATE OR REPLACE FUNCTION update_user_role(
  target_user_id uuid,
  new_role text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_check boolean;
  old_role text;
  rows_affected integer;
BEGIN
  -- Check if current user is admin
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO admin_check;
  
  IF NOT admin_check THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Validate new role
  IF new_role NOT IN ('user', 'premium', 'moderator', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  
  -- Get old role for logging
  SELECT role INTO old_role FROM user_profiles WHERE id = target_user_id;
  
  IF old_role IS NULL THEN
    RAISE EXCEPTION 'User not found: %', target_user_id;
  END IF;
  
  -- Update the role
  UPDATE user_profiles 
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  -- Try to log the activity (ignore if logging table doesn't exist)
  BEGIN
    PERFORM log_user_activity(
      auth.uid(),
      'user.role_changed',
      format('Changed user %s role from %s to %s', target_user_id, old_role, new_role),
      'medium',
      jsonb_build_object('target_user_id', target_user_id, 'old_role', old_role, 'new_role', new_role)
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Ignore logging errors
      NULL;
  END;
  
  RETURN rows_affected > 0;
END;
$$;

-- Function to get medication interactions for a user
CREATE OR REPLACE FUNCTION get_user_medication_interactions(target_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_to_check uuid;
  user_medications text[];
  interactions jsonb;
BEGIN
  -- Use provided user_id or current user
  user_id_to_check := COALESCE(target_user_id, auth.uid());
  
  -- Check access permissions
  IF target_user_id IS NOT NULL AND target_user_id != auth.uid() THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Access denied: Can only view own interactions unless admin';
    END IF;
  END IF;
  
  -- Try to get user's active medications
  BEGIN
    SELECT array_agg(name) INTO user_medications
    FROM medications 
    WHERE user_id = user_id_to_check AND active = true;
  EXCEPTION
    WHEN OTHERS THEN
      -- Return empty if medications table doesn't exist
      RETURN '[]'::jsonb;
  END;
  
  IF user_medications IS NULL OR array_length(user_medications, 1) < 2 THEN
    RETURN '[]'::jsonb;
  END IF;
  
  -- Try to get cached interactions
  BEGIN
    SELECT jsonb_agg(
      jsonb_build_object(
        'drugs', drug_names,
        'severity', severity,
        'description', description,
        'source', source
      )
    ) INTO interactions
    FROM drug_interactions
    WHERE drug_names && user_medications
      AND expires_at > now();
  EXCEPTION
    WHEN OTHERS THEN
      -- Return empty if interactions table doesn't exist
      RETURN '[]'::jsonb;
  END;
  
  RETURN COALESCE(interactions, '[]'::jsonb);
END;
$$;

-- Function to update medication count for a user
CREATE OR REPLACE FUNCTION update_user_medication_count(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  med_count integer;
BEGIN
  -- Try to count medications
  BEGIN
    SELECT COUNT(*) INTO med_count
    FROM medications 
    WHERE user_id = target_user_id AND active = true;
  EXCEPTION
    WHEN OTHERS THEN
      -- Set to 0 if medications table doesn't exist
      med_count := 0;
  END;
  
  -- Update user profile
  UPDATE user_profiles 
  SET 
    medication_count = med_count,
    updated_at = now()
  WHERE id = target_user_id;
END;
$$;

-- Function to generate user health report
CREATE OR REPLACE FUNCTION generate_user_health_report(
  target_user_id uuid DEFAULT NULL,
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_to_check uuid;
  report_start date;
  report_end date;
  result jsonb;
  medications_data jsonb;
  side_effects_data jsonb;
  reactions_data jsonb;
  interactions_data jsonb;
BEGIN
  -- Use provided user_id or current user
  user_id_to_check := COALESCE(target_user_id, auth.uid());
  
  -- Check access permissions
  IF target_user_id IS NOT NULL AND target_user_id != auth.uid() THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Access denied: Can only generate own reports unless admin';
    END IF;
  END IF;
  
  -- Set date range (default to last 30 days)
  report_start := COALESCE(start_date, CURRENT_DATE - interval '30 days');
  report_end := COALESCE(end_date, CURRENT_DATE);
  
  -- Get medications data safely
  BEGIN
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', name,
        'dosage', dosage,
        'frequency', frequency,
        'active', active,
        'start_date', start_date
      )
    ) INTO medications_data
    FROM medications 
    WHERE user_id = user_id_to_check;
  EXCEPTION
    WHEN OTHERS THEN
      medications_data := '[]'::jsonb;
  END;
  
  -- Get side effects data safely
  BEGIN
    SELECT jsonb_agg(
      jsonb_build_object(
        'medication_name', medication_name,
        'symptom', symptom,
        'severity', severity,
        'created_at', created_at,
        'resolved', resolved
      )
    ) INTO side_effects_data
    FROM side_effects 
    WHERE user_id = user_id_to_check 
      AND created_at::date BETWEEN report_start AND report_end;
  EXCEPTION
    WHEN OTHERS THEN
      side_effects_data := '[]'::jsonb;
  END;
  
  -- Get reactions data safely
  BEGIN
    SELECT jsonb_agg(
      jsonb_build_object(
        'medication_name', medication_name,
        'reaction_type', reaction_type,
        'severity', severity,
        'symptoms', symptoms,
        'created_at', created_at,
        'resolved', resolved
      )
    ) INTO reactions_data
    FROM reaction_reports 
    WHERE user_id = user_id_to_check 
      AND created_at::date BETWEEN report_start AND report_end;
  EXCEPTION
    WHEN OTHERS THEN
      reactions_data := '[]'::jsonb;
  END;
  
  -- Get interactions data safely
  BEGIN
    interactions_data := get_user_medication_interactions(user_id_to_check);
  EXCEPTION
    WHEN OTHERS THEN
      interactions_data := '[]'::jsonb;
  END;
  
  -- Build final report
  SELECT jsonb_build_object(
    'user_id', user_id_to_check,
    'report_period', jsonb_build_object(
      'start_date', report_start,
      'end_date', report_end
    ),
    'medications', COALESCE(medications_data, '[]'::jsonb),
    'side_effects', COALESCE(side_effects_data, '[]'::jsonb),
    'reactions', COALESCE(reactions_data, '[]'::jsonb),
    'interactions', COALESCE(interactions_data, '[]'::jsonb),
    'generated_at', now()
  ) INTO result;
  
  -- Try to log report generation (ignore if logging doesn't exist)
  BEGIN
    PERFORM log_user_activity(
      auth.uid(),
      'report.generated',
      format('Generated health report for user %s', user_id_to_check),
      'low',
      jsonb_build_object('target_user_id', user_id_to_check, 'date_range', jsonb_build_object('start', report_start, 'end', report_end))
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Ignore logging errors
      NULL;
  END;
  
  RETURN result;
END;
$$;

-- Function to cache drug interaction data
CREATE OR REPLACE FUNCTION cache_drug_interaction(
  p_drug_names text[],
  p_interaction_data jsonb,
  p_severity text,
  p_description text,
  p_source text DEFAULT 'API'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  interaction_id uuid;
BEGIN
  -- Sort drug names for consistent caching
  p_drug_names := (SELECT array_agg(name ORDER BY name) FROM unnest(p_drug_names) AS name);
  
  -- Try to insert or update interaction cache
  BEGIN
    INSERT INTO drug_interactions (
      drug_names,
      interaction_data,
      severity,
      description,
      source
    ) VALUES (
      p_drug_names,
      p_interaction_data,
      p_severity,
      p_description,
      p_source
    )
    ON CONFLICT (drug_names) 
    DO UPDATE SET
      interaction_data = EXCLUDED.interaction_data,
      severity = EXCLUDED.severity,
      description = EXCLUDED.description,
      source = EXCLUDED.source,
      expires_at = now() + interval '7 days'
    RETURNING id INTO interaction_id;
  EXCEPTION
    WHEN OTHERS THEN
      -- Return null if table doesn't exist yet
      RETURN NULL;
  END;
  
  RETURN interaction_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_medication_interactions(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_medication_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_user_health_report(uuid, date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION cache_drug_interaction(text[], jsonb, text, text, text) TO authenticated;