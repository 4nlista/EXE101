import React, { useState } from 'react';
import { Container, Nav } from 'react-bootstrap';
import MyProjectsTab from './MyProjectsTab';
import MyApplicationsTab from './MyApplicationsTab';

export default function ManageProjects() {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <Container className="py-4" style={{ maxWidth: '1200px' }}>
      <div className="page-header">
        <h1 className="page-header__title">Dự án</h1>
        <p className="page-header__subtitle">Quản lý dự án và hồ sơ ứng tuyển của bạn</p>
      </div>

      <Nav variant="tabs" className="mb-4" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Nav.Item>
          <Nav.Link eventKey="projects">
            Dự án của tôi
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="applications">
            Hồ sơ đã nộp
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <div>
        {activeTab === 'projects' && <MyProjectsTab />}
        {activeTab === 'applications' && <MyApplicationsTab />}
      </div>
    </Container>
  );
}
