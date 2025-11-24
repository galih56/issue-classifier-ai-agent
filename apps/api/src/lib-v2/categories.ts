import { Category } from "./types";

export const ISSUE_CATEGORIES: Category[] = [
  {
    category: "Payroll",
    subcategories: [
      "Salary deduction",
      "Overtime payment",
      "Bonus / incentive",
      "Payslip request",
      "Tax / BPJS"
    ]
  },
  {
    category: "Attendance",
    subcategories: [
      "Missing clock-in/out",
      "Leave approval",
      "Shift schedule",
      "Late attendance",
      "Correction request"
    ]
  },
  {
    category: "Employment",
    subcategories: [
      "Contract status",
      "Promotion / demotion",
      "Transfer request",
      "Resignation / termination",
      "Onboarding process"
    ]
  },
  {
    category: "Benefits",
    subcategories: [
      "Medical claim",
      "Insurance coverage",
      "Annual leave quota",
      "Training / course request",
      "Company facility"
    ]
  },
  {
    category: "System Access",
    description: "Covers all issues related to accessing and using internal HR systems or apps.",
    subcategories: [
      {
        name: "Email account issue",
        description: "Problems with email setup, login, or company email credentials."
      },
      {
        name: "HRIS login problem",
        description: "User cannot log into GreatDay or HR system, forgot password, or sees login failure."
      },
      {
        name: "Access permission request",
        description: "Requesting access to a module, report, or feature not yet available to the user."
      },
      {
        name: "Password reset",
        description: "Reset or unlock password for system account."
      },
      {
        name: "System error report",
        description: "System shows an error message, crash, or numeric/technical error (e.g. NaN, 500, 404)."
      },
      {
        name: "Application malfunction",
        description: "Form or button not functioning correctly without showing explicit error."
      }
    ]
  },
  {
    category: "General Inquiry",
    subcategories: [
      "Policy clarification",
      "Document request",
      "Event participation",
      "Internal memo",
      "Feedback / suggestion"
    ]
  }
];
