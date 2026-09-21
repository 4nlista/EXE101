import React, { useState } from 'react';
import { Container, Nav } from 'react-bootstrap';
import MyProjectsTab from './MyProjectsTab';
import MyApplicationsTab from './MyApplicationsTab';

export default function ManageProjects() {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <Container className="py-4" style={{ maxWidth: '1200px' }}>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Dự án</h2>
        <p className="text-muted mb-0">Quản lý dự án và hồ sơ ứng tuyển của bạn</p>
      </div>

      <Nav variant="tabs" className="mb-4" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Nav.Item>
          <Nav.Link eventKey="projects" className={activeTab === 'projects' ? 'fw-bold text-dark border-bottom border-primary border-3' : 'text-muted'}>
            Dự án của tôi
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="applications" className={activeTab === 'applications' ? 'fw-bold text-dark border-bottom border-primary border-3' : 'text-muted'}>
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
