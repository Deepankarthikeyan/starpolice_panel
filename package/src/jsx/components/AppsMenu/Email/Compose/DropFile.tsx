import React, { Fragment } from "react";
import "react-dropzone-uploader/dist/styles.css";
// import Drop, { IFileWithMeta, StatusValue } from "react-dropzone-uploader";

const DropFile : React.FC = () => {

   // const handleChangeStatus = (
   //    { meta, file }: IFileWithMeta, 
   //    status: StatusValue
   //  ): void => {
   //    console.log(status, meta, file);
   //  };

   //  const handleSubmit = (files: IFileWithMeta[]): void => {
   //    console.log(files.map((f) => f.meta));
   //  };
   return (
   <Fragment>

      {/* // <Drop
      //    onChangeStatus={handleChangeStatus}
      //    onSubmit={handleSubmit}
      //    inputContent="Drop files here to upload"
      //    accept="image/*,audio/*,video/*"
      //    styles={{
      //       dropzone: {
      //          minHeight: 200,
      //          maxHeight: 250,
      //          width: "100%",
      //          backgroundColor: "#f2f4fa",
      //          border: "1px dashed #DDDFE1",
      //          overflow: "hidden",
      //       },
      //       inputLabel: {
      //          color: "#7e7e7e",
      //          fontSize: "16px",
      //          fontWeight: "normal",
      //          backgroundColor: "#f2f4fa",
      //       },
      //    }}
      // /> */}
   </Fragment>
   );
};

export default DropFile;