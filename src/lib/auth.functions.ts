import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email().max(255).optional(),
  username: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_]{3,15}$/)
    .optional(),
});

export const checkAvailability = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result: { emailAvailable: boolean | null; usernameAvailable: boolean | null } = {
      emailAvailable: null,
      usernameAvailable: null,
    };

    if (data.email) {
      const { data: ok, error } = await supabaseAdmin.rpc("email_available", {
        _email: data.email,
      });
      if (error) throw new Error(error.message);
      result.emailAvailable = ok;
    }

    if (data.username) {
      const { data: ok, error } = await supabaseAdmin.rpc("username_available", {
        _username: data.username,
      });
      if (error) throw new Error(error.message);
      result.usernameAvailable = ok;
    }

    return result;
  });