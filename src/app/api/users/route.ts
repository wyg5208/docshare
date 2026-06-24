import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/users - Update user status or validity period
 * Body: { userId: string, isActive?: boolean, action?: 'toggle_active' | 'set_validity', validFrom?: string | null, validUntil?: string | null }
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify the requester is an admin
    const serverClient = await createClient();
    const {
      data: { user },
    } = await serverClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await serverClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    if (action === "set_validity") {
      // Update validity period
      const { validFrom, validUntil } = body;
      const { error } = await adminClient
        .from("profiles")
        .update({
          valid_from: validFrom || null,
          valid_until: validUntil || null,
        })
        .eq("id", userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // Toggle active status (default behavior)
      const { isActive } = body;
      const { error } = await adminClient
        .from("profiles")
        .update({ is_active: !isActive })
        .eq("id", userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users - Physically delete a user
 * Body: { userId: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify the requester is an admin
    const serverClient = await createClient();
    const {
      data: { user },
    } = await serverClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await serverClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Use admin client to physically delete the user from auth.users
    // This will cascade-delete the profile record as well
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also clean up profile record if cascade didn't handle it
    await adminClient.from("profiles").delete().eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
