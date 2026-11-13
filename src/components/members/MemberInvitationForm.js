"use client";
import { useActionState } from "react";
import { createMemberInvitation } from "@/actions/invitations";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Alert } from "@/components/ui/Alert";
const initial = { ok: null, message: "", link: "" };
export default function MemberInvitationForm({ memberId, connected = false }) {
  const [state, action, pending] = useActionState(createMemberInvitation, initial);
  if (connected) return <p className="text-xs font-medium text-emerald-700">Akun sudah terhubung</p>;
  return <details className="mt-3">
    <summary className="cursor-pointer text-sm font-semibold text-[#407BB0] hover:text-[#32628E]">Undang ke akun Panitia</summary>
    <form action={action} className="mt-3 space-y-3">
      <input type="hidden" name="member_id" value={memberId}/>
      <TextField id={"invite-email-" + memberId} name="email" label="Email calon Panitia" type="email" required/>
      <Button type="submit" pending={pending}>Buat tautan undangan</Button>
      {state.message ? <Alert tone={state.ok ? "success" : "error"}>{state.message}</Alert> : null}
      {state.link ? <div className="space-y-2 rounded-xl border border-[#E3ECF5] bg-[#F8FAFC] p-3">
        <input readOnly value={typeof window === "undefined" ? state.link : window.location.origin + state.link} className="w-full rounded-lg border border-[#D8E3ED] bg-white px-3 py-2.5 text-xs text-[#334155]"/>
        <button type="button" onClick={() => navigator.clipboard.writeText(window.location.origin + state.link)} className="text-sm font-semibold text-[#407BB0] hover:text-[#32628E]">Salin tautan</button>
      </div> : null}
    </form>
  </details>;
}
