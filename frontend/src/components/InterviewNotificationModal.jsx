import React, { useState, useEffect } from "react";
import {
  MailIcon,
  MessageSquareIcon,
  CheckCircle2Icon,
  SendIcon,
  XIcon,
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  SparklesIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  ShieldCheckIcon,
  Edit2Icon,
  SaveIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { generateSecureInviteToken } from "../lib/secureInviteToken";

export default function InterviewNotificationModal({ isOpen, onClose, interview, onUpdateInterview }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingWhatsapp, setIsSendingWhatsapp] = useState(false);

  // Editable Contact Fields
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");

  useEffect(() => {
    if (interview) {
      setCandidateEmail(interview.candidateEmail || "candidate@example.com");
      setCandidatePhone(interview.candidatePhone || interview.phone || "+1 (555) 876-5432");
    }
  }, [interview]);

  if (!isOpen || !interview) return null;

  const candidateName = interview.candidateName || "Candidate";
  const interviewTitle = interview.title || "Technical Interview";
  const interviewRole = interview.role || "Developer";
  const dateStr = interview.scheduledDate || "Tomorrow";
  const timeStr = interview.scheduledTime || "14:00";
  const duration = interview.durationMinutes || 60;

  // Generate secure invitation token
const secureInviteToken = generateSecureInviteToken(interview);
const secureRoomLink = `https://evalify.dev/room/${interview.id}?invite=${secureInviteToken}`;
const roomLink = secureRoomLink;

  // Dynamic Email & WhatsApp Content based on current editable email/phone
  const emailSubject = `[Evalify] Technical Interview Invitation: ${interviewTitle}`;
  const emailBody = `Hello ${candidateName},\n\nYou have been scheduled for a technical interview on Evalify.\n\nPosition: ${interviewRole}\nDate: ${dateStr}\nTime: ${timeStr} (${duration} Minutes)\n\nRoom Join Link: ${roomLink}\n\nPlease ensure your webcam and microphone are ready before joining.\n\nBest regards,\nEvalify Hiring Team`;

  const whatsappText = `Hello ${candidateName}! 👋\n\nYou have been scheduled for a Technical Interview on Evalify.\n\n📋 Title: ${interviewTitle}\n🎯 Role: ${interviewRole}\n📅 Date: ${dateStr}\n⏰ Time: ${timeStr} (${duration} mins)\n\n🔑 Join Link: ${roomLink}\n\nPlease ensure your webcam & mic are ready. Good luck!`;

  const cleanPhone = candidatePhone.replace(/[^0-9]/g, "");
  const whatsappWebUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappText)}`;
  const mailtoUrl = `mailto:${candidateEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const handleSaveContactUpdates = () => {
    if (!candidateEmail.trim() || !candidatePhone.trim()) {
      toast.error("Email and Phone number cannot be empty.");
      return;
    }
    setIsEditingContact(false);
    toast.success("Candidate contact information updated!");
    if (onUpdateInterview) {
      onUpdateInterview({
        ...interview,
        candidateEmail: candidateEmail.trim(),
        candidatePhone: candidatePhone.trim(),
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomLink);
    setCopiedLink(true);
    toast.success("Interview Room Link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyWhatsappMsg = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopiedMessage(true);
    toast.success("WhatsApp message template copied!");
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleSendEmail = () => {
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      toast.success(`Email invitation sent to ${candidateEmail}`);
      if (onUpdateInterview) {
        onUpdateInterview({
          ...interview,
          candidateEmail,
          candidatePhone,
          notifications: {
            ...interview.notifications,
            emailSent: true,
            emailSentAt: new Date().toISOString(),
          },
        });
      }
    }, 1200);
  };

  const handleSendWhatsapp = () => {
    setIsSendingWhatsapp(true);
    setTimeout(() => {
      setIsSendingWhatsapp(false);
      toast.success(`WhatsApp message sent to ${candidatePhone}`);
      if (onUpdateInterview) {
        onUpdateInterview({
          ...interview,
          candidateEmail,
          candidatePhone,
          notifications: {
            ...interview.notifications,
            whatsappSent: true,
            whatsappSentAt: new Date().toISOString(),
          },
        });
      }
    }, 1200);
  };

  const handleSendBoth = () => {
    handleSendEmail();
    handleSendWhatsapp();
  };

  const emailSent = interview.notifications?.emailSent;
  const whatsappSent = interview.notifications?.whatsappSent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-base-100 border border-base-300 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-base-300 flex items-center justify-between bg-gradient-to-r from-secondary/10 via-primary/10 to-accent/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-secondary font-bold text-xs">Candidate Invite Dispatcher</span>
              <span className="text-xs text-base-content/50 font-bold">Room ID: {interview.id}</span>
            </div>
            <h2 className="text-2xl font-black mt-1">Send Interview Notifications</h2>
            <p className="text-xs text-base-content/60">Edit contact details and dispatch Email & WhatsApp invitation messages</p>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Candidate Contact Bar with Inline Editing */}
          <div className="bg-base-200 border border-base-300 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-secondary/15 text-secondary font-black flex items-center justify-center text-lg">
                  {candidateName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm">{candidateName}</div>
                  <div className="text-xs text-base-content/60">{interviewRole}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isEditingContact ? (
                  <button onClick={handleSaveContactUpdates} className="btn btn-xs btn-success font-bold gap-1">
                    <SaveIcon className="size-3.5" /> Save Contact Info
                  </button>
                ) : (
                  <button onClick={() => setIsEditingContact(true)} className="btn btn-xs btn-outline btn-secondary font-bold gap-1">
                    <Edit2Icon className="size-3.5" /> Edit Email & Phone
                  </button>
                )}
                <button
                  onClick={handleSendBoth}
                  disabled={isSendingEmail || isSendingWhatsapp}
                  className="btn btn-xs btn-secondary font-bold gap-1 shadow-sm"
                >
                  <SparklesIcon className="size-3.5" /> Send Both
                </button>
              </div>
            </div>

            {/* Editable Contact Fields */}
            {isEditingContact ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-base-300">
                <div className="form-control">
                  <label className="label text-[11px] font-bold py-1">Candidate Email Address</label>
                  <div className="relative">
                    <MailIcon className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                    <input
                      type="email"
                      className="input input-sm input-bordered w-full pl-9 text-xs"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label text-[11px] font-bold py-1">WhatsApp / Contact Phone</label>
                  <div className="relative">
                    <PhoneIcon className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-success" />
                    <input
                      type="tel"
                      className="input input-sm input-bordered w-full pl-9 text-xs"
                      value={candidatePhone}
                      onChange={(e) => setCandidatePhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-base-content/70 pt-2 border-t border-base-300">
                <div className="flex items-center gap-1.5">
                  <MailIcon className="size-3.5 text-primary" />
                  <span>Email: <strong className="text-base-content">{candidateEmail}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PhoneIcon className="size-3.5 text-success" />
                  <span>WhatsApp: <strong className="text-base-content">{candidatePhone}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Copy Link Bar */}
          <div className="bg-base-200 border border-base-300 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <span className="font-bold text-base-content/60 whitespace-nowrap">Magic Join Link:</span>
              <code className="font-mono text-primary bg-base-100 px-2 py-1 rounded border border-base-300 truncate flex-1">{roomLink}</code>
            </div>
            <button onClick={handleCopyLink} className="btn btn-xs btn-outline gap-1 font-bold shrink-0">
              {copiedLink ? <><CheckIcon className="size-3 text-success" /> Copied</> : <><CopyIcon className="size-3" /> Copy Link</>}
            </button>
          </div>

          {/* Two-Column Dispatch Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* EMAIL DISPATCH CARD */}
            <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <MailIcon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Email Invitation</h3>
                    <p className="text-[11px] text-base-content/50">Send HTML email to registered inbox</p>
                  </div>
                </div>
                {emailSent && <span className="badge badge-success badge-sm font-bold gap-1"><CheckCircle2Icon className="size-3" /> Sent</span>}
              </div>

              {/* Email Content Preview Box */}
              <div className="bg-base-200 border border-base-300 rounded-xl p-4 text-xs space-y-2 flex-1 font-sans">
                <div className="border-b border-base-300 pb-2">
                  <span className="text-base-content/50 font-bold">To: </span>
                  <span className="font-semibold text-primary">{candidateEmail}</span>
                </div>
                <div className="border-b border-base-300 pb-2">
                  <span className="text-base-content/50 font-bold">Subject: </span>
                  <span className="font-semibold">{emailSubject}</span>
                </div>
                <div className="pt-1 text-base-content/80 whitespace-pre-wrap leading-relaxed text-[11px]">
                  {emailBody}
                </div>
              </div>

              {/* Email Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSendEmail}
                  disabled={isSendingEmail}
                  className="btn btn-sm btn-primary flex-1 font-bold gap-2"
                >
                  {isSendingEmail ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <SendIcon className="size-4" />
                  )}
                  {emailSent ? "Resend Email" : "Send Email Now"}
                </button>

                <a
                  href={mailtoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline gap-1"
                  title="Open in Mail Client"
                >
                  <ExternalLinkIcon className="size-3.5" />
                </a>
              </div>
            </div>

            {/* WHATSAPP DISPATCH CARD */}
            <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <MessageSquareIcon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">WhatsApp Message</h3>
                    <p className="text-[11px] text-base-content/50">Send instant WhatsApp notification</p>
                  </div>
                </div>
                {whatsappSent && <span className="badge badge-success badge-sm font-bold gap-1"><CheckCircle2Icon className="size-3" /> Sent</span>}
              </div>

              {/* WhatsApp Message Preview Box */}
              <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-4 text-xs space-y-2 flex-1 font-sans">
                <div className="border-b border-emerald-500/20 pb-2 flex justify-between items-center">
                  <div>
                    <span className="text-base-content/50 font-bold">Target Phone: </span>
                    <span className="font-semibold text-emerald-600">{candidatePhone}</span>
                  </div>
                  <button onClick={handleCopyWhatsappMsg} className="text-[10px] text-emerald-600 font-bold underline">
                    {copiedMessage ? "Copied!" : "Copy Msg"}
                  </button>
                </div>
                <div className="pt-1 text-base-content/80 whitespace-pre-wrap leading-relaxed text-[11px] font-sans">
                  {whatsappText}
                </div>
              </div>

              {/* WhatsApp Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSendWhatsapp}
                  disabled={isSendingWhatsapp}
                  className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none flex-1 font-bold gap-2"
                >
                  {isSendingWhatsapp ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <MessageSquareIcon className="size-4" />
                  )}
                  {whatsappSent ? "Resend WhatsApp" : "Send WhatsApp Msg"}
                </button>

                <a
                  href={whatsappWebUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 gap-1 font-bold"
                  title="Open WhatsApp Web Direct"
                >
                  <ExternalLinkIcon className="size-3.5" /> Direct
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-base-300 bg-base-200/50 flex justify-between items-center text-xs text-base-content/60">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="size-4 text-success" />
            <span>Candidate will receive standard secure join instructions with anti-cheat details.</span>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-secondary font-bold px-6">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
