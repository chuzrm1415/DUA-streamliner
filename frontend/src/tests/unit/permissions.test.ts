import { hasPermission, PERMISSIONS, ROLES } from "@/lib/permissions";

describe("hasPermission", () => {
  it("grants Manager permissions to Manager role", () => {
    expect(hasPermission(ROLES.MANAGER, PERMISSIONS.MANAGE_USERS)).toBe(true);
    expect(hasPermission(ROLES.MANAGER, PERMISSIONS.VIEW_REPORTS)).toBe(true);
    expect(hasPermission(ROLES.MANAGER, PERMISSIONS.EDIT_TEMPLATES)).toBe(true);
  });

  it("denies Customs Agent permissions to Manager role", () => {
    expect(hasPermission(ROLES.MANAGER, PERMISSIONS.UPLOAD_FILES)).toBe(false);
    expect(hasPermission(ROLES.MANAGER, PERMISSIONS.GENERATE_FINAL_DUA)).toBe(false);
  });

  it("grants Customs Agent permissions to CustomsAgent role", () => {
    expect(hasPermission(ROLES.CUSTOMS_AGENT, PERMISSIONS.UPLOAD_FILES)).toBe(true);
    expect(hasPermission(ROLES.CUSTOMS_AGENT, PERMISSIONS.PROCESS_DOCUMENTS)).toBe(true);
    expect(hasPermission(ROLES.CUSTOMS_AGENT, PERMISSIONS.REVIEW_DUA)).toBe(true);
    expect(hasPermission(ROLES.CUSTOMS_AGENT, PERMISSIONS.GENERATE_FINAL_DUA)).toBe(true);
    expect(hasPermission(ROLES.CUSTOMS_AGENT, PERMISSIONS.DOWNLOAD_DUA)).toBe(true);
  });

  it("denies Manager permissions to CustomsAgent role", () => {
    expect(hasPermission(ROLES.CUSTOMS_AGENT, PERMISSIONS.MANAGE_USERS)).toBe(false);
    expect(hasPermission(ROLES.CUSTOMS_AGENT, PERMISSIONS.VIEW_REPORTS)).toBe(false);
  });
});
