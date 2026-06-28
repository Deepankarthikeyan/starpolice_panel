import { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const CkEditorComponent = () => {
  const [editorData, setEditorData] = useState<string>("");

  const editorConfig = {
    toolbar: [
      "undo",
      "redo",
      "|",
      "heading",
      "|",
      "bold",
      "italic",
      "|",
      "link",
      "insertTable",
      "mediaEmbed",
      "|",
      "bulletedList",
      "numberedList",
      "indent",
      "outdent",
    ],
  };

  return (
    <div>
      <CKEditor
        editor={ClassicEditor}
        data={editorData}
        config={editorConfig}
        onChange={(_, editor) => {
          const data = editor.getData();
          setEditorData(data);
        }}
      />
    </div>
  );
};

export default CkEditorComponent;