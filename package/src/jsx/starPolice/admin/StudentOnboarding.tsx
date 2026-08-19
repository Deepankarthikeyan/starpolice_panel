import { FormEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { hasPermission } from "../permissions";
import { getPanelMotherMenu } from "../panelLabels";
import { FileUploadProgressOverlay } from "../shared/FileUploadProgress";
import { notify } from "../toast";
import { PasswordInput } from "../shared/PasswordInput";
import {
  emptyStudentOnboardingForm,
  type StudentOnboardingFormState,
  type StudentOnboardingRecord,
} from "./studentOnboardingDefaults";
import { PasswordInput } from "../shared/PasswordInput";

type FileFieldKey =
  | "profilePhoto"
  | "aadhaarCard"
  | "panCard"
  | "passport"
  | "drivingLicence"
  | "communityCertificate"
  | "transferCertificate"
  | "migrationCertificate"
  | "birthCertificate"
  | "studentSignature"
  | "parentSignature";

const FILE_FIELDS: { key: FileFieldKey; label: string; urlKey: keyof StudentOnboardingFormState }[] = [
  { key: "profilePhoto", label: "Profile Photo", urlKey: "profilePhotoUrl" },
  { key: "aadhaarCard", label: "Aadhaar Card", urlKey: "aadhaarCardUrl" },
  { key: "panCard", label: "PAN Card", urlKey: "panCardUrl" },
  { key: "passport", label: "Passport", urlKey: "passportUrl" },
  { key: "drivingLicence", label: "Driving Licence", urlKey: "drivingLicenceUrl" },
  { key: "communityCertificate", label: "Community Certificate", urlKey: "communityCertificateUrl" },
  { key: "transferCertificate", label: "Transfer Certificate (TC)", urlKey: "transferCertificateUrl" },
  { key: "migrationCertificate", label: "Migration Certificate", urlKey: "migrationCertificateUrl" },
  { key: "birthCertificate", label: "Birth Certificate", urlKey: "birthCertificateUrl" },
  { key: "studentSignature", label: "Student Signature", urlKey: "studentSignatureUrl" },
  { key: "parentSignature", label: "Parent Signature", urlKey: "parentSignatureUrl" },
];

function Field({
  label,
  children,
  optional,
}: {
  label: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="mb-3">
      <label className="form-label">
        {label}
        {optional && <span className="text-muted"> (Optional)</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      className="form-control"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
    />
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card mb-3">
      <div className="card-header">
        <h5 className="card-title mb-0">{title}</h5>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function formatResidenceType(value: string) {
  if (value === "Day Scholar" || value === "Hostel") return value;
  return "—";
}

function recordToForm(record: StudentOnboardingRecord): StudentOnboardingFormState {
  return {
    ...emptyStudentOnboardingForm(),
    ...record,
    loginEmail: record.loginEmail || record.email || "",
    password: "",
    confirmPassword: "",
    grantLogin: Boolean(record.loginActive ?? record.userId),
  };
}

function fullName(record: StudentOnboardingRecord) {
  return [record.firstName, record.middleName, record.lastName].filter(Boolean).join(" ");
}

const StudentOnboarding = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const { auth } = useContext(ThemeContext);
  const [records, setRecords] = useState<StudentOnboardingRecord[]>([]);
  const [form, setForm] = useState<StudentOnboardingFormState>(emptyStudentOnboardingForm());
  const [files, setFiles] = useState<Partial<Record<FileFieldKey, File>>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const canManage = hasPermission(auth, "admin:onboarding");

  const loadRecords = async () => {
    const data = await api.getStudentOnboardingRecords();
    setRecords(data);
  };

  useEffect(() => {
    if (!canManage) return;
    loadRecords().catch(console.error);
  }, [canManage]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;
    return records.filter((record) => {
      const fullName = `${record.firstName} ${record.middleName} ${record.lastName}`.toLowerCase();
      return (
        record.studentId.toLowerCase().includes(query) ||
        fullName.includes(query) ||
        record.email.toLowerCase().includes(query) ||
        record.loginEmail.toLowerCase().includes(query) ||
        record.course.toLowerCase().includes(query) ||
        record.batch.toLowerCase().includes(query) ||
        (record.residenceType || "").toLowerCase().includes(query)
      );
    });
  }, [records, search]);

  const setField = <K extends keyof StudentOnboardingFormState>(key: K, value: StudentOnboardingFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyStudentOnboardingForm());
    setFiles({});
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const startCreate = () => {
    setForm(emptyStudentOnboardingForm());
    setFiles({});
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const startEdit = (record: StudentOnboardingRecord) => {
    setForm(recordToForm(record));
    setFiles({});
    setEditingId(record.id);
    setShowForm(true);
    setError("");
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.residenceType) {
      const message = "Please select Day Scholar or Hostel in course details.";
      setError(message);
      notify.error(message);
      return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      const message = "Password and confirm password must match.";
      setError(message);
      notify.error(message);
      return;
    }

    const loginEmail = form.loginEmail.trim() || form.email.trim();
    if (form.grantLogin) {
      if (!loginEmail) {
        const message = "Login email is required when granting student panel access.";
        setError(message);
        notify.error(message);
        return;
      }
      if (!editingId && !form.password) {
        const message = "Password is required when granting student panel access.";
        setError(message);
        notify.error(message);
        return;
      }
    }

    const payload: StudentOnboardingFormState = {
      ...form,
      loginEmail,
    };

    const selectedFiles = Object.values(files).filter((file): file is File => Boolean(file));
    setLoading(true);
    setUploadProgress(selectedFiles.length ? 1 : 0);
    setError("");
    try {
      const onProgress = selectedFiles.length ? (percent: number) => setUploadProgress(percent) : undefined;
      if (editingId) {
        await api.updateStudentOnboarding(editingId, payload, files, onProgress);
        notify.success("Student onboarding record updated.");
      } else {
        await api.createStudentOnboarding(payload, files, onProgress);
        notify.success("Student onboarding record created.");
      }
      setUploadProgress(100);
      await loadRecords();
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save student onboarding record.";
      setError(message);
      notify.error(err, "Failed to save student onboarding record.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const onDelete = async (record: StudentOnboardingRecord) => {
    const name = fullName(record);
    if (!window.confirm(`Delete onboarding record for ${name} (${record.studentId})?`)) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.deleteStudentOnboarding(record.id);
      await loadRecords();
      if (editingId === record.id) {
        resetForm();
      }
      notify.success("Student onboarding record deleted.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete record.";
      setError(message);
      notify.error(err, "Failed to delete record.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderFileInput = (field: (typeof FILE_FIELDS)[number]) => (
    <Field key={field.key} label={field.label} optional={field.key !== "profilePhoto"}>
      <input
        type="file"
        className="form-control"
        accept="image/*,.pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setFiles((prev) => ({ ...prev, [field.key]: file }));
        }}
      />
      {form[field.urlKey] && (
        <small className="text-muted d-block mt-1">Current file uploaded</small>
      )}
    </Field>
  );

  if (!canManage) {
    return (
      <>
        <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Student Onboarding" pageContent="" />
        <div className="alert alert-warning">You do not have permission to manage student onboarding.</div>
      </>
    );
  }

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Student Onboarding" pageContent="" />

      {error && <div className="alert alert-danger">{error}</div>}

      {!showForm ? (
        <div className="card spa-onboarding-records-card" ref={printRef}>
          <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2 spa-no-print">
            <h4 className="card-title mb-0">Student Onboarding Records</h4>
            <div className="d-flex flex-wrap gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={handlePrint}>
                <i className="fa fa-print me-2" />
                Print
              </button>
              <button type="button" className="btn btn-primary" onClick={startCreate}>
                <i className="fa fa-plus me-2" />
                Add Student
              </button>
            </div>
          </div>
          <div className="card-body spa-onboarding-records-body">
            <div className="spa-print-only mb-3">
              <h3 className="mb-1">Star Police Academy</h3>
              <h4 className="mb-1">Student Onboarding Records</h4>
              <p className="text-muted mb-0">
                Printed on {new Date().toLocaleString()} • {filteredRecords.length} record
                {filteredRecords.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="spa-onboarding-search spa-no-print">
              <input
                type="search"
                className="form-control"
                placeholder="Search by ID, name, email, course, or batch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="table-responsive spa-onboarding-table-wrap">
              <table className="table table-striped table-hover align-middle mb-0 spa-onboarding-table">
                <thead>
                  <tr>
                    <th scope="col">Student ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Course</th>
                    <th scope="col">Batch</th>
                    <th scope="col">Day Scholar / Hostel</th>
                    <th scope="col">Email</th>
                    <th scope="col" className="spa-onboarding-actions-col spa-no-print">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="spa-onboarding-empty">
                        No student onboarding records yet.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="spa-onboarding-id">{record.studentId}</td>
                        <td className="spa-onboarding-name">{fullName(record)}</td>
                        <td>{record.course || "—"}</td>
                        <td>{record.batch || "—"}</td>
                        <td>{formatResidenceType(record.residenceType)}</td>
                        <td className="spa-onboarding-email">{record.loginEmail || record.email || "—"}</td>
                        <td className="spa-onboarding-actions-col spa-no-print">
                          <div className="spa-onboarding-actions">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => startEdit(record)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => onDelete(record)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h4 className="mb-0">{editingId ? "Edit Student Onboarding" : "New Student Onboarding"}</h4>
            <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
              Back to List
            </button>
          </div>

          <SectionCard title="1. Personal Information">
            <div className="row">
              <div className="col-md-4">
                <Field label="Student ID (Auto-generated)">
                  <input
                    className="form-control"
                    value={editingId ? form.studentId : "Auto-generated on save"}
                    disabled
                  />
                </Field>
              </div>
              <div className="col-md-4">
                <Field label="First Name">
                  <TextInput value={form.firstName} onChange={(v) => setField("firstName", v)} required />
                </Field>
              </div>
              <div className="col-md-4">
                <Field label="Middle Name" optional>
                  <TextInput value={form.middleName} onChange={(v) => setField("middleName", v)} />
                </Field>
              </div>
              <div className="col-md-4">
                <Field label="Last Name">
                  <TextInput value={form.lastName} onChange={(v) => setField("lastName", v)} required />
                </Field>
              </div>
              <div className="col-md-4">
                <Field label="Date of Birth">
                  <TextInput type="date" value={form.dateOfBirth} onChange={(v) => setField("dateOfBirth", v)} />
                </Field>
              </div>
              <div className="col-md-4">
                <Field label="Gender">
                  <select className="form-select" value={form.gender} onChange={(e) => setField("gender", e.target.value)}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
              </div>
              <div className="col-md-4">
                <Field label="Blood Group" optional>
                  <TextInput value={form.bloodGroup} onChange={(v) => setField("bloodGroup", v)} />
                </Field>
              </div>
              <div className="col-md-4">
                <Field label="Nationality">
                  <TextInput value={form.nationality} onChange={(v) => setField("nationality", v)} />
                </Field>
              </div>
              <div className="col-md-4">
                <Field label="Aadhaar/Passport Number" optional>
                  <TextInput value={form.aadhaarOrPassport} onChange={(v) => setField("aadhaarOrPassport", v)} />
                </Field>
              </div>
              <div className="col-md-4">{renderFileInput(FILE_FIELDS[0])}</div>
            </div>
          </SectionCard>

          <SectionCard title="2. Contact Information">
            <div className="row">
              <div className="col-md-4"><Field label="Mobile Number"><TextInput value={form.mobileNumber} onChange={(v) => setField("mobileNumber", v)} /></Field></div>
              <div className="col-md-4"><Field label="Alternate Mobile Number"><TextInput value={form.alternateMobileNumber} onChange={(v) => setField("alternateMobileNumber", v)} /></Field></div>
              <div className="col-md-4"><Field label="Email Address"><TextInput type="email" value={form.email} onChange={(v) => setField("email", v)} /></Field></div>
              <div className="col-md-4"><Field label="Parent/Guardian Mobile Number"><TextInput value={form.parentMobileNumber} onChange={(v) => setField("parentMobileNumber", v)} /></Field></div>
              <div className="col-md-4"><Field label="Parent/Guardian Email"><TextInput type="email" value={form.parentEmail} onChange={(v) => setField("parentEmail", v)} /></Field></div>
            </div>
          </SectionCard>

          <SectionCard title="3. Address">
            <div className="row">
              <div className="col-md-6"><Field label="Address Line 1"><TextInput value={form.addressLine1} onChange={(v) => setField("addressLine1", v)} /></Field></div>
              <div className="col-md-6"><Field label="Address Line 2"><TextInput value={form.addressLine2} onChange={(v) => setField("addressLine2", v)} /></Field></div>
              <div className="col-md-3"><Field label="City"><TextInput value={form.city} onChange={(v) => setField("city", v)} /></Field></div>
              <div className="col-md-3"><Field label="District"><TextInput value={form.district} onChange={(v) => setField("district", v)} /></Field></div>
              <div className="col-md-3"><Field label="State"><TextInput value={form.state} onChange={(v) => setField("state", v)} /></Field></div>
              <div className="col-md-3"><Field label="Country"><TextInput value={form.country} onChange={(v) => setField("country", v)} /></Field></div>
              <div className="col-md-3"><Field label="PIN/ZIP Code"><TextInput value={form.pinCode} onChange={(v) => setField("pinCode", v)} /></Field></div>
            </div>
          </SectionCard>

          <SectionCard title="4. Parent/Guardian Details">
            <div className="row">
              <div className="col-md-4"><Field label="Father/Guardian Name"><TextInput value={form.fatherName} onChange={(v) => setField("fatherName", v)} /></Field></div>
              <div className="col-md-4"><Field label="Father Occupation"><TextInput value={form.fatherOccupation} onChange={(v) => setField("fatherOccupation", v)} /></Field></div>
              <div className="col-md-4"><Field label="Mother/Guardian Name"><TextInput value={form.motherName} onChange={(v) => setField("motherName", v)} /></Field></div>
              <div className="col-md-4"><Field label="Mother Occupation"><TextInput value={form.motherOccupation} onChange={(v) => setField("motherOccupation", v)} /></Field></div>
              <div className="col-md-4"><Field label="Guardian Name (if applicable)"><TextInput value={form.guardianName} onChange={(v) => setField("guardianName", v)} /></Field></div>
              <div className="col-md-4"><Field label="Relationship"><TextInput value={form.guardianRelationship} onChange={(v) => setField("guardianRelationship", v)} /></Field></div>
              <div className="col-md-4"><Field label="Annual Family Income" optional><TextInput value={form.annualFamilyIncome} onChange={(v) => setField("annualFamilyIncome", v)} /></Field></div>
            </div>
          </SectionCard>

          <SectionCard title="5. Academic Information">
            <div className="row">
              <div className="col-md-4"><Field label="School/College Name"><TextInput value={form.schoolName} onChange={(v) => setField("schoolName", v)} /></Field></div>
              <div className="col-md-4"><Field label="Previous Qualification"><TextInput value={form.previousQualification} onChange={(v) => setField("previousQualification", v)} /></Field></div>
              <div className="col-md-4"><Field label="Board/University"><TextInput value={form.boardUniversity} onChange={(v) => setField("boardUniversity", v)} /></Field></div>
              <div className="col-md-4"><Field label="Year of Passing"><TextInput value={form.yearOfPassing} onChange={(v) => setField("yearOfPassing", v)} /></Field></div>
              <div className="col-md-4"><Field label="Percentage/CGPA"><TextInput value={form.percentageCgpa} onChange={(v) => setField("percentageCgpa", v)} /></Field></div>
              <div className="col-md-4"><Field label="Medium of Instruction"><TextInput value={form.mediumOfInstruction} onChange={(v) => setField("mediumOfInstruction", v)} /></Field></div>
            </div>
          </SectionCard>

          <SectionCard title="6. Course Details">
            <div className="row">
              <div className="col-md-4"><Field label="Course"><TextInput value={form.course} onChange={(v) => setField("course", v)} /></Field></div>
              <div className="col-md-4"><Field label="Batch"><TextInput value={form.batch} onChange={(v) => setField("batch", v)} /></Field></div>
              <div className="col-md-4"><Field label="Branch/Campus"><TextInput value={form.branchCampus} onChange={(v) => setField("branchCampus", v)} /></Field></div>
              <div className="col-md-4"><Field label="Section"><TextInput value={form.section} onChange={(v) => setField("section", v)} /></Field></div>
              <div className="col-md-4"><Field label="Admission Date"><TextInput type="date" value={form.admissionDate} onChange={(v) => setField("admissionDate", v)} /></Field></div>
              <div className="col-md-4">
                <Field label="Day Scholar / Hostel">
                  <select
                    className="form-select"
                    value={form.residenceType}
                    onChange={(e) => setField("residenceType", e.target.value as StudentOnboardingFormState["residenceType"])}
                    required
                  >
                    <option value="">Select</option>
                    <option value="Day Scholar">Day Scholar</option>
                    <option value="Hostel">Hostel</option>
                  </select>
                </Field>
              </div>
              <div className="col-md-4">
                <Field label="Mode of Learning">
                  <select className="form-select" value={form.modeOfLearning} onChange={(e) => setField("modeOfLearning", e.target.value)}>
                    <option value="">Select</option>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </Field>
              </div>
              <div className="col-md-4"><Field label="Duration"><TextInput value={form.duration} onChange={(v) => setField("duration", v)} /></Field></div>
              <div className="col-md-4"><Field label="Expected Completion Date"><TextInput type="date" value={form.expectedCompletionDate} onChange={(v) => setField("expectedCompletionDate", v)} /></Field></div>
            </div>
          </SectionCard>

          <SectionCard title="7. Identity Documents">
            <div className="row">
              {FILE_FIELDS.slice(1, 9).map((field) => (
                <div className="col-md-6" key={field.key}>{renderFileInput(field)}</div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="8. Emergency Contact">
            <div className="row">
              <div className="col-md-3"><Field label="Emergency Contact Name"><TextInput value={form.emergencyContactName} onChange={(v) => setField("emergencyContactName", v)} /></Field></div>
              <div className="col-md-3"><Field label="Relationship"><TextInput value={form.emergencyRelationship} onChange={(v) => setField("emergencyRelationship", v)} /></Field></div>
              <div className="col-md-3"><Field label="Mobile Number"><TextInput value={form.emergencyMobile} onChange={(v) => setField("emergencyMobile", v)} /></Field></div>
              <div className="col-md-3"><Field label="Alternate Number"><TextInput value={form.emergencyAlternateNumber} onChange={(v) => setField("emergencyAlternateNumber", v)} /></Field></div>
            </div>
          </SectionCard>

          <SectionCard title="9. Login Credentials">
            <p className="text-muted small mb-3">
              These credentials create the student panel login. Students sign in with the login email
              (or username) and password from the student login page.
            </p>
            <div className="row">
              <div className="col-md-4"><Field label="Username"><TextInput value={form.username} onChange={(v) => setField("username", v)} placeholder="Optional login username" /></Field></div>
              <div className="col-md-4"><Field label="Login Email"><TextInput type="email" value={form.loginEmail} onChange={(v) => setField("loginEmail", v)} placeholder="Used for student panel sign in" /></Field></div>
              <div className="col-md-4"><Field label="Password"><PasswordInput value={form.password} onChange={(v) => setField("password", v)} placeholder={editingId ? "Leave blank to keep current" : "Required for panel access"} autoComplete="new-password" /></Field></div>
              <div className="col-md-4"><Field label="Confirm Password"><PasswordInput value={form.confirmPassword} onChange={(v) => setField("confirmPassword", v)} autoComplete="new-password" /></Field></div>
              <div className="col-md-4 d-flex align-items-end">
                <label className="form-check mb-3">
                  <input type="checkbox" className="form-check-input" checked={form.grantLogin} onChange={(e) => setField("grantLogin", e.target.checked)} />
                  <span className="form-check-label ms-2">Grant student panel login access</span>
                </label>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="10. Payment Information">
            <div className="row">
              <div className="col-md-3"><Field label="Registration Fee"><TextInput value={form.registrationFee} onChange={(v) => setField("registrationFee", v)} /></Field></div>
              <div className="col-md-3"><Field label="Course Fee"><TextInput value={form.courseFee} onChange={(v) => setField("courseFee", v)} /></Field></div>
              <div className="col-md-3"><Field label="Scholarship" optional><TextInput value={form.scholarship} onChange={(v) => setField("scholarship", v)} /></Field></div>
              <div className="col-md-3"><Field label="Discount"><TextInput value={form.discount} onChange={(v) => setField("discount", v)} /></Field></div>
              <div className="col-md-3"><Field label="Payment Method"><TextInput value={form.paymentMethod} onChange={(v) => setField("paymentMethod", v)} /></Field></div>
              <div className="col-md-3">
                <Field label="Payment Status">
                  <select className="form-select" value={form.paymentStatus} onChange={(e) => setField("paymentStatus", e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                  </select>
                </Field>
              </div>
              <div className="col-md-3"><Field label="Transaction ID"><TextInput value={form.transactionId} onChange={(v) => setField("transactionId", v)} /></Field></div>
              <div className="col-md-3"><Field label="Receipt Number"><TextInput value={form.receiptNumber} onChange={(v) => setField("receiptNumber", v)} /></Field></div>
            </div>
          </SectionCard>

          <SectionCard title="11. Medical Information (Optional)">
            <div className="row">
              <div className="col-md-6"><Field label="Medical Conditions" optional><textarea className="form-control" rows={2} value={form.medicalConditions} onChange={(e) => setField("medicalConditions", e.target.value)} /></Field></div>
              <div className="col-md-6"><Field label="Allergies" optional><textarea className="form-control" rows={2} value={form.allergies} onChange={(e) => setField("allergies", e.target.value)} /></Field></div>
              <div className="col-md-6"><Field label="Disabilities" optional><textarea className="form-control" rows={2} value={form.disabilities} onChange={(e) => setField("disabilities", e.target.value)} /></Field></div>
              <div className="col-md-6"><Field label="Emergency Notes" optional><textarea className="form-control" rows={2} value={form.emergencyNotes} onChange={(e) => setField("emergencyNotes", e.target.value)} /></Field></div>
            </div>
          </SectionCard>

          <SectionCard title="12. Skills & Preferences">
            <div className="row">
              <div className="col-md-6"><Field label="Languages Known"><TextInput value={form.languagesKnown} onChange={(v) => setField("languagesKnown", v)} /></Field></div>
              <div className="col-md-6"><Field label="Computer Skills"><TextInput value={form.computerSkills} onChange={(v) => setField("computerSkills", v)} /></Field></div>
              <div className="col-md-6"><Field label="Career Goal"><TextInput value={form.careerGoal} onChange={(v) => setField("careerGoal", v)} /></Field></div>
              <div className="col-md-6"><Field label="Preferred Communication Language"><TextInput value={form.preferredCommunicationLanguage} onChange={(v) => setField("preferredCommunicationLanguage", v)} /></Field></div>
            </div>
          </SectionCard>

          <SectionCard title="13. Declaration">
            <div className="row">
              <div className="col-md-6">
                <label className="form-check mb-3">
                  <input type="checkbox" className="form-check-input" checked={form.termsAccepted} onChange={(e) => setField("termsAccepted", e.target.checked)} />
                  <span className="form-check-label ms-2">Terms & Conditions Acceptance</span>
                </label>
                <label className="form-check mb-3">
                  <input type="checkbox" className="form-check-input" checked={form.privacyAccepted} onChange={(e) => setField("privacyAccepted", e.target.checked)} />
                  <span className="form-check-label ms-2">Privacy Policy Acceptance</span>
                </label>
              </div>
              <div className="col-md-3">{renderFileInput(FILE_FIELDS[9])}</div>
              <div className="col-md-3">{renderFileInput(FILE_FIELDS[10])}</div>
              <div className="col-md-4"><Field label="Date"><TextInput type="date" value={form.declarationDate} onChange={(v) => setField("declarationDate", v)} /></Field></div>
            </div>
          </SectionCard>

          <div className="d-flex gap-2 mb-4">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Student" : "Create Student"}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={resetForm} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {loading && Object.values(files).some(Boolean) && (
        <FileUploadProgressOverlay
          percent={uploadProgress}
          fileCount={Object.values(files).filter(Boolean).length}
          fileNames={Object.values(files)
            .filter((file): file is File => Boolean(file))
            .map((file) => file.name)}
        />
      )}
    </>
  );
};

export default StudentOnboarding;
