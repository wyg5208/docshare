-- 006: Add user validity period fields
-- Allows admin to set activation period for users
-- Priority: manual is_active=false overrides validity period

-- Add valid_from and valid_until columns to profiles
ALTER TABLE public.profiles
ADD COLUMN valid_from TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN valid_until TIMESTAMPTZ DEFAULT NULL;

-- Comment explaining the logic:
-- NULL valid_from + NULL valid_until = permanent (always valid if is_active=true)
-- valid_from + valid_until set = time-bound validity
-- is_active=false always takes precedence (user is disabled regardless of period)

-- Create a helper function to check if user is effectively active
-- considering both is_active flag and validity period
CREATE OR REPLACE FUNCTION is_user_effectively_active(user_id UUID)
RETURNS boolean AS $$
DECLARE
  user_record RECORD;
BEGIN
  SELECT is_active, valid_from, valid_until
  INTO user_record
  FROM public.profiles
  WHERE id = user_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Manual disable takes precedence
  IF NOT user_record.is_active THEN
    RETURN false;
  END IF;

  -- If no validity period set, user is permanently active
  IF user_record.valid_from IS NULL AND user_record.valid_until IS NULL THEN
    RETURN true;
  END IF;

  -- Check validity period
  IF user_record.valid_from IS NOT NULL AND now() < user_record.valid_from THEN
    RETURN false;
  END IF;

  IF user_record.valid_until IS NOT NULL AND now() > user_record.valid_until THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
