import {
  BookOutlined,
  CalendarOutlined,
  ExperimentTwoTone,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoneyCollectOutlined,
  ProfileOutlined,
  UnorderedListOutlined,
  UserOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Divider,
  Dropdown,
  Layout,
  Menu,
  Row,
  Space,
  Spin,
} from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
import React, { useState } from 'react';
import Lesson from '../src/components/Lesson';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER, JOIN_JITSI, JOIN_ZOOM } from '../src/api';

const { Header, Sider, Content, Footer } = Layout;

const menu = (
  <Menu>
    <Menu.Item icon={<ProfileOutlined />}>
      <span style={{ padding: 10 }}>Profile</span>
    </Menu.Item>
    <Menu.Item icon={<MoneyCollectOutlined />}>
      <span style={{ padding: 10 }}>Payment</span>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item icon={<LogoutOutlined />}>
      <span style={{ padding: 10 }}>Logout</span>
    </Menu.Item>
  </Menu>
);

const App = () => {
  const { loading, error, data } = useQuery(GET_USER);
  const router = useRouter();
  const [collapse, setCollapse] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [joinZoom] = useMutation(JOIN_ZOOM);
  const [joinJitsi] = useMutation(JOIN_JITSI);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 100,
        }}
      >
        <Spin
          tip="Please wait..."
          indicator={<LoadingOutlined style={{ fontSize: 150 }} />}
        />
      </div>
    );
  }

  if (error) {
    router.push('/login');
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 100,
        }}
      >
        <Spin
          tip="Please wait..."
          indicator={<LoadingOutlined style={{ fontSize: 150 }} />}
        />
      </div>
    );
  }

  const currentPage = {
    1: <Lesson />,
    2: <div>Sub</div>,
    3: <div>Category</div>,
    ...data.me.courses.reduce((p, course) => {
      const joinCourseZoom = () =>
        joinZoom({
          variables: { courseId: course.id },
        })
          .then((result) => {
            const zoomParams = result.data.joinZoom;

            router.push(
              `/zoom?topic=${zoomParams.topic}&password=${zoomParams.password}&signature=${zoomParams.signature}`
            );
          })
          .catch((result) => {
            console.log('here: ', result.toString());
          });

      const joinCourseJitsi = () =>
        joinJitsi({
          variables: { courseId: course.id },
        })
          .then((result) => {
            const jitsiParams = result.data.joinJitsi;

            router.push(
              `/jitsi?roomName=${jitsiParams.roomName}&signature=${jitsiParams.signature}`
            );
          })
          .catch((result) => {
            console.log('here: ', result.toString());
          });

      return {
        ...p,
        [3 + course.id]: (
          <div>
            <h2>{course.name}</h2>
            <h3>
              {course.owner.firstName} {course.owner.secondName}
            </h3>
            <Button onClick={joinCourseZoom}>Join Zoom</Button>
            <Button onClick={joinCourseJitsi}>Join Jitsi</Button>
          </div>
        ),
      };
    }, {}),
  };

  return (
    true && (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          style={{
            height: '100vh',
            position: 'fixed',
          }}
          collapsible
          trigger={null}
          onCollapse={(collapsed) => setCollapse(collapsed)}
          collapsed={collapse}
        >
          <div className="logo">
            <ExperimentTwoTone style={{ fontSize: 40 }} />
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['1']}
            onClick={({ key }) => {
              if (key === '0') setJwt('');
              setPageIndex(parseInt(key, 10));
            }}
          >
            <Menu.Item key="1" icon={<BookOutlined />}>
              New Lesson
            </Menu.Item>
            <Menu.Item key="2" icon={<UnorderedListOutlined />}>
              Past Lessons
            </Menu.Item>
            <Menu.Item key="3" icon={<CalendarOutlined />}>
              Calendar
            </Menu.Item>
            <Menu.Divider />
            {data.me.courses.map((course) => (
              <Menu.Item key={3 + course.id} icon={<BookOutlined />}>
                {course.name}
              </Menu.Item>
            ))}
          </Menu>
        </Sider>
        <Layout style={{ marginLeft: collapse ? 80 : 200 }}>
          <Header
            className="site-layout-background"
            style={{ padding: 0, height: 40 }}
          >
            <Row justify="space-between">
              <Col>
                {React.createElement(
                  collapse ? MenuUnfoldOutlined : MenuFoldOutlined,
                  {
                    className: 'trigger',
                    onClick: () => setCollapse(!collapse),
                  }
                )}
              </Col>
              <Col style={{ marginRight: 20 }}>
                <Space>
                  <span>Hello, {data.me.firstName}</span>
                  <Dropdown overlay={menu} placement="bottomRight">
                    <Avatar
                      size="large"
                      icon={<UserOutlined />}
                      style={{
                        cursor: 'pointer',
                      }}
                    />
                  </Dropdown>
                </Space>
              </Col>
            </Row>
          </Header>
          <Content className="site-layout-background">
            <Divider />
            <div style={{ padding: 30, overflow: 'auto' }}>
              {currentPage[pageIndex]}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            ©2021 Created by SupraSchool Inc.
          </Footer>
        </Layout>
      </Layout>
    )
  );
};

export default App;
