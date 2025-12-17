import { google } from "googleapis";
import { supabaseService } from "../supabaseServer";
import { getAuthedGoogle } from "../googleClient";

const personalDomains = new Set([
  "gmail.com","googlemail.com","yahoo.com","outlook.com","hotmail.com","live.com","icloud.com",
  "aol.com","proton.me","protonmail.com","pm.me","me.com","mac.com"
]);

function extractEmail(s: string) {
  return (s.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "").toLowerCase();
}
function extractName(s: string) {
  const cleaned = s.replace(/<[^>]+>/g, "").replace(/"/g, "").trim();
  if (!cleaned || cleaned.includes("@")) return "";
  return cleaned;
}
function domainFromEmail(email: string) {
  const at = email.indexOf("@");
  return at > -1 ? email.slice(at + 1).toLowerCase() : "";
}
function companyNameFromDomain(domain: string) {
  const root = domain.split(".")[0] || domain;
  return root.charAt(0).toUpperCase() + root.slice(1);
}

export async function syncGmailLabelForUser(userId: string) {
  const labelName = process.env.GMAIL_LABEL || "Leads";
  const sb = supabaseService();
  const auth = await getAuthedGoogle(userId);
  const gmail = google.gmail({ version: "v1", auth });

  const profile = await gmail.users.getProfile({ userId: "me" });
  const myEmail = (profile.data.emailAddress || "").toLowerCase();

  const labels = await gmail.users.labels.list({ userId: "me" });
  const label = labels.data.labels?.find((l) => l.name === labelName);
  if (!label?.id) throw new Error(`Label not found: ${labelName}`);

  const list = await gmail.users.messages.list({
    userId: "me",
    labelIds: [label.id],
    maxResults: 50
  });

  const messages = list.data.messages || [];
  let synced = 0;

  const { data: pipeline } = await sb
    .from("pipelines")
    .select("id")
    .eq("user_id", userId)
    .order("created_at")
    .limit(1)
    .single();
  const pipelineId = pipeline?.id;
  if (!pipelineId) throw new Error("No pipeline found. Run supabase/seed.sql.");

  const { data: stages } = await sb
    .from("stages")
    .select("id,name,stage_order,probability")
    .eq("pipeline_id", pipelineId)
    .order("stage_order");

  const ordered = (stages || []).slice().sort((a: any, b: any) => a.stage_order - b.stage_order);
  const newStage = ordered.find((s: any) => s.name === "New") || ordered[0];
  if (!newStage) throw new Error("No stages found. Run supabase/seed.sql.");

  for (const m of messages) {
    if (!m.id) continue;

    const { data: existing } = await sb.from("activities").select("id").eq("external_id", m.id).limit(1);
    if (existing && existing.length) continue;

    const full = await gmail.users.messages.get({
      userId: "me",
      id: m.id,
      format: "metadata",
      metadataHeaders: ["From", "To", "Subject", "Date"]
    });

    const headers = full.data.payload?.headers || [];
    const h = (name: string) =>
      headers.find((x) => x.name?.toLowerCase() === name.toLowerCase())?.value || "";

    const from = h("From");
    const to = h("To");
    const subject = h("Subject") || "Email";
    const dateStr = h("Date");
    const occurredAt = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();

    const fromEmail = extractEmail(from);
    const toEmail = extractEmail(to);
    const prospectEmail = fromEmail && myEmail && fromEmail === myEmail ? toEmail : (fromEmail || toEmail);

    if (!prospectEmail) {
      await sb.from("activities").insert({
        user_id: userId,
        type: "EMAIL",
        subject,
        body: `From: ${from}\nTo: ${to}`,
        external_id: m.id,
        occurred_at: occurredAt
      });
      synced += 1;
      continue;
    }

    const displayName = extractName(from);
    const [firstNameRaw, ...rest] = displayName.split(/\s+/).filter(Boolean);
    const firstName = firstNameRaw || "Unknown";
    const lastName = rest.length ? rest.join(" ") : null;

    const domain = domainFromEmail(prospectEmail);
    const shouldCompany = domain && !personalDomains.has(domain);

    let companyId: string | null = null;
    if (shouldCompany) {
      const { data: compExisting } = await sb
        .from("companies")
        .select("id")
        .eq("user_id", userId)
        .eq("domain", domain)
        .limit(1);
      if (compExisting && compExisting.length) {
        companyId = compExisting[0].id;
      } else {
        const { data: compNew } = await sb
          .from("companies")
          .insert({ user_id: userId, domain, name: companyNameFromDomain(domain) })
          .select("id")
          .single();
        companyId = compNew?.id || null;
      }
    }

    let contactId: string;
    const { data: contactExisting } = await sb
      .from("contacts")
      .select("id")
      .eq("user_id", userId)
      .eq("email", prospectEmail)
      .limit(1);

    if (contactExisting && contactExisting.length) {
      contactId = contactExisting[0].id;
    } else {
      const { data: contactNew } = await sb
        .from("contacts")
        .insert({
          user_id: userId,
          email: prospectEmail,
          first_name: firstName,
          last_name: lastName,
          company_id: companyId
        })
        .select("id")
        .single();

      contactId = contactNew!.id;

      await sb.from("activities").insert({
        user_id: userId,
        type: "SYSTEM",
        contact_id: contactId,
        company_id: companyId,
        subject: "Auto-created contact",
        body: `Created from Gmail label "${labelName}": ${prospectEmail}`,
        occurred_at: occurredAt
      });
    }

    const { data: openDeals } = await sb.rpc("find_open_deal_for_contact", {
      p_user_id: userId,
      p_contact_id: contactId
    });
    let dealId: string | null = openDeals?.[0]?.deal_id || null;

    if (!dealId) {
      const dealName = `${firstName}${lastName ? " " + lastName : ""} – Lead`;
      const { data: dealNew } = await sb
        .from("deals")
        .insert({
          user_id: userId,
          pipeline_id: pipelineId,
          stage_id: newStage.id,
          probability: newStage.probability,
          name: dealName,
          company_id: companyId
        })
        .select("id")
        .single();

      dealId = dealNew!.id;

      await sb.from("deal_contacts").insert({ deal_id: dealId, contact_id: contactId });
      await sb.from("activities").insert({
        user_id: userId,
        deal_id: dealId,
        contact_id: contactId,
        company_id: companyId,
        type: "SYSTEM",
        subject: "Auto-created deal",
        body: `Created from Gmail label "${labelName}"`,
        occurred_at: occurredAt
      });
    }

    await sb.from("activities").insert({
      user_id: userId,
      deal_id: dealId,
      contact_id: contactId,
      company_id: companyId,
      type: "EMAIL",
      subject,
      body: `From: ${from}\nTo: ${to}`,
      external_id: m.id,
      occurred_at: occurredAt
    });

    // Simple proposal automation
    if (dealId && subject.toLowerCase().includes("proposal")) {
      const { data: proposalStage } = await sb
        .from("stages")
        .select("id,probability")
        .eq("pipeline_id", pipelineId)
        .eq("name", "Proposal")
        .limit(1)
        .single();

      if (proposalStage?.id) {
        await sb
          .from("deals")
          .update({
            stage_id: proposalStage.id,
            probability: proposalStage.probability,
            updated_at: new Date().toISOString()
          })
          .eq("id", dealId);

        await sb.from("activities").insert({
          user_id: userId,
          deal_id: dealId,
          type: "SYSTEM",
          subject: "Stage auto-updated",
          body: "Detected proposal email → moved to Proposal.",
          occurred_at: new Date().toISOString()
        });
      }
    }

    synced += 1;
  }

  return synced;
}
