export const getDate = () => {
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric", // e.g., "2024"
    month: "long", // e.g., "August"
    day: "numeric", // e.g., "10"
  });

  return formattedDate;
};

export const getFormattedDate = (dateInput) => {
  const date = new Date(dateInput);
  if (!dateInput || Number.isNaN(date.getTime())) return "—";

  const day = String(date.getDate()).padStart(2, "0"); // Get the day and pad with leading zero if needed
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Get the month (January is 0) and pad with leading zero
  const year = date.getFullYear(); // Get the full year

  const formattedDate = `${day}/${month}/${year}`;

  return formattedDate;
};

export const getApproverDesignation = (email, approversDoc) => {
  if (!email || !approversDoc) return null;
  const isFunding = approversDoc.funding_authority === email;
  const isVerification = approversDoc.verification_authority === email;
  if (isFunding && isVerification) return "Funding & Verification Approver";
  if (isFunding) return "Funding Approver";
  if (isVerification) return "Verification Approver";
  return null;
};

export const needsMyAction = (request, { role, myEmail, myDepartment, fundingAuthority, verificationAuthority }) => {
  const status = (request.status || "").toLowerCase();
  if (["approved", "rejected", "closed", "clarification_needed"].includes(status)) return false;

  const idx = request.approval_index ?? 0;
  const isDeptHead = role === "department_head" && !!myDepartment && myDepartment === request.department;
  const isFundingApprover = !!myEmail && myEmail === fundingAuthority;
  const isVerificationApprover = !!myEmail && myEmail === verificationAuthority;

  return (
    (idx === 0 && isDeptHead) ||
    (idx === 1 && isFundingApprover) ||
    (idx === 2 && isDeptHead) ||
    (idx === 3 && isVerificationApprover)
  );
};

export const needsMyResponse = (request, { myId, role, myDepartment }) => {
  if ((request.status || "").toLowerCase() !== "clarification_needed") return false;

  const pending = [...(request.clarification || [])].reverse().find((c) => !c.response);
  if (!pending) return false;

  const askedByDeptHead = (pending.asked_by_role || "department_head") === "department_head";
  if (askedByDeptHead) return String(request.user_id) === myId;

  return role === "department_head" && !!myDepartment && myDepartment === request.department;
};

export const generateRandomCode = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
};
