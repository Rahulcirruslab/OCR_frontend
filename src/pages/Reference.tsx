import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { uploadReference, getReferenceList, getReferenceById } from "@/lib/api";
import { referenceUploadSchema } from "@/lib/validation";

interface Reference {
  reference_id: string;
  teacher_name: string;
  teacher_id: string;
  exam_name: string;
  subject: string;
  total_marks: number;
  uploaded_at: string;
}

const Reference = () => {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [references, setReferences] = useState<Reference[]>([]);
  const [formData, setFormData] = useState({
    teacher_name: "",
    teacher_id: "",
    exam_name: "",
    subject: "",
    total_marks: "",
  });
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  useEffect(() => {
    fetchReferences();
  }, []);

  // ERROR FIXED LOGIC: Always sets as array, fallback for non-array data
  const fetchReferences = async () => {
    try {
      const response = await getReferenceList();
      // response.data should be array per your API, but let's enforce:
      setReferences(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to fetch references";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setReferences([]); // always prevent .map error
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast({
        title: "Error",
        description: "Please upload a file",
        variant: "destructive",
      });
      return;
    }

    // Validate form data
    const validation = referenceUploadSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    try {
      await uploadReference(data);

      toast({
        title: "Success!",
        description: "Reference answer key uploaded successfully.",
      });

      setFile(null);
      setFormData({
        teacher_name: "",
        teacher_id: "",
        exam_name: "",
        subject: "",
        total_marks: "",
      });

      fetchReferences();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to upload reference";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReferenceClick = async (referenceId: string) => {
    try {
      const details = await getReferenceById(referenceId);
      toast({
        title: "Reference Details",
        description: `Loaded details for ${details.exam_name}`,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to fetch reference details";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-2 gradient-text">Reference Answer Keys</h1>
          <p className="text-muted-foreground mb-12">
            Manage teacher reference materials for grading
          </p>
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <Card className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-6">Upload New Reference</h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`rounded-xl p-8 border-2 border-dashed cursor-pointer transition-all hover:scale-[1.01] ${
                    isDragActive ? "border-primary bg-primary/5" : "border-border/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="text-center">
                    {file ? (
                      <div className="space-y-2">
                        <File className="h-12 w-12 text-primary mx-auto" />
                        <p className="font-medium text-sm">{file.name}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-primary mx-auto mb-2" />
                        <p className="text-sm font-medium">
                          {isDragActive ? "Drop file here" : "Click or drag answer key"}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="teacher-name">Teacher Name</Label>
                  <Input
                    id="teacher-name"
                    value={formData.teacher_name}
                    onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="teacher-id">Teacher ID</Label>
                  <Input
                    id="teacher-id"
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ref-exam">Exam Name</Label>
                  <Input
                    id="ref-exam"
                    value={formData.exam_name}
                    onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ref-subject">Subject</Label>
                  <Input
                    id="ref-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ref-marks">Total Marks</Label>
                  <Input
                    id="ref-marks"
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-primary"
                  disabled={uploading || !file}
                >
                  {uploading ? "Uploading..." : "Upload Reference"}
                </Button>
              </form>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">Existing References</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : references.length === 0 ? (
                <Card className="glass-card p-8 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No references uploaded yet</p>
                </Card>
              ) : (
                references.map((ref, idx) => (
                  <motion.div
                    key={ref.reference_id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ x: 4 }}
                  >
                    <Card
                      className="glass-card p-6 cursor-pointer"
                      onClick={() => handleReferenceClick(ref.reference_id)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold mb-1 truncate">{ref.exam_name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            By {ref.teacher_name}
                          </p>
                          <div className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground">
                            <span>{ref.subject}</span>
                            <span>•</span>
                            <span>{ref.total_marks} marks</span>
                            <span>•</span>
                            <span>{new Date(ref.uploaded_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reference;
