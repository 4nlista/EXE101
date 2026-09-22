import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import {
  useMyProfile,
  usePublicProfile,
  useUpdateProfileMutation,
  useCreateProjectHistoryMutation,
  useUpdateProjectHistoryMutation,
  useDeleteProjectHistoryMutation
} from '../../hooks/useProfile';
import ProfileHeader from './components/ProfileHeader';
import ProfileInfo from './components/ProfileInfo';
import ProfileSkills from './components/ProfileSkills';
import ProjectHistoryTable from './components/ProjectHistoryTable';
import '../../styles/profile.css';
import { toast } from 'react-toastify';
import { initConversation } from '../../services/messageService';

export default function PublicProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Kiểm tra xem đang xem profile của mình hay người khác
  const isOwner = !id || id === currentUser?._id;

  const { data: myProfile, isLoading: isMyLoading } = useMyProfile({ enabled: isOwner });
  const { data: publicProfile, isLoading: isPublicLoading } = usePublicProfile(id);

  const profileData = isOwner ? myProfile?.data : publicProfile?.data;
  const isLoading = isOwner ? isMyLoading : isPublicLoading;

  const updateProfileMutation = useUpdateProfileMutation();
  const createProjectHistoryMutation = useCreateProjectHistoryMutation();
  const updateProjectHistoryMutation = useUpdateProjectHistoryMutation();
  const deleteProjectHistoryMutation = useDeleteProjectHistoryMutation();

  // States
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [privacyData, setPrivacyData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Split View States for Project History
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({});

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!profileData) {
    return (
      <Container className="text-center py-5 min-vh-100">
        <h4>Không tìm thấy hồ sơ!</h4>
      </Container>
    );
  }

  // --- Handlers for Main Profile ---
  const handleEditClick = () => {
    setEditData({
      name: profileData.name || '',
      phone: profileData.phone || '',
      address: profileData.address || '',
      dob: profileData.dob ? new Date(profileData.dob).toISOString().split('T')[0] : '',
      departmentId: profileData.departmentId?._id || profileData.departmentId || '',
      majorId: profileData.majorId?._id || profileData.majorId || '',
      semester: profileData.semester || '',
      gradeGoal: profileData.gradeGoal !== undefined ? profileData.gradeGoal : '',
      mainSkills: Array.isArray(profileData.mainSkills) ? profileData.mainSkills : []
    });
    setPrivacyData(profileData.privacySettings || {});
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Kích thước ảnh tối đa là 2MB");
        e.target.value = '';
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleSaveProfile = async () => {
    const formData = new FormData();
    formData.append('name', editData.name);
    formData.append('phone', editData.phone);
    formData.append('address', editData.address);
    formData.append('dob', editData.dob);
    if (editData.departmentId) formData.append('departmentId', editData.departmentId);
    if (editData.majorId) formData.append('majorId', editData.majorId);
    formData.append('semester', editData.semester);
    formData.append('gradeGoal', editData.gradeGoal);

    // Ensure mainSkills is serialized as JSON string array
    const skillsArray = Array.isArray(editData.mainSkills)
      ? editData.mainSkills
      : (typeof editData.mainSkills === 'string'
        ? editData.mainSkills.split(',').map(s => s.trim()).filter(Boolean)
        : []);

    formData.append('mainSkills', JSON.stringify(skillsArray));
    formData.append('privacySettings', JSON.stringify(privacyData));

    if (selectedImage) {
      formData.append('avatar', selectedImage);
    }

    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        setIsEditMode(false);
        setSelectedImage(null);
      }
    });
  };

  const togglePrivacy = (field) => {
    setPrivacyData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleStartChat = async () => {
    if (!profileData?._id) return;
    try {
      console.log('[CHAT DEBUG][FE PROFILE]', {
        currentUserId: currentUser?._id,
        profileUrlId: id,
        isOwner,
        profileDataId: profileData?._id,
        profileDataName: profileData?.name
      });
      const res = await initConversation(profileData._id);
      console.log('[CHAT DEBUG][FE INIT RESPONSE]', {
        conversationId: res?.data?._id,
        participants: res?.data?.participants
      });
      if (res.success) {
        navigate('/messages', { state: { conversationId: res.data._id, conversation: res.data } });
      }
    } catch (error) {
      toast.error('Không thể bắt đầu cuộc trò chuyện');
    }
  };

  // --- Handlers for Project History ---
  const openProjectDetail = (project = null) => {
    if (project) {
      setSelectedProject(project);
      setIsAddingProject(false);
      setProjectForm({
        ...project,
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ''
      });
    } else {
      setSelectedProject(null);
      setIsAddingProject(true);
      setProjectForm({ type: 'personal', projectName: '', description: '' });
    }
  };

  const closeProjectDetail = () => {
    setSelectedProject(null);
    setIsAddingProject(false);
    setProjectForm({});
  };

  const saveProjectDetail = () => {
    if (isAddingProject) {
      createProjectHistoryMutation.mutate(projectForm, {
        onSuccess: () => closeProjectDetail()
      });
    } else if (selectedProject) {
      updateProjectHistoryMutation.mutate({ id: selectedProject._id, data: projectForm }, {
        onSuccess: () => closeProjectDetail()
      });
    }
  };

  const handleDeleteProject = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dự án này?")) {
      deleteProjectHistoryMutation.mutate(id, {
        onSuccess: () => {
          if (selectedProject?._id === id) closeProjectDetail();
        }
      });
    }
  };

  return (
    <Container className="py-3" style={{ maxWidth: '100%' }}>
      <ProfileHeader
        profileData={profileData}
        isOwner={isOwner}
        isEditMode={isEditMode}
        editData={editData}
        setEditData={setEditData}
        privacyData={privacyData}
        togglePrivacy={togglePrivacy}
        selectedImage={selectedImage}
        handleImageChange={handleImageChange}
        fileInputRef={fileInputRef}
        handleEditClick={handleEditClick}
        handleCancelEdit={handleCancelEdit}
        handleSaveProfile={handleSaveProfile}
        isSaving={updateProfileMutation.isPending}
        handleStartChat={handleStartChat}
      />

      <Row>
        <Col lg={3}>
          <ProfileInfo
            profileData={profileData}
            isOwner={isOwner}
            isEditMode={isEditMode}
            editData={editData}
            setEditData={setEditData}
            privacyData={privacyData}
            togglePrivacy={togglePrivacy}
          />

          <ProfileSkills
            profileData={profileData}
            isOwner={isOwner}
            isEditMode={isEditMode}
            editData={editData}
            setEditData={setEditData}
            privacyData={privacyData}
            togglePrivacy={togglePrivacy}
          />
        </Col>

        <Col lg={9}>
          <ProjectHistoryTable
            profileData={profileData}
            isOwner={isOwner}
            isEditMode={isEditMode}
            privacyData={privacyData}
            togglePrivacy={togglePrivacy}
            selectedProject={selectedProject}
            isAddingProject={isAddingProject}
            projectForm={projectForm}
            setProjectForm={setProjectForm}
            openProjectDetail={openProjectDetail}
            closeProjectDetail={closeProjectDetail}
            saveProjectDetail={saveProjectDetail}
            handleDeleteProject={handleDeleteProject}
          />
        </Col>
      </Row>
    </Container>
  );
}
