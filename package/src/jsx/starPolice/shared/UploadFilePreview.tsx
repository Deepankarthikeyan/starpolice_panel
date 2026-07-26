import { useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import { getAbsoluteFileUrl } from "../fileUrl";
import type { UploadedFile } from "../types";

function getPreviewKind(upload: UploadedFile) {
  const name = upload.name.toLowerCase();

  if (upload.category === "image") {
    return "image";
  }
  if (upload.category === "video") {
    return "video";
  }
  if (upload.category === "pdf" || name.endsWith(".pdf")) {
    return "pdf";
  }
  if (name.endsWith(".txt") || upload.mimeType?.startsWith("text/")) {
    return "text";
  }
  if (/\.(doc|docx|xls|xlsx|ppt|pptx)$/.test(name)) {
    return "office";
  }
  return "file";
}

function UploadPreviewContent({ upload }: { upload: UploadedFile }) {
  const fileUrl = useMemo(() => getAbsoluteFileUrl(upload.fileUrl), [upload.fileUrl]);
  const kind = getPreviewKind(upload);

  if (kind === "image") {
    return <img src={fileUrl} alt={upload.name} className="upload-preview-image" />;
  }

  if (kind === "video") {
    return <video src={fileUrl} controls className="upload-preview-video" />;
  }

  if (kind === "pdf" || kind === "text" || kind === "file") {
    return (
      <iframe
        src={fileUrl}
        title={upload.name}
        className="upload-preview-frame"
      />
    );
  }

  const officeUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`;
  return (
    <iframe
      src={officeUrl}
      title={upload.name}
      className="upload-preview-frame"
    />
  );
}

interface UploadPreviewButtonProps {
  upload: UploadedFile;
  className?: string;
}

export function UploadPreviewButton({
  upload,
  className = "btn btn-sm btn-outline-primary",
}: UploadPreviewButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
      >
        Preview
      </button>

      <Modal
        show={open}
        onHide={() => setOpen(false)}
        size="xl"
        centered
        className="upload-preview-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <div className="upload-preview-title">{upload.title || upload.name}</div>
            {upload.title && (
              <small className="text-muted d-block fw-normal">{upload.name}</small>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="upload-preview-body">
          <UploadPreviewContent upload={upload} />
        </Modal.Body>
      </Modal>
    </>
  );
}
