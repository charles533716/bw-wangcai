export const defaultRecommenderOptions = [
  "laoli",
  "laoliu",
  "admin01",
  "kai01",
  "Bill02",
  "tom88"
];

const isAlphaNumeric = value => /^[A-Za-z0-9]+$/.test(String(value || ""));

const resolveRowNumber = (row, index) => {
  const id = Number(row && (row.id || row.agentId));
  if (Number.isFinite(id) && id > 0) {
    return id % 1000 || index + 1;
  }
  return index + 1;
};

export function normalizeAgentRows(rows = []) {
  return rows.map((row, index) => {
    const rowNumber = resolveRowNumber(row, index);
    const currentName = row && (row.name || row.agentName || row.userName);
    const currentRecommender = row && row.recommender;
    const commType = String(row.commType || "");
    const fallbackAgentType = rowNumber % 3 === 1 ? "team" : rowNumber % 3 === 2 ? "multi" : "star";
    const agentType = row.agentType
      || (commType === "team" ? "team" : commType === "6" ? "multi" : commType === "3" ? "star" : fallbackAgentType);
    const fallbackCommissionPlanId = agentType === "team"
      ? "TEAM-001"
      : agentType === "multi"
        ? "MULTI-001"
        : "STAR-003";
    const fallbackCommissionPlanName = agentType === "team"
      ? "DW负盈利佣金方案"
      : agentType === "multi"
        ? "多层级返佣方案"
        : "opex260808-50";
    return {
      ...row,
      name: isAlphaNumeric(currentName)
        ? String(currentName)
        : `agent${String(rowNumber).padStart(3, "0")}`,
      recommender: isAlphaNumeric(currentRecommender)
        ? String(currentRecommender)
        : defaultRecommenderOptions[(rowNumber - 1) % defaultRecommenderOptions.length],
      agentStatus: row.agentStatus !== null && row.agentStatus !== undefined
        ? Number(row.agentStatus)
        : Number(row.status || 0),
      regTime: row.regTime || row.createTime || "",
      agentType,
      agentIdentity: row.agentIdentity || (agentType === "team" ? "官方代理" : "-"),
      dedicatedDomain: row.dedicatedDomain || (rowNumber % 6 === 0 ? `agent${rowNumber}.wangcai.test` : "-"),
      googleVerify: row.googleVerify || (rowNumber % 5 === 0 ? "bound" : "unbound"),
      parentAgentName: row.parentAgentName || (rowNumber % 3 === 0 ? "agent001" : "-"),
      subAgentCount: Number(row.subAgentCount || (rowNumber % 3)),
      subMemberCount: Number(row.subMemberCount || (rowNumber % 2)),
      commissionPlanId: row.commissionPlanId || fallbackCommissionPlanId,
      commissionPlanName: row.commissionPlanName || fallbackCommissionPlanName,
      pendingCommissionPlanName: row.pendingCommissionPlanName || "-",
      commissionRate: row.commissionRate !== null && row.commissionRate !== undefined ? row.commissionRate : null,
      centerBalanceCnySum: row.centerBalanceCnySum !== null && row.centerBalanceCnySum !== undefined
        ? row.centerBalanceCnySum
        : (rowNumber % 4 === 0 ? 1000 : 0),
      lastLoginTime: row.lastLoginTime || row.loginTime || "",
      currentTeam: row.currentTeam || (agentType === "team" ? "天下霸唱（副线）" : "-"),
      targetIdentity: row.targetIdentity || "keep"
    };
  });
}

export function filterAndPaginateAgentRows(rows = [], query = {}, dateRange = []) {
  const accountKeyword = String(query.name || "").trim().toLowerCase();
  const recommenderKeyword = String(query.recommender || "").trim().toLowerCase();
  const agentIdKeyword = String(query.agentId || "").trim().toLowerCase();
  const siteCode = String(query.siteCode || "").trim();
  const hasAgentStatus = query.agentStatus !== null
    && query.agentStatus !== undefined
    && query.agentStatus !== "";
  const startDate = Array.isArray(dateRange) && dateRange.length === 2 ? dateRange[0] : "";
  const endDate = Array.isArray(dateRange) && dateRange.length === 2 ? dateRange[1] : "";

  const filteredRows = normalizeAgentRows(rows).filter(row => {
    const accountMatched = !accountKeyword || String(row.name || "").toLowerCase().includes(accountKeyword);
    const agentIdMatched = !agentIdKeyword || String(row.id || "").toLowerCase().includes(agentIdKeyword);
    const recommenderMatched = !recommenderKeyword
      || String(row.recommender || "").toLowerCase().includes(recommenderKeyword);
    const siteMatched = !siteCode || String(row.siteCode || "") === siteCode;
    const typeMatched = !query.agentType || row.agentType === query.agentType;
    const googleMatched = !query.googleVerify || row.googleVerify === query.googleVerify;
    const statusMatched = !hasAgentStatus || Number(row.agentStatus) === Number(query.agentStatus);
    const registerDate = String(row.regTime || row.createTime || "").slice(0, 10);
    const dateMatched = (!startDate || registerDate >= startDate) && (!endDate || registerDate <= endDate);
    return agentIdMatched
      && accountMatched
      && recommenderMatched
      && siteMatched
      && typeMatched
      && statusMatched
      && googleMatched
      && dateMatched;
  }).sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

  const pageNum = Number(query.pageNum || 1);
  const pageSize = Number(query.pageSize || 20);
  const start = (pageNum - 1) * pageSize;
  return {
    rows: filteredRows.slice(start, start + pageSize),
    total: filteredRows.length
  };
}
