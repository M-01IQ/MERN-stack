import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext"; // تأكد من مسار السياق الصحيح
import API from '../../api/axiosInstance';
import { useQuery, useQueryClient } from '@tanstack/react-query';

  export const useProfile = () => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [preview, setPreview] = useState(null); 
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ avatar: "", fileId: "" });

  const currentUserId = user?._id || user?.userID || user?.id;

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['myProfile', currentUserId], 
    queryFn: async () => {
      const res = await API.get("/me");
      return res.data;
    },
    enabled: !!user, 
  });

  useEffect(() => {
    const currentData = profileData || user;
    if (currentData) {
      setUsername(currentData.username || "");
      setEmail(currentData.email || "");
      setAge(currentData.age || "");
      setPreview(currentData.avatar || null);
      setFormData({ avatar: currentData.avatar || "", fileId: currentData.fileId || "" });
    }
    setPassword("");
  }, [profileData, user, isOpen]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const resetForm = () => {
    setFile(null);
    setPassword("");
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      let finalAvatarUrl = formData.avatar;
      let imageKitFileId = formData.fileId;

      if (file) {
        const authRes = await API.get('/imagekitRoutes');
        const authData = authRes.data;
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("fileName", file.name);
        uploadData.append("folder", "/profiles");
        uploadData.append("publicKey", "public_8blKLRTsq6BkdVQ5OMD+OGPzNSM=");
        uploadData.append("signature", authData.signature);
        uploadData.append("expire", authData.expire.toString());
        uploadData.append("token", authData.token);

        const imgResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', { 
          method: 'POST', 
          body: uploadData 
        });
        const imgResult = await imgResponse.json();
        
        if (!imgResponse.ok) throw new Error("فشل رفع الصورة الحسابية");
        
        finalAvatarUrl = imgResult.url;
        imageKitFileId = imgResult.fileId; 
      }

      const updateData = { 
        username,
        email,
        age: Number(age), 
        avatar: finalAvatarUrl, 
        fileId: imageKitFileId 
      };

      if (password.trim() !== "") {
        updateData.password = password;
      }
      
      const targetId = currentUserId || profileData?._id;
      await API.put(`/UpdateUser/${targetId}`, updateData);

      queryClient.invalidateQueries(['myProfile', targetId]);
      resetForm();
    } catch (err) {
      console.error(err);
      alert(err.message || "حدث خطأ ما أثناء حفظ التغييرات");
    } finally {
      setFormLoading(false);
    }
  };

  return {
    user,
    profileData,
    isLoading,
    isOpen,
    setIsOpen,
    formState: { username, setUsername, email, setEmail, age, setAge, password, setPassword, preview, setPreview, setFile, setFormData, formData },
    formLoading,
    handleFileChange,
    resetForm,
    handleSubmit
  };
};