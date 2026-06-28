import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import { IMAGES } from "../Dashboard/Content";

const AddNewStudent = () => {
  const [file, setFile] = useState<null | File>(null);
  const fileHandler = (e: FormEvent) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      setFile(input.files[0]);
    }
  };

  const RemoveFile = () => {
    setFile(null);
  };

  const [startDate, setStartDate] = useState<Date | null>(new Date());

  const onChange = (date: Date | null) => {
    setStartDate(date);
  };
  return (
    <>
      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Student Details</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-3 col-lg-4">
                  <label className="form-label text-primary">
                    Photo<span className="required">*</span>
                  </label>
                  <div className="avatar-upload">
                    <div className="avatar-preview">
                      <div
                        id="imagePreview"
                        style={{
                          backgroundImage: file
                            ? "url(" + URL.createObjectURL(file) + ")"
                            : "url(" + IMAGES.noimage + ")",
                        }}
                      ></div>
                    </div>
                    <div className="change-btn mt-2 mb-lg-0 mb-3">
                      <input
                        type="file"
                        className="form-control d-none"
                        onChange={fileHandler}
                        id="imageUpload"
                        accept=".png, .jpg, .jpeg"
                      />
                      <label
                        htmlFor="imageUpload"
                        className="dlab-upload mb-0 btn btn-primary btn-sm"
                      >
                        Choose File
                      </label>
                      <Link
                        to={"#"}
                        className="btn btn-danger light remove-img ms-2 btn-sm"
                        onClick={RemoveFile}
                      >
                        Remove
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-xl-9 col-lg-8">
                  <div className="row">
                    <div className="col-xl-6 col-sm-6">
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label text-primary"
                        >
                          First Name<span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="exampleFormControlInput1"
                          placeholder="James"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-primary">
                          Date & Place of Birth
                          <span className="required">*</span>
                        </label>
                        <div className="d-flex">
                          <DatePicker
                            className="form-control"
                            selected={startDate}
                            onChange={onChange}
                          />
                          <input
                            type="text"
                            className="form-control w-50 ms-3"
                            id="exampleFormControlInput7"
                            placeholder="USA"
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlInput3"
                          className="form-label text-primary"
                        >
                          Email<span className="required">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="exampleFormControlInput3"
                          placeholder="hello@example.com"
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlTextarea1"
                          className="form-label text-primary"
                        >
                          Address<span className="required">*</span>
                        </label>
                        <textarea
                          className="form-control"
                          id="exampleFormControlTextarea1"
                          rows={6}
                        />
                      </div>
                    </div>
                    <div className="col-xl-6 col-sm-6">
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlInput4"
                          className="form-label text-primary"
                        >
                          Last Name<span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="exampleFormControlInput4"
                          placeholder="Wally"
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlInput5"
                          className="form-label text-primary"
                        >
                          Parent Name<span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="exampleFormControlInput5"
                          placeholder="Mana William"
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlInput6"
                          className="form-label text-primary"
                        >
                          Phone Number<span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="exampleFormControlInput6"
                          placeholder="+123456789"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-12">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Parents Details</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-xl-6 col-sm-6">
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlInput8"
                    className="form-label text-primary"
                  >
                    First Name<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleFormControlInput8"
                    placeholder="Mana"
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlInput9"
                    className="form-label text-primary"
                  >
                    Email<span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="exampleFormControlInput9"
                    placeholder="hello@example.com"
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlTextarea2"
                    className="form-label text-primary"
                  >
                    Address<span className="required">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="exampleFormControlTextarea2"
                    rows={6}
                  />
                </div>
              </div>
              <div className="col-xl-6 col-sm-6">
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlInput10"
                    className="form-label text-primary"
                  >
                    Last Name<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleFormControlInput10"
                    placeholder="Wick"
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlInput11"
                    className="form-label text-primary"
                  >
                    Phone Number<span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="exampleFormControlInput11"
                    placeholder="+123456789"
                  />
                </div>
                <label className="form-label text-primary">
                  Payments<span className="required">*</span>
                </label>
                <div className="d-flex align-items-center">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value=""
                      id="flexCheckDefault"
                    />
                    <label
                      className="form-check-label font-w500"
                      htmlFor="flexCheckDefault"
                    >
                      Cash
                    </label>
                  </div>
                  <div className="form-check ms-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value=""
                      id="flexCheckDefault1"
                    />
                    <label
                      className="form-check-label font-w500"
                      htmlFor="flexCheckDefault1"
                    >
                      Online
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="">
              <button className="btn btn-outline-primary me-3">
                Save as Draft
              </button>
              <button className="btn btn-primary" type="button">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewStudent;
