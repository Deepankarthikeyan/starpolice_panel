import { FormEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { FILE_CATEGORY_LABELS } from "../constants";
import { getPanelMotherMenu } from "../panelLabels";
import { hasPermission } from "../permissions";
import { FileUploadProgressOverlay } from "../shared/FileUploadProgress";
import { UploadPreviewButton } from "../shared/UploadFilePreview";
import { notify } from "../toast";
import type { QuestionPaper } from "../types";

const FILE_ACCEPT =
  ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,image/*,application/pdf,application/msword,application/vnd.*";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function toPreviewUpload(paper: QuestionPaper) {
  return {
    id: paper.id,
    date: paper.date,
    title: paper.paperName,
    name: paper.name,
    category: paper.category,
    fileUrl: paper.fileUrl,
    mimeType: paper.mimeType,
    uploadedAt: paper.uploadedAt,
    uploadedBy: paper.uploadedBy,
  };
}

const QuestionPapers = () => {
  const { auth } = useContext(ThemeContext);
  const canManage = hasPermission(auth, "admin:questions");
  const canView = canManage || hasPermission(auth, "student:questions");

  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [paperName, setPaperName] = useState("");
  const [date, setDate] = useState(todayKey());
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPapers = async () => {
    const data = await api.getQuestionPapers();
    setPapers(data);
  };

  useEffect(() => {
    if (!canView) return;
    loadPapers().catch(console.error);
  }, [canView]);

  const filteredPapers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return papers;
    return papers.filter((paper) => {
      const typeLabel = FILE_CATEGORY_LABELS[paper.category].toLowerCase();
      return (
        paper.paperName.toLowerCase().includes(query) ||
        paper.name.toLowerCase().includes(query) ||
        paper.date.includes(query) ||
        typeLabel.includes(query)
      );
    });
  }, [papers, search]);

  const resetForm = () => {
    setPaperName("");
    setDate(todayKey());
    setFile(null);
    setEditingId(null);
    setShowForm(false);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startCreate = () => {
    setPaperName("");
    setDate(todayKey());
    setFile(null);
    setEditingId(null);
    setShowForm(true);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startEdit = (paper: QuestionPaper) => {
    setPaperName(paper.paperName);
    setDate(paper.date);
    setFile(null);
    setEditingId(paper.id);
    setShowForm(true);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!paperName.trim()) {
      const message = "Question paper name is required.";
      setError(message);
      notify.error(message);
      return;
    }
    if (!date) {
      const message = "Date is required.";
      setError(message);
      notify.error(message);
      return;
    }
    if (!editingId && !file) {
      const message = "Please select a file to upload.";
      setError(message);
      notify.error(message);
      return;
    }

    setLoading(true);
    setUploadProgress(file ? 1 : 0);
    setError("");
    try {
      const onProgress = file ? (percent: number) => setUploadProgress(percent) : undefined;
      if (editingId) {
        await api.updateQuestionPaper(
          editingId,
          {
            paperName: paperName.trim(),
            date,
            file: file || undefined,
          },
          onProgress,
        );
        notify.success("Question paper updated successfully.");
      } else {
        await api.uploadQuestionPaper(paperName.trim(), date, file!, onProgress);
        notify.success("Question paper uploaded. Alert sent to all panels.");
      }
      setUploadProgress(100);
      await loadPapers();
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save question paper.";
      setError(message);
      notify.error(err, "Failed to save question paper.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const onDelete = async (paper: QuestionPaper) => {
    if (!window.confirm(`Delete question paper "${paper.paperName}"?`)) return;
    setLoading(true);
    setError("");
    try {
      await api.deleteQuestionPaper(paper.id);
      await loadPapers();
      if (editingId === paper.id) resetForm();
      notify.success("Question paper deleted.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete question paper.";
      setError(message);
      notify.error(err, "Failed to delete question paper.");
    } finally {
      setLoading(false);
    }
  };

  if (!canView) {
    return (
      <>
        <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Questions" pageContent="" />
        <div className="alert alert-warning">You do not have permission to view question papers.</div>
      </>
    );
  }

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Questions" pageContent="" />
      {error && <div className="alert alert-danger">{error}</div>}

      {!showForm ? (
        <div className="card">
          <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h4 className="card-title mb-0">Question Papers</h4>
            {canManage && (
              <button type="button" className="btn btn-primary" onClick={startCreate}>
                <i className="fa fa-plus me-2" />
                Upload Question Paper
              </button>
            )}
          </div>
          <div className="card-body">
            <div className="mb-3">
              <input
                type="search"
                className="form-control"
                placeholder="Search by paper name, file name, or date..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Paper Name</th>
                    <th>Date</th>
                    <th>File</th>
                    <th>Type</th>
                    <th>Uploaded At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPapers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-muted text-center">
                        No question papers yet.
                      </td>
                    </tr>
                  ) : (
                    filteredPapers.map((paper) => (
                      <tr key={paper.id}>
                        <td className="fw-semibold">{paper.paperName}</td>
                        <td>{paper.date}</td>
                        <td>{paper.name}</td>
                        <td>{FILE_CATEGORY_LABELS[paper.category]}</td>
                        <td>{new Date(paper.uploadedAt).toLocaleString()}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-2">
                            <UploadPreviewButton upload={toPreviewUpload(paper)} />
                            {canManage && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => startEdit(paper)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => onDelete(paper)}
                                  disabled={loading}
                                >
                                  Delete
                                </button>
                              </>
                            )}
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
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h4 className="card-title mb-0">
              {editingId ? "Edit Question Paper" : "Upload Question Paper"}
            </h4>
            <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
              Back to List
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="question-paper-name">
                  Question Paper Name
                </label>
                <input
                  id="question-paper-name"
                  type="text"
                  className="form-control"
                  value={paperName}
                  onChange={(e) => setPaperName(e.target.value)}
                  placeholder="e.g. Physical Test Paper - Batch A"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="question-paper-date">
                  Date
                </label>
                <input
                  id="question-paper-date"
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="question-paper-file">
                  Upload File {editingId && <span className="text-muted">(Optional — leave empty to keep current file)</span>}
                </label>
                <input
                  ref={fileInputRef}
                  id="question-paper-file"
                  type="file"
                  className="form-control"
                  accept={FILE_ACCEPT}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required={!editingId}
                />
                <small className="text-muted d-block mt-1">
                  Supported: PDF, Word, Excel, PowerPoint, images, and other documents.
                </small>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : editingId ? "Update" : "Upload"}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && file && (
        <FileUploadProgressOverlay
          percent={uploadProgress}
          fileCount={1}
          fileNames={[file.name]}
        />
      )}
    </>
  );
};

export default QuestionPapers;
