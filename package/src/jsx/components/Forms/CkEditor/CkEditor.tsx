import { Component, Suspense } from "react";

import CkEditorComponent from "./CkEditorBlog";

class CkEditor extends Component {
  render() {
    return (
      <>
        <div className="row">
          <div className="col-xl-12 col-xxl-12">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Form CkEditor</h4>
              </div>
              <div className="card-body custom-ekeditor">
                <Suspense fallback={"loading..."}>
                  <CkEditorComponent />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default CkEditor;
