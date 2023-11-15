import { InputGroupWrapper } from "./InputGroup";
import { useDropzone } from "react-dropzone";
import AddAvatarLogo from "public/assets/add-avatar.svg";
import Image from "next/image";
import { MouseEvent, useCallback } from "react";

interface AvatarImportProp {
  label: string;
  labelClassName?: string;
}

export const AvatarImport = ({ label, labelClassName }: AvatarImportProp) => {
  const onDrop = useCallback((acceptedFiles: any[]) => {
    acceptedFiles.forEach((file) => {
      console.log(file);
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result;
        console.log(binaryStr);
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    noDragEventsBubbling: true,
    onDrop,
    noClick: true,
  });

  const clickDropZoneCallBack = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <InputGroupWrapper label={label} className={labelClassName}>
      <section className="container">
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          <div
            className="clickzone mt-1 flex h-20 w-20 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm"
            onClick={(e) => clickDropZoneCallBack(e)}
          >
            <Image src={AddAvatarLogo} alt="Upload" />
            
          </div>
        </div>
        Upload
      </section>
    </InputGroupWrapper>
  );
};
