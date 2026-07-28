import { useRef } from "react";
import {
  StudentOnboardingPrintContent,
  printStudentOnboardingElement,
  type PrintPayload,
} from "./StudentOnboardingPrint";

type StudentOnboardingPrintModalProps = {
  data: PrintPayload;
  onClose: () => void;
};

export default function StudentOnboardingPrintModal({ data, onClose }: StudentOnboardingPrintModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    printStudentOnboardingElement(printRef.current);
  };

  return (
    <div className="modal fade show d-block spa-print-modal" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Print Preview — Student Onboarding</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
          </div>
          <div className="modal-body spa-print-modal-body">
            <div ref={printRef}>
              <StudentOnboardingPrintContent {...data} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={handlePrint}>
              <i className="fa fa-print me-1" />
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
