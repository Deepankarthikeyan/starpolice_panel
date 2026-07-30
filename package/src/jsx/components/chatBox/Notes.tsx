import React, { FormEvent, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../../starPolice/api";
import { notify } from "../../starPolice/toast";
import type { Note } from "../../starPolice/types";

interface NotesProps {
  toggleTab: string;
  toggleChatBox: boolean;
  toggle?: string;
}

const Notes: React.FC<NotesProps> = ({ toggleTab, toggleChatBox }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { auth } = useContext(ThemeContext);

  const loadNotes = async () => {
    if (!auth?.token) return;
    const data = await api.getNotes();
    setNotes(data);
  };

  useEffect(() => {
    loadNotes().catch(console.error);
  }, [auth?.token]);

  const resetForm = () => {
    setContent("");
    setEditingId(null);
    setShowForm(false);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      if (editingId) {
        await api.updateNote(editingId, content.trim());
        notify.success("Note updated successfully.");
      } else {
        await api.createNote(content.trim());
        notify.success("Note created successfully.");
      }
      resetForm();
      await loadNotes();
    } catch (error) {
      notify.error(error, "Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (note: Note) => {
    setEditingId(note.id);
    setContent(note.content);
    setShowForm(true);
  };

  const onDelete = async (id: string) => {
    try {
      await api.deleteNote(id);
      await loadNotes();
      notify.success("Note deleted successfully.");
    } catch (error) {
      notify.error(error, "Failed to delete note");
    }
  };

  return (
    <div
      className={`tab-pane fade ${toggleTab === "notes" ? "active show" : ""}`}
      id="notes"
    >
      <div className="card mb-sm-3 mb-md-0 note_card">
        <div className="card-header chat-list-header text-center">
          <Link
            to="#"
            onClick={(event) => {
              event.preventDefault();
              setShowForm(true);
              setEditingId(null);
              setContent("");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              width="18px"
              height="18px"
              viewBox="0 0 24 24"
              version="1.1"
            >
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <rect fill="#000000" x="4" y="11" width="16" height="2" rx="1" />
                <rect
                  fill="#000000"
                  opacity="0.3"
                  transform="translate(12.000000, 12.000000) rotate(-270.000000) translate(-12.000000, -12.000000) "
                  x="4"
                  y="11"
                  width="16"
                  height="2"
                  rx="1"
                />
              </g>
            </svg>
          </Link>
          <div>
            <h6 className="mb-1">Notes</h6>
            <p className="mb-0">Add New Notes</p>
          </div>
          <Link to="#" onClick={(event) => event.preventDefault()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              width="18px"
              height="18px"
              viewBox="0 0 24 24"
              version="1.1"
            >
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <rect x="0" y="0" width="24" height="24" />
                <path
                  d="M14.2928932,16.7071068 C13.9023689,16.3165825 13.9023689,15.6834175 14.2928932,15.2928932 C14.6834175,14.9023689 15.3165825,14.9023689 15.7071068,15.2928932 L19.7071068,19.2928932 C20.0976311,19.6834175 20.0976311,20.3165825 19.7071068,20.7071068 C19.3165825,21.0976311 18.6834175,21.0976311 18.2928932,20.7071068 L14.2928932,16.7071068 Z"
                  fill="#000000"
                  fillRule="nonzero"
                  opacity="0.3"
                />
                <path
                  d="M11,16 C13.7614237,16 16,13.7614237 16,11 C16,8.23857625 13.7614237,6 11,6 C8.23857625,6 6,8.23857625 6,11 C6,13.7614237 8.23857625,16 11,16 Z M11,18 C7.13400675,18 4,14.8659932 4,11 C4,7.13400675 7.13400675,4 11,4 C14.8659932,4 18,7.13400675 18,11 C18,14.8659932 14.8659932,18 11,18 Z"
                  fill="#000000"
                  fillRule="nonzero"
                />
              </g>
            </svg>
          </Link>
        </div>

        {showForm && (
          <div className="card-body border-bottom p-3">
            <form onSubmit={onSubmit}>
              <textarea
                className="form-control mb-2"
                rows={3}
                placeholder="Write your note..."
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                  {editingId ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div
          className={`card-body contacts_body p-0 dlab-scroll ${
            toggleChatBox ? "ps ps--active-y" : ""
          }`}
          id="DZ_W_Contacts_Body2"
        >
          <ul className="contacts">
            {notes.length === 0 ? (
              <li className="p-3 text-muted text-center">No notes yet. Click + to add one.</li>
            ) : (
              notes.map((note) => (
                <li key={note.id} className={editingId === note.id ? "active" : ""}>
                  <div className="d-flex bd-highlight">
                    <div className="user_info">
                      <span>{note.content}</span>
                      <p>{new Date(note.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="ms-auto">
                      <Link
                        to="#"
                        className="btn btn-primary btn-xs sharp me-1"
                        onClick={(event) => {
                          event.preventDefault();
                          onEdit(note);
                        }}
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </Link>
                      <Link
                        to="#"
                        className="btn btn-danger btn-xs sharp"
                        onClick={(event) => {
                          event.preventDefault();
                          onDelete(note.id);
                        }}
                      >
                        <i className="fa fa-trash"></i>
                      </Link>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Notes;
