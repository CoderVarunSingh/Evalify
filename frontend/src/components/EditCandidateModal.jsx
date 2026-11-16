import React, { useState, useEffect } from "react";
import { XIcon, MailIcon, PhoneIcon, UserIcon, SaveIcon, BriefcaseIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function EditCandidateModal({ isOpen, onClose, candidate, onSaveCandidate }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");

  useEffect(() => {
    if (candidate) {
      setName(candidate.name || "");
      setEmail(candidate.email || "");
      setPhone(candidate.phone || "");
      setRole(candidate.role || "Developer");
      setExperience(candidate.experience || "3 years");
    }
  }, [candidate]);

  if (!isOpen || !candidate) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Candidate Name and Email are required.");
      return;
    }

    const updatedCandidate = {
      ...candidate,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || "+1 (555) 876-5432",
      role: role.trim(),
      experience: experience.trim(),
    };

    onSaveCandidate(updatedCandidate);
    toast.success(`Updated contact details for ${updatedCandidate.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-base-100 border border-base-300 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-base-300 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-secondary/15 text-secondary">
              <UserIcon className="size-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Edit Candidate Contact</h3>
              <p className="text-xs text-base-content/50">Update registered email and WhatsApp phone</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="form-control">
            <label className="label text-xs font-bold py-1">Candidate Full Name</label>
            <div className="relative">
              <UserIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                className="input input-sm input-bordered w-full pl-9 font-semibold text-xs"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold py-1">Email Address (for Email Invites)</label>
            <div className="relative">
              <MailIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
              <input
                type="email"
                className="input input-sm input-bordered w-full pl-9 font-semibold text-xs"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold py-1">WhatsApp / Contact Phone Number</label>
            <div className="relative">
              <PhoneIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              <input
                type="tel"
                className="input input-sm input-bordered w-full pl-9 font-semibold text-xs"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label text-xs font-bold py-1">Target Role</label>
              <input
                type="text"
                className="input input-sm input-bordered w-full text-xs font-semibold"
                placeholder="e.g. Frontend Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold py-1">Experience</label>
              <input
                type="text"
                className="input input-sm input-bordered w-full text-xs font-semibold"
                placeholder="e.g. 4 years"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex gap-2 justify-end border-t border-base-300">
            <button type="button" onClick={onClose} className="btn btn-sm btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-sm btn-secondary font-bold gap-1.5">
              <SaveIcon className="size-4" /> Save Candidate Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
