export const FILE_STATUS_MAP = {
  RGO: { stage: 0, label: "Registered Users", shortLabel: "Intake" },
  SP: { stage: 0, label: "Scheduling Pending", shortLabel: "Intake" },
  BIP: { stage: 0, label: "Information Pending", shortLabel: "Intake" },
  IP: { stage: 0, label: "Interview Pending", shortLabel: "Intake" },
  DP: { stage: 1, label: "Documents Pending", shortLabel: "Documents" },
  PP_I: { stage: 2, label: "Preparation - 1", shortLabel: "Preparation" },
  PP_II: { stage: 2, label: "Preparation - 2", shortLabel: "Preparation" },
  ITIN: { stage: 2, label: "ITIN Files", shortLabel: "Preparation" },
  RE_ES: { stage: 2, label: "Revised Estimate", shortLabel: "Preparation" },
  TR_S_I: { stage: 3, label: "Review & Summary 1", shortLabel: "Review" },
  TR_S_II: { stage: 3, label: "Review & Summary 2", shortLabel: "Review" },
  PP_EF: { stage: 3, label: "Payment Pending - Efiling", shortLabel: "Review" },
  PP_PF: { stage: 3, label: "Payment Pending - Paper filing", shortLabel: "Review" },
  FPR: { stage: 3, label: "Fee Payment Received - I", shortLabel: "Review" },
  FPR_II: { stage: 3, label: "Fee Payment Received - II", shortLabel: "Review" },
  CR_EF: { stage: 3, label: "Client Review - Efiling", shortLabel: "Review" },
  CR_PF: { stage: 3, label: "Client Review - Paper Filing", shortLabel: "Review" },
  EFP_I: { stage: 4, label: "Efiling Pending - 1", shortLabel: "Filing" },
  EFP_II: { stage: 4, label: "Efiling Pending - 2", shortLabel: "Filing" },
  PF_P: { stage: 4, label: "Paper Filing Pending", shortLabel: "Filing" },
  EF_AA_I: { stage: 4, label: "E - Filed & Awaiting Acceptance - 1", shortLabel: "Filing" },
  EF_AA_II: { stage: 4, label: "E - Filed & Awaiting Acceptance - 2", shortLabel: "Filing" },
  EF_REJ: { stage: 4, label: "E - Filed & Rejected", shortLabel: "Filing" },
  C_R: { stage: 4, label: "City Return", shortLabel: "Filing" },
  EFA_FC: { stage: 5, label: "E-Filing Accepted & Filing Complete", shortLabel: "Completed" },
  PF_D: { stage: 5, label: "Paper Filing Done", shortLabel: "Completed" },
  CANC: { stage: -1, label: "Cancelled", shortLabel: "Cancelled" },
};

export const FILING_PHASES = [
  { stage: 0, label: "Intake", color: "#6366F1" },
  { stage: 1, label: "Documents", color: "#F59E0B" },
  { stage: 2, label: "Preparation", color: "#8B5CF6" },
  { stage: 3, label: "Review", color: "#0EA5E9" },
  { stage: 4, label: "Filing", color: "#EF4C23" },
  { stage: 5, label: "Completed", color: "#0D9488" },
];

export const STATUS_NAME_TO_CODE = {
  "registered users": "RGO",
  registered: "RGO",
  "scheduling pending": "SP",
  "information pending": "BIP",
  "basic information pending": "BIP",
  "interview pending": "IP",
  "documents pending": "DP",
  "document pending": "DP",
  "preparation - 1": "PP_I",
  "preparation 1": "PP_I",
  "preparation - 2": "PP_II",
  "preparation 2": "PP_II",
  "review & summary 1": "TR_S_I",
  "review & summary - 1": "TR_S_I",
  "review & summary 2": "TR_S_II",
  "review & summary - 2": "TR_S_II",
  "itin files": "ITIN",
  itin: "ITIN",
  "revised estimate": "RE_ES",
  "payment pending - efiling": "PP_EF",
  "payment pending efiling": "PP_EF",
  "payment pending - paper filing": "PP_PF",
  "payment pending paper filing": "PP_PF",
  "fee payment received - i": "FPR",
  "fee payment received 1": "FPR",
  "fee payment received - 1": "FPR",
  "fee payment received - ii": "FPR_II",
  "fee payment received 2": "FPR_II",
  "fee payment received - 2": "FPR_II",
  "client review - efiling": "CR_EF",
  "client review efiling": "CR_EF",
  "client review - paper filing": "CR_PF",
  "client review paper filing": "CR_PF",
  "efiling pending - 1": "EFP_I",
  "efiling pending 1": "EFP_I",
  "efiling pending - 2": "EFP_II",
  "efiling pending 2": "EFP_II",
  "e - filed & awaiting acceptance - 1": "EF_AA_I",
  "e-filed & awaiting acceptance - 1": "EF_AA_I",
  "e-filed and awaiting acceptance 1": "EF_AA_I",
  "e - filed & awaiting acceptance - 2": "EF_AA_II",
  "e-filed & awaiting acceptance - 2": "EF_AA_II",
  "e - filed & rejected": "EF_REJ",
  "city return": "C_R",
  "e-filing accepted & filing complete": "EFA_FC",
  "efiling accepted & filing complete": "EFA_FC",
  "paper filing pending": "PF_P",
  "paper filing done": "PF_D",
  cancelled: "CANC",
};

export const getStatusesByStage = (stage) =>
  Object.entries(FILE_STATUS_MAP)
    .filter(([, meta]) => meta.stage === stage)
    .map(([code, meta]) => ({ code, ...meta }));

export const resolveFilingStatusInfo = ({
  fileStatusCode = "",
  fileStatusName = "",
}) => {
  const code = fileStatusCode.toUpperCase().trim();

  if (code && FILE_STATUS_MAP[code]) {
    return {
      ...FILE_STATUS_MAP[code],
      code,
      name: fileStatusName || FILE_STATUS_MAP[code].label,
    };
  }

  const norm = (fileStatusName || "").toLowerCase().trim();
  const mappedCode = STATUS_NAME_TO_CODE[norm];
  if (mappedCode && FILE_STATUS_MAP[mappedCode]) {
    return {
      ...FILE_STATUS_MAP[mappedCode],
      code: mappedCode,
      name: fileStatusName,
    };
  }

  if (norm.includes("complete") || norm.includes("accepted") || norm.includes("paper filing done")) {
    return { stage: 5, label: fileStatusName, shortLabel: "Completed", code: "EFA_FC", name: fileStatusName };
  }
  if (
    norm.includes("filed") ||
    norm.includes("efiling") ||
    norm.includes("awaiting acceptance") ||
    norm.includes("city return")
  ) {
    return { stage: 4, label: fileStatusName, shortLabel: "Filing", code: "EFP_I", name: fileStatusName };
  }
  if (norm.includes("review") || norm.includes("summary") || norm.includes("payment") || norm.includes("fee")) {
    return { stage: 3, label: fileStatusName, shortLabel: "Review", code: "TR_S_I", name: fileStatusName };
  }
  if (norm.includes("preparation") || norm.includes("estimate") || norm.includes("itin")) {
    return { stage: 2, label: fileStatusName, shortLabel: "Preparation", code: "PP_I", name: fileStatusName };
  }
  if (norm.includes("document") || norm.includes("upload")) {
    return { stage: 1, label: fileStatusName, shortLabel: "Documents", code: "DP", name: fileStatusName };
  }

  return {
    stage: 0,
    label: fileStatusName || "Registered Users",
    shortLabel: "Intake",
    code: "RGO",
    name: fileStatusName || "Registered Users",
  };
};

export const FILE_STATUS_PIPELINE = [
  { code: "RGO", label: "Registered Users" },
  { code: "SP", label: "Scheduling Pending" },
  { code: "BIP", label: "Information Pending" },
  { code: "IP", label: "Interview Pending" },
  { code: "DP", label: "Documents Pending" },
  { code: "PP_I", label: "Preparation - 1" },
  { code: "PP_II", label: "Preparation - 2" },
  { code: "TR_S_I", label: "Review & Summary 1" },
  { code: "TR_S_II", label: "Review & Summary 2" },
  { code: "ITIN", label: "ITIN Files" },
  { code: "RE_ES", label: "Revised Estimate" },
  { code: "PP_EF", label: "Payment Pending - Efiling" },
  { code: "PP_PF", label: "Payment Pending - Paper filing" },
  { code: "FPR", label: "Fee Payment Received - I" },
  { code: "FPR_II", label: "Fee Payment Received - II" },
  { code: "CR_EF", label: "Client Review - Efiling" },
  { code: "CR_PF", label: "Client Review - Paper Filing" },
  { code: "EFP_I", label: "Efiling Pending - 1" },
  { code: "EFP_II", label: "Efiling Pending - 2" },
  { code: "EF_AA_I", label: "E - Filed & Awaiting Acceptance - 1" },
  { code: "EF_AA_II", label: "E - Filed & Awaiting Acceptance - 2" },
  { code: "EF_REJ", label: "E - Filed & Rejected" },
  { code: "C_R", label: "City Return" },
  { code: "EFA_FC", label: "E-Filing Accepted & Filing Complete" },
  { code: "PF_P", label: "Paper Filing Pending" },
  { code: "PF_D", label: "Paper Filing Done" },
  { code: "CANC", label: "Cancelled" },
];

export const getPipelineIndex = (code) => {
  if (!code) return 0;
  const normalized = code.toUpperCase().trim();
  const index = FILE_STATUS_PIPELINE.findIndex((item) => item.code === normalized);
  return index >= 0 ? index : 0;
};

export const getPipelineProgressPercentage = (code) => {
  if (FILE_STATUS_PIPELINE.length <= 1) return 0;
  const index = getPipelineIndex(code);
  return Math.min(100, Math.round((index / (FILE_STATUS_PIPELINE.length - 1)) * 100));
};

export const getStageProgressPercentage = (stage) => {
  if (stage < 0) return 0;
  return Math.min(100, Math.round((stage / 5) * 100));
};
