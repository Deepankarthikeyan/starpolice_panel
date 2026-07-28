import emblem from "../../../assets/images/star-police-academy-emblem.png";
import { DOCUMENT_FIELDS, buildFullName, type StudentProfile } from "../studentProfile";

type PrintPayload = {
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

function section(title: string, rows: Array<[string, string]>) {
  const body = rows
    .map(
      ([label, value]) => `
        <tr>
          <th>${label}</th>
          <td>${value}</td>
        </tr>`
    )
    .join("");

  return `
    <section class="print-section">
      <h2>${title}</h2>
      <table>
        <tbody>${body}</tbody>
      </table>
    </section>`;
}

function documentStatus(profile: StudentProfile, field: string) {
  if (field === "profilePhoto") {
    return profile.profilePhoto ? "Uploaded" : "—";
  }
  const key = field as keyof StudentProfile["documents"];
  return profile.documents[key] ? "Uploaded" : "—";
}

export function printStudentOnboarding({ email, isActive, profile }: PrintPayload) {
  const logoUrl = emblem.startsWith("http") ? emblem : `${window.location.origin}${emblem}`;
  const fullName = buildFullName(profile) || "Student";
  const printedAt = new Date().toLocaleString();

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Student Onboarding - ${fullName}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: Arial, Helvetica, sans-serif;
        color: #111;
        margin: 0;
        padding: 24px;
        font-size: 12px;
        line-height: 1.45;
      }
      .print-header {
        display: flex;
        align-items: center;
        gap: 16px;
        border-bottom: 2px solid #1a3a6d;
        padding-bottom: 16px;
        margin-bottom: 20px;
      }
      .print-header img {
        width: 72px;
        height: 72px;
        object-fit: contain;
      }
      .print-header h1 {
        margin: 0 0 4px;
        font-size: 22px;
        color: #1a3a6d;
      }
      .print-header p {
        margin: 0;
        color: #444;
      }
      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 20px;
        font-size: 11px;
      }
      .meta span {
        background: #f5f7fb;
        border: 1px solid #dde4f0;
        border-radius: 6px;
        padding: 6px 10px;
      }
      .print-section {
        margin-bottom: 18px;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .print-section h2 {
        margin: 0 0 8px;
        font-size: 14px;
        color: #1a3a6d;
        border-left: 4px solid #1a3a6d;
        padding-left: 8px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid #d9dfea;
        padding: 7px 10px;
        text-align: left;
        vertical-align: top;
      }
      th {
        width: 34%;
        background: #f8fafc;
        font-weight: 600;
      }
      .footer {
        margin-top: 24px;
        padding-top: 12px;
        border-top: 1px solid #d9dfea;
        font-size: 10px;
        color: #666;
        text-align: center;
      }
      @media print {
        body { padding: 12px; }
      }
    </style>
  </head>
  <body>
    <div class="print-header">
      <img src="${logoUrl}" alt="Star Police Academy" />
      <div>
        <h1>Star Police Academy</h1>
        <p>Student Onboarding Form</p>
      </div>
    </div>

    <div class="meta">
      <span><strong>Student:</strong> ${fullName}</span>
      <span><strong>Student ID:</strong> ${display(profile.studentId)}</span>
      <span><strong>Printed:</strong> ${printedAt}</span>
      <span><strong>Login Status:</strong> ${isActive ? "Active" : "Pending"}</span>
    </div>

    ${section("1. Personal Information", [
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
    ])}

    ${section("2. Contact Information", [
      ["Mobile Number", display(profile.mobileNumber)],
      ["Alternate Mobile Number", display(profile.alternateMobileNumber)],
      ["Email Address", display(email)],
      ["Parent/Guardian Mobile Number", display(profile.parentGuardianMobile)],
      ["Parent/Guardian Email", display(profile.parentGuardianEmail)],
    ])}

    ${section("3. Address", [
      ["Address Line 1", display(profile.addressLine1)],
      ["Address Line 2", display(profile.addressLine2)],
      ["City", display(profile.city)],
      ["District", display(profile.district)],
      ["State", display(profile.state)],
      ["Country", display(profile.country)],
      ["PIN/ZIP Code", display(profile.pincode)],
    ])}

    ${section("4. Parent/Guardian Details", [
      ["Father/Guardian Name", display(profile.fatherName)],
      ["Father Occupation", display(profile.fatherOccupation)],
      ["Mother/Guardian Name", display(profile.motherName)],
      ["Mother Occupation", display(profile.motherOccupation)],
      ["Guardian Name", display(profile.guardianName)],
      ["Relationship", display(profile.guardianRelationship)],
      ["Annual Family Income", display(profile.annualFamilyIncome)],
    ])}

    ${section("5. Academic Information", [
      ["School/College Name", display(profile.schoolCollegeName)],
      ["Previous Qualification", display(profile.previousQualification)],
      ["Board/University", display(profile.boardUniversity)],
      ["Year of Passing", display(profile.yearOfPassing)],
      ["Percentage/CGPA", display(profile.percentageCgpa)],
      ["Medium of Instruction", display(profile.mediumOfInstruction)],
    ])}

    ${section("6. Course Details", [
      ["Course", display(profile.course)],
      ["Batch", display(profile.batch)],
      ["Branch/Campus", display(profile.branchCampus)],
      ["Section", display(profile.section)],
      ["Admission Date", display(profile.admissionDate)],
      ["Mode of Learning", formatLearningMode(profile.modeOfLearning)],
      ["Duration", display(profile.duration)],
      ["Expected Completion Date", display(profile.expectedCompletionDate)],
    ])}

    ${section(
      "7. Identity Documents",
      DOCUMENT_FIELDS.filter((item) => item.key !== "profilePhoto").map((item) => [
        item.label.replace(" (Optional)", ""),
        documentStatus(profile, item.key),
      ])
    )}

    ${section("8. Emergency Contact", [
      ["Emergency Contact Name", display(profile.emergencyContactName)],
      ["Relationship", display(profile.emergencyContactRelationship)],
      ["Mobile Number", display(profile.emergencyContactMobile)],
      ["Alternate Number", display(profile.emergencyContactAlternate)],
    ])}

    ${section("9. Login Credentials", [
      ["Username", display(profile.username)],
      ["Email", display(email)],
    ])}

    ${section("10. Payment Information", [
      ["Registration Fee", display(profile.registrationFee)],
      ["Course Fee", display(profile.courseFee)],
      ["Scholarship", display(profile.scholarship)],
      ["Discount", display(profile.discount)],
      ["Payment Method", display(profile.paymentMethod)],
      ["Payment Status", display(profile.paymentStatus)],
      ["Transaction ID", display(profile.transactionId)],
      ["Receipt Number", display(profile.receiptNumber)],
    ])}

    ${section("11. Medical Information", [
      ["Medical Conditions", display(profile.medicalConditions)],
      ["Allergies", display(profile.allergies)],
      ["Disabilities", display(profile.disabilities)],
      ["Emergency Notes", display(profile.emergencyNotes)],
    ])}

    ${section("12. Skills & Preferences", [
      ["Languages Known", display(profile.languagesKnown)],
      ["Computer Skills", display(profile.computerSkills)],
      ["Career Goal", display(profile.careerGoal)],
      ["Preferred Communication Language", display(profile.preferredCommunicationLanguage)],
    ])}

    ${section("13. Declaration", [
      ["Terms & Conditions Acceptance", display(profile.termsAccepted)],
      ["Privacy Policy Acceptance", display(profile.privacyAccepted)],
      ["Student Signature", display(profile.studentSignature)],
      ["Parent Signature", display(profile.parentSignature)],
      ["Date", display(profile.declarationDate)],
    ])}

    <div class="footer">
      Star Police Academy — Official Student Onboarding Record
    </div>
  </body>
</html>`;

  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!printWindow) {
    window.alert("Please allow pop-ups to print the student form.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  const logoImage = printWindow.document.querySelector("img");
  if (logoImage) {
    if (logoImage.complete) {
      triggerPrint();
    } else {
      logoImage.addEventListener("load", triggerPrint, { once: true });
      logoImage.addEventListener("error", triggerPrint, { once: true });
    }
  } else {
    triggerPrint();
  }
}
