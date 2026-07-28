import { ChangeEvent, Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import {
  DOCUMENT_FIELDS,
  type DocumentField,
  type StudentProfile,
  getDocumentUrl,
} from "../studentProfile";
import { getAbsoluteFileUrl } from "../fileUrl";

type FormState = {
  email: string;
  password: string;
  confirmPassword: string;
  isActive: boolean;
  profile: StudentProfile;
};

type StudentOnboardingFormProps = {
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  editing: boolean;
  loading: boolean;
  error: string;
  pendingFiles: Partial<Record<DocumentField, File>>;
  onPendingFile: (field: DocumentField, file: File | null) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
};

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div className="mb-3">
      <label className="form-label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
    </div>
  );
}

function Section({
  title,
  id,
  children,
  defaultOpen = false,
}: {
  title: string;
  id: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <div className="accordion-item">
      <h2 className="accordion-header">
        <button
          className={`accordion-button ${defaultOpen ? "" : "collapsed"}`}
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#${id}`}
        >
          {title}
        </button>
      </h2>
      <div id={id} className={`accordion-collapse collapse ${defaultOpen ? "show" : ""}`}>
        <div className="accordion-body">{children}</div>
      </div>
    </div>
  );
}

export default function StudentOnboardingForm({
  form,
  setForm,
  editing,
  loading,
  error,
  pendingFiles,
  onPendingFile,
  onSubmit,
  onCancel,
}: StudentOnboardingFormProps) {
  const updateProfile = (field: keyof StudentProfile, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      profile: { ...current.profile, [field]: value },
    }));
  };

  const onFileSelect = (field: DocumentField, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onPendingFile(field, file);
    event.target.value = "";
  };

  const renderFileField = (field: DocumentField, label: string, optional = false) => {
    const existingUrl = getDocumentUrl(form.profile, field);
    const pending = pendingFiles[field];

    return (
      <div className="col-md-6" key={field}>
        <Field label={`${label}${optional ? " (Optional)" : ""}`}>
          <input
            type="file"
            className="form-control"
            accept={field === "profilePhoto" ? "image/*" : "image/*,.pdf"}
            onChange={(event) => onFileSelect(field, event)}
          />
          {pending && <small className="text-success d-block mt-1">Selected: {pending.name}</small>}
          {!pending && existingUrl && (
            <a
              href={getAbsoluteFileUrl(existingUrl)}
              target="_blank"
              rel="noreferrer"
              className="small d-block mt-1"
            >
              View uploaded file
            </a>
          )}
          {!editing && !existingUrl && (
            <small className="text-muted d-block mt-1">Upload after saving the student record.</small>
          )}
        </Field>
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="card-title mb-0">{editing ? "Edit Student" : "Add Student"}</h4>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onCancel}>
            Back to list
          </button>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="accordion" id="studentOnboardingAccordion">
            <Section title="1. Personal Information" id="section-personal" defaultOpen>
              <div className="row">
                <div className="col-md-4">
                  <Field label="Student ID">
                    <input
                      className="form-control"
                      value={form.profile.studentId || "Auto-generated on save"}
                      disabled
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="First Name" required>
                    <input
                      className="form-control"
                      value={form.profile.firstName}
                      onChange={(e) => updateProfile("firstName", e.target.value)}
                      required
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Middle Name (Optional)">
                    <input
                      className="form-control"
                      value={form.profile.middleName}
                      onChange={(e) => updateProfile("middleName", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Last Name" required>
                    <input
                      className="form-control"
                      value={form.profile.lastName}
                      onChange={(e) => updateProfile("lastName", e.target.value)}
                      required
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Date of Birth">
                    <input
                      type="date"
                      className="form-control"
                      value={form.profile.dateOfBirth}
                      onChange={(e) => updateProfile("dateOfBirth", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Gender">
                    <select
                      className="form-select"
                      value={form.profile.gender}
                      onChange={(e) => updateProfile("gender", e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Blood Group (Optional)">
                    <input
                      className="form-control"
                      value={form.profile.bloodGroup}
                      onChange={(e) => updateProfile("bloodGroup", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Nationality">
                    <input
                      className="form-control"
                      value={form.profile.nationality}
                      onChange={(e) => updateProfile("nationality", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Aadhaar/Passport Number (Optional)">
                    <input
                      className="form-control"
                      value={form.profile.aadhaarPassportNumber}
                      onChange={(e) => updateProfile("aadhaarPassportNumber", e.target.value)}
                    />
                  </Field>
                </div>
                {renderFileField("profilePhoto", "Profile Photo")}
              </div>
            </Section>

            <Section title="2. Contact Information" id="section-contact">
              <div className="row">
                <div className="col-md-6">
                  <Field label="Mobile Number">
                    <input
                      className="form-control"
                      value={form.profile.mobileNumber}
                      onChange={(e) => updateProfile("mobileNumber", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Alternate Mobile Number">
                    <input
                      className="form-control"
                      value={form.profile.alternateMobileNumber}
                      onChange={(e) => updateProfile("alternateMobileNumber", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Email Address" required>
                    <input
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                      required
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Parent/Guardian Mobile Number">
                    <input
                      className="form-control"
                      value={form.profile.parentGuardianMobile}
                      onChange={(e) => updateProfile("parentGuardianMobile", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Parent/Guardian Email">
                    <input
                      type="email"
                      className="form-control"
                      value={form.profile.parentGuardianEmail}
                      onChange={(e) => updateProfile("parentGuardianEmail", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="3. Address" id="section-address">
              <div className="row">
                <div className="col-md-6">
                  <Field label="Address Line 1">
                    <input
                      className="form-control"
                      value={form.profile.addressLine1}
                      onChange={(e) => updateProfile("addressLine1", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Address Line 2">
                    <input
                      className="form-control"
                      value={form.profile.addressLine2}
                      onChange={(e) => updateProfile("addressLine2", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="City">
                    <input
                      className="form-control"
                      value={form.profile.city}
                      onChange={(e) => updateProfile("city", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="District">
                    <input
                      className="form-control"
                      value={form.profile.district}
                      onChange={(e) => updateProfile("district", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="State">
                    <input
                      className="form-control"
                      value={form.profile.state}
                      onChange={(e) => updateProfile("state", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Country">
                    <input
                      className="form-control"
                      value={form.profile.country}
                      onChange={(e) => updateProfile("country", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="PIN/ZIP Code">
                    <input
                      className="form-control"
                      value={form.profile.pincode}
                      onChange={(e) => updateProfile("pincode", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="4. Parent/Guardian Details" id="section-guardian">
              <div className="row">
                <div className="col-md-6">
                  <Field label="Father/Guardian Name">
                    <input
                      className="form-control"
                      value={form.profile.fatherName}
                      onChange={(e) => updateProfile("fatherName", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Father Occupation">
                    <input
                      className="form-control"
                      value={form.profile.fatherOccupation}
                      onChange={(e) => updateProfile("fatherOccupation", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Mother/Guardian Name">
                    <input
                      className="form-control"
                      value={form.profile.motherName}
                      onChange={(e) => updateProfile("motherName", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Mother Occupation">
                    <input
                      className="form-control"
                      value={form.profile.motherOccupation}
                      onChange={(e) => updateProfile("motherOccupation", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Guardian Name (if applicable)">
                    <input
                      className="form-control"
                      value={form.profile.guardianName}
                      onChange={(e) => updateProfile("guardianName", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Relationship">
                    <input
                      className="form-control"
                      value={form.profile.guardianRelationship}
                      onChange={(e) => updateProfile("guardianRelationship", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Annual Family Income (Optional)">
                    <input
                      className="form-control"
                      value={form.profile.annualFamilyIncome}
                      onChange={(e) => updateProfile("annualFamilyIncome", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="5. Academic Information" id="section-academic">
              <div className="row">
                <div className="col-md-6">
                  <Field label="School/College Name">
                    <input
                      className="form-control"
                      value={form.profile.schoolCollegeName}
                      onChange={(e) => updateProfile("schoolCollegeName", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Previous Qualification">
                    <input
                      className="form-control"
                      value={form.profile.previousQualification}
                      onChange={(e) => updateProfile("previousQualification", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Board/University">
                    <input
                      className="form-control"
                      value={form.profile.boardUniversity}
                      onChange={(e) => updateProfile("boardUniversity", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Year of Passing">
                    <input
                      className="form-control"
                      value={form.profile.yearOfPassing}
                      onChange={(e) => updateProfile("yearOfPassing", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Percentage/CGPA">
                    <input
                      className="form-control"
                      value={form.profile.percentageCgpa}
                      onChange={(e) => updateProfile("percentageCgpa", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Medium of Instruction">
                    <input
                      className="form-control"
                      value={form.profile.mediumOfInstruction}
                      onChange={(e) => updateProfile("mediumOfInstruction", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="6. Course Details" id="section-course">
              <div className="row">
                <div className="col-md-4">
                  <Field label="Course">
                    <input
                      className="form-control"
                      value={form.profile.course}
                      onChange={(e) => updateProfile("course", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Batch">
                    <input
                      className="form-control"
                      value={form.profile.batch}
                      onChange={(e) => updateProfile("batch", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Branch/Campus">
                    <input
                      className="form-control"
                      value={form.profile.branchCampus}
                      onChange={(e) => updateProfile("branchCampus", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Section">
                    <input
                      className="form-control"
                      value={form.profile.section}
                      onChange={(e) => updateProfile("section", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Admission Date">
                    <input
                      type="date"
                      className="form-control"
                      value={form.profile.admissionDate}
                      onChange={(e) => updateProfile("admissionDate", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Mode of Learning">
                    <select
                      className="form-select"
                      value={form.profile.modeOfLearning}
                      onChange={(e) => updateProfile("modeOfLearning", e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Duration">
                    <input
                      className="form-control"
                      value={form.profile.duration}
                      onChange={(e) => updateProfile("duration", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Expected Completion Date">
                    <input
                      type="date"
                      className="form-control"
                      value={form.profile.expectedCompletionDate}
                      onChange={(e) => updateProfile("expectedCompletionDate", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="7. Identity Documents" id="section-documents">
              <div className="row">
                {DOCUMENT_FIELDS.filter((item) => item.key !== "profilePhoto").map((item) =>
                  renderFileField(
                    item.key,
                    item.label,
                    item.label.toLowerCase().includes("optional")
                  )
                )}
              </div>
            </Section>

            <Section title="8. Emergency Contact" id="section-emergency">
              <div className="row">
                <div className="col-md-6">
                  <Field label="Emergency Contact Name">
                    <input
                      className="form-control"
                      value={form.profile.emergencyContactName}
                      onChange={(e) => updateProfile("emergencyContactName", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Relationship">
                    <input
                      className="form-control"
                      value={form.profile.emergencyContactRelationship}
                      onChange={(e) => updateProfile("emergencyContactRelationship", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Mobile Number">
                    <input
                      className="form-control"
                      value={form.profile.emergencyContactMobile}
                      onChange={(e) => updateProfile("emergencyContactMobile", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Alternate Number">
                    <input
                      className="form-control"
                      value={form.profile.emergencyContactAlternate}
                      onChange={(e) => updateProfile("emergencyContactAlternate", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="9. Login Credentials" id="section-login">
              <div className="row">
                <div className="col-md-4">
                  <Field label="Username">
                    <input
                      className="form-control"
                      value={form.profile.username}
                      onChange={(e) => updateProfile("username", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Email" required>
                    <input
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                      required
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label={`Password${editing ? " (leave blank to keep)" : ""}`} required={!editing}>
                    <input
                      type="password"
                      className="form-control"
                      value={form.password}
                      onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                      required={!editing}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Confirm Password" required={!editing}>
                    <input
                      type="password"
                      className="form-control"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm((current) => ({ ...current, confirmPassword: e.target.value }))
                      }
                      required={!editing}
                    />
                  </Field>
                </div>
                {editing && (
                  <div className="col-md-4 d-flex align-items-end">
                    <div className="form-check mb-3">
                      <input
                        id="student-login-active"
                        type="checkbox"
                        className="form-check-input"
                        checked={form.isActive}
                        onChange={(e) =>
                          setForm((current) => ({ ...current, isActive: e.target.checked }))
                        }
                      />
                      <label className="form-check-label" htmlFor="student-login-active">
                        Login access enabled
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </Section>

            <Section title="10. Payment Information" id="section-payment">
              <div className="row">
                <div className="col-md-4">
                  <Field label="Registration Fee">
                    <input
                      className="form-control"
                      value={form.profile.registrationFee}
                      onChange={(e) => updateProfile("registrationFee", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Course Fee">
                    <input
                      className="form-control"
                      value={form.profile.courseFee}
                      onChange={(e) => updateProfile("courseFee", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Scholarship (if applicable)">
                    <input
                      className="form-control"
                      value={form.profile.scholarship}
                      onChange={(e) => updateProfile("scholarship", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Discount">
                    <input
                      className="form-control"
                      value={form.profile.discount}
                      onChange={(e) => updateProfile("discount", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Payment Method">
                    <input
                      className="form-control"
                      value={form.profile.paymentMethod}
                      onChange={(e) => updateProfile("paymentMethod", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Payment Status">
                    <input
                      className="form-control"
                      value={form.profile.paymentStatus}
                      onChange={(e) => updateProfile("paymentStatus", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Transaction ID">
                    <input
                      className="form-control"
                      value={form.profile.transactionId}
                      onChange={(e) => updateProfile("transactionId", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Receipt Number">
                    <input
                      className="form-control"
                      value={form.profile.receiptNumber}
                      onChange={(e) => updateProfile("receiptNumber", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="11. Medical Information (Optional)" id="section-medical">
              <div className="row">
                <div className="col-md-6">
                  <Field label="Medical Conditions">
                    <textarea
                      className="form-control"
                      rows={3}
                      value={form.profile.medicalConditions}
                      onChange={(e) => updateProfile("medicalConditions", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Allergies">
                    <textarea
                      className="form-control"
                      rows={3}
                      value={form.profile.allergies}
                      onChange={(e) => updateProfile("allergies", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Disabilities">
                    <textarea
                      className="form-control"
                      rows={3}
                      value={form.profile.disabilities}
                      onChange={(e) => updateProfile("disabilities", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Emergency Notes">
                    <textarea
                      className="form-control"
                      rows={3}
                      value={form.profile.emergencyNotes}
                      onChange={(e) => updateProfile("emergencyNotes", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="12. Skills & Preferences" id="section-skills">
              <div className="row">
                <div className="col-md-6">
                  <Field label="Languages Known">
                    <input
                      className="form-control"
                      value={form.profile.languagesKnown}
                      onChange={(e) => updateProfile("languagesKnown", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Computer Skills">
                    <input
                      className="form-control"
                      value={form.profile.computerSkills}
                      onChange={(e) => updateProfile("computerSkills", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Career Goal">
                    <input
                      className="form-control"
                      value={form.profile.careerGoal}
                      onChange={(e) => updateProfile("careerGoal", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Preferred Communication Language">
                    <input
                      className="form-control"
                      value={form.profile.preferredCommunicationLanguage}
                      onChange={(e) => updateProfile("preferredCommunicationLanguage", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="13. Declaration" id="section-declaration">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      id="terms-accepted"
                      type="checkbox"
                      className="form-check-input"
                      checked={form.profile.termsAccepted}
                      onChange={(e) => updateProfile("termsAccepted", e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="terms-accepted">
                      Terms & Conditions Acceptance
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      id="privacy-accepted"
                      type="checkbox"
                      className="form-check-input"
                      checked={form.profile.privacyAccepted}
                      onChange={(e) => updateProfile("privacyAccepted", e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="privacy-accepted">
                      Privacy Policy Acceptance
                    </label>
                  </div>
                </div>
                <div className="col-md-4">
                  <Field label="Student Signature">
                    <input
                      className="form-control"
                      value={form.profile.studentSignature}
                      onChange={(e) => updateProfile("studentSignature", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Parent Signature">
                    <input
                      className="form-control"
                      value={form.profile.parentSignature}
                      onChange={(e) => updateProfile("parentSignature", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Date">
                    <input
                      type="date"
                      className="form-control"
                      value={form.profile.declarationDate}
                      onChange={(e) => updateProfile("declarationDate", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </Section>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : editing ? "Save Changes" : "Add Student"}
          </button>
        </div>
      </div>
    </form>
  );
}
