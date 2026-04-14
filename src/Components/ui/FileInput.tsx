import { useState } from "react";

interface FileInputProps {
  label: string;
  name: string;
  value?: File | string | null;
  onChange: (file: File | null) => void;
}

const FileInput = ({ label, name, value, onChange }: FileInputProps) => {
  const [isDragging, setIsDragging] = useState(false);

  // ✅ حساب الـ preview مباشرة بدون useEffect
  const preview = !value
    ? null
    : typeof value === "string"
    ? value
    : URL.createObjectURL(value);

  const handleFile = (file: File | null) => {
    if (!file) return;
    onChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="mb-4">
      <label className="block font-semibold mb-2">{label}</label>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
      >
        <input
          type="file"
          name={name}
          id={name}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />

        <label htmlFor={name} className="cursor-pointer">
          <p className="text-gray-600">
            Drag & drop image here, or click to upload
          </p>
        </label>

        {preview && (
          <div className="mt-4 flex justify-center">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileInput;