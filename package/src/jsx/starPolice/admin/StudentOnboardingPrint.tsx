import emblem from "../../../assets/images/star-police-academy-emblem.png";
import { DOCUMENT_FIELDS, buildFullName, type StudentProfile } from "../studentProfile";

export type PrintPayload = {
  email: string;
  isActive: boolean;
  profile: StudentProfile;
};

function display(value: string | boolean | undefined | null) {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  const text = String(value ?? "").trim();
  return text || "—";
}

function formatLearningMode(value: string) {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function documentStatus(profile: StudentProfile, field: string) {
  if (field === "profilePhoto") {
    return profile.profilePhoto ? "Uploaded" : "—";
  }
  const key = field as keyof StudentProfile["documents"];
  return profile.documents[key] ? "Uploaded" : "—";
}

function PrintSection({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string]>;
}) {
  return (
    <section className="spa-print-section">
      <h2>{title}</h2>
      <table>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th>{label}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function StudentOnboardingPrintContent({ email, isActive, profile }: PrintPayload) {
  const fullName = buildFullName(profile) || "Student";
  const printedAt = new Date().toLocaleString();

  return (
    <div className="spa-print-document">
      <div className="spa-print-header">
        <img src={emblem} alt="Star Police Academy" />
        <div>
          <h1>Star Police Academy</h1>
          <p>Student Onboarding Form</p>
        </div>
      </div>

      <div className="spa-print-meta">
        <span>
          <strong>Student:</strong> {fullName}
        </span>
        <span>
          <strong>Student ID:</strong> {display(profile.studentId)}
        </span>
        <span>
          <strong>Printed:</strong> {printedAt}
        </span>
        <span>
          <strong>Login Status:</strong> {isActive ? "Active" : "Pending"}
        </span>
      </div>

      <PrintSection
        title="1. Personal Information"
        rows={[
          ["Student ID", display(profile.studentId)],
          ["First Name", display(profile.firstName)],
          ["Middle Name", display(profile.middleName)],
          ["Last Name", display(profile.lastName)],
          ["Date of Birth", display(profile.dateOfBirth)],
          ["Gender", display(profile.gender)],
          ["Blood Group", display(profile.bloodGroup)],
          ["Nationality", display(profile.nationality)],
          ["Aadhaar/Passport Number", display(profile.aadhaarPassportNumber)],
          ["Profile Photo", documentStatus(profile, "profilePhoto")],
        ]}
      />

      <PrintSection
        title="2. Contact Information"
        rows={[
          ["Mobile Number", display(profile.mobileNumber)],
          ["Alternate Mobile Number", display(profile.alternateMobileNumber)],
          ["Email Address", display(email)],
          ["Parent/Guardian Mobile Number", display(profile.parentGuardianMobile)],
          ["Parent/Guardian Email", display(profile.parentGuardianEmail)],
        ]}
      />

      <PrintSection
        title="3. Address"
        rows={[
          ["Address Line 1", display(profile.addressLine1)],
          ["Address Line 2", display(profile.addressLine2)],
          ["City", display(profile.city)],
          ["District", display(profile.district)],
          ["State", display(profile.state)],
          ["Country", display(profile.country)],
          ["PIN/ZIP Code", display(profile.pincode)],
        ]}
      />

      <PrintSection
        title="4. Parent/Guardian Details"
        rows={[
          ["Father/Guardian Name", display(profile.fatherName)],
          ["Father Occupation", display(profile.fatherOccupation)],
          ["Mother/Guardian Name", display(profile.motherName)],
          ["Mother Occupation", display(profile.motherOccupation)],
          ["Guardian Name", display(profile.guardianName)],
          ["Relationship", display(profile.guardianRelationship)],
          ["Annual Family Income", display(profile.annualFamilyIncome)],
        ]}
      />

      <PrintSection
        title="5. Academic Information"
        rows={[
          ["School/College Name", display(profile.schoolCollegeName)],
          ["Previous Qualification", display(profile.previousQualification)],
          ["Board/University", display(profile.boardUniversity)],
          ["Year of Passing", display(profile.yearOfPassing)],
          ["Percentage/CGPA", display(profile.percentageCgpa)],
          ["Medium of Instruction", display(profile.mediumOfInstruction)],
        ]}
      />

      <PrintSection
        title="6. Course Details"
        rows={[
          ["Course", display(profile.course)],
          ["Batch", display(profile.batch)],
          ["Branch/Campus", display(profile.branchCampus)],
          ["Section", display(profile.section)],
          ["Admission Date", display(profile.admissionDate)],
          ["Mode of Learning", formatLearningMode(profile.modeOfLearning)],
          ["Duration", display(profile.duration)],
          ["Expected Completion Date", display(profile.expectedCompletionDate)],
        ]}
      />

      <PrintSection
        title="7. Identity Documents"
        rows={DOCUMENT_FIELDS.filter((item) => item.key !== "profilePhoto").map((item) => [
          item.label.replace(" (Optional)", ""),
          documentStatus(profile, item.key),
        ])}
      />

      <PrintSection
        title="8. Emergency Contact"
        rows={[
          ["Emergency Contact Name", display(profile.emergencyContactName)],
          ["Relationship", display(profile.emergencyContactRelationship)],
          ["Mobile Number", display(profile.emergencyContactMobile)],
          ["Alternate Number", display(profile.emergencyContactAlternate)],
        ]}
      />

      <PrintSection
        title="9. Login Credentials"
        rows={[
          ["Username", display(profile.username)],
          ["Email", display(email)],
        ]}
      />

      <PrintSection
        title="10. Payment Information"
        rows={[
          ["Registration Fee", display(profile.registrationFee)],
          ["Course Fee", display(profile.courseFee)],
          ["Scholarship", display(profile.scholarship)],
          ["Discount", display(profile.discount)],
          ["Payment Method", display(profile.paymentMethod)],
          ["Payment Status", display(profile.paymentStatus)],
          ["Transaction ID", display(profile.transactionId)],
          ["Receipt Number", display(profile.receiptNumber)],
        ]}
      />

      <PrintSection
        title="11. Medical Information"
        rows={[
          ["Medical Conditions", display(profile.medicalConditions)],
          ["Allergies", display(profile.allergies)],
          ["Disabilities", display(profile.disabilities)],
          ["Emergency Notes", display(profile.emergencyNotes)],
        ]}
      />

      <PrintSection
        title="12. Skills & Preferences"
        rows={[
          ["Languages Known", display(profile.languagesKnown)],
          ["Computer Skills", display(profile.computerSkills)],
          ["Career Goal", display(profile.careerGoal)],
          ["Preferred Communication Language", display(profile.preferredCommunicationLanguage)],
        ]}
      />

      <PrintSection
        title="13. Declaration"
        rows={[
          ["Terms & Conditions Acceptance", display(profile.termsAccepted)],
          ["Privacy Policy Acceptance", display(profile.privacyAccepted)],
          ["Student Signature", display(profile.studentSignature)],
          ["Parent Signature", display(profile.parentSignature)],
          ["Date", display(profile.declarationDate)],
        ]}
      />

      <div className="spa-print-footer">Star Police Academy — Official Student Onboarding Record</div>
    </div>
  );
}

export function printStudentOnboardingElement(element: HTMLElement) {
  const logo = element.querySelector("img");
  const logoSrc = logo?.getAttribute("src") || "";
  const absoluteLogo = logoSrc.startsWith("http")
    ? logoSrc
    : `${window.location.origin}${logoSrc.startsWith("/") ? logoSrc : `/${logoSrc}`}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Student Onboarding Print</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px; font-family: Arial, Helvetica, sans-serif; color: #111; font-size: 12px; line-height: 1.45; }
    .spa-print-header { display: flex; align-items: center; gap: 16px; border-bottom: 2px solid #1a3a6d; padding-bottom: 16px; margin-bottom: 20px; }
    .spa-print-header img { width: 72px; height: 72px; object-fit: contain; }
    .spa-print-header h1 { margin: 0 0 4px; font-size: 22px; color: #1a3a6d; }
    .spa-print-header p { margin: 0; color: #444; }
    .spa-print-meta { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; font-size: 11px; }
    .spa-print-meta span { background: #f5f7fb; border: 1px solid #dde4f0; border-radius: 6px; padding: 6px 10px; }
    .spa-print-section { margin-bottom: 18px; break-inside: avoid; page-break-inside: avoid; }
    .spa-print-section h2 { margin: 0 0 8px; font-size: 14px; color: #1a3a6d; border-left: 4px solid #1a3a6d; padding-left: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #d9dfea; padding: 7px 10px; text-align: left; vertical-align: top; }
    th { width: 34%; background: #f8fafc; font-weight: 600; }
    .spa-print-footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #d9dfea; font-size: 10px; color: #666; text-align: center; }
  </style>
</head>
<body>${element.innerHTML.replace(logoSrc, absoluteLogo)}</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDoc = frameWindow?.document;
  if (!frameDoc || !frameWindow) {
    iframe.remove();
    return;
  }

  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();

  const runPrint = () => {
    frameWindow.focus();
    frameWindow.print();
    window.setTimeout(() => iframe.remove(), 1000);
  };

  const frameLogo = frameDoc.querySelector("img");
  if (frameLogo && !frameLogo.complete) {
    frameLogo.addEventListener("load", runPrint, { once: true });
    frameLogo.addEventListener("error", runPrint, { once: true });
  } else {
    runPrint();
  }
}
