import { useCallback, useEffect, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  AutoComplete,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  BarChartOutlined,
  BellOutlined,
  BookOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  HomeOutlined,
  LoginOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { api } from './services/api';

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const pageTitles = {
  overview: 'Tổng quan',
  classes: 'Quản lý lớp',
  students: 'Quản lý sinh viên',
};

function LoginPage({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usedEmails, setUsedEmails] = useState(() => {
    const rawEmails = window.localStorage.getItem('student_admin_used_emails');
    return rawEmails ? JSON.parse(rawEmails) : [];
  });

  const rememberEmail = (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    const nextEmails = [normalizedEmail, ...usedEmails.filter((item) => item !== normalizedEmail)].slice(0, 5);
    window.localStorage.setItem('student_admin_used_emails', JSON.stringify(nextEmails));
    setUsedEmails(nextEmails);
  };

  const handleLogin = async (values) => {
    setLoading(true);
    setLoginError('');
    try {
      const admin = await api.login({
        email: values.accountHint,
        password: values.accessSecret,
      });
      rememberEmail(values.accountHint);
      message.success('Đăng nhập thành công');
      onLogin(admin);
    } catch (error) {
      setLoginError(error.message);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual" aria-hidden="true">
        <div>
          <Text className="login-kicker">Student Class Management</Text>
          <Title level={1}>Quản lý lớp học và học viên trong một giao diện.</Title>
          <Text>Theo dõi thông tin sinh viên, lớp học và dữ liệu quản trị từ backend Odoo.</Text>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <Title level={2}>Đăng nhập quản trị</Title>
          <Text type="secondary">Dùng tài khoản quản trị đã được cấp trong hệ thống.</Text>

          <Form layout="vertical" className="login-form" onFinish={handleLogin} autoComplete="off">
            {loginError && <div className="login-error">{loginError}</div>}

            <Form.Item
              label="Email"
              name="accountHint"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email chưa đúng định dạng' },
              ]}
            >
              <AutoComplete
                size="large"
                options={usedEmails.map((email) => ({ value: email }))}
                filterOption={(inputValue, option) => option.value.toLowerCase().includes(inputValue.toLowerCase())}
              >
                <Input prefix={<UserOutlined />} placeholder="Nhập email quản trị" autoComplete="off" inputMode="email" />
              </AutoComplete>
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="accessSecret"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
              ]}
            >
              <Input
                size="large"
                placeholder="Nhập mật khẩu"
                autoComplete="off"
                className={showPassword ? '' : 'masked-password-input'}
                suffix={
                  <Button
                    type="text"
                    className="password-visibility-button"
                    icon={showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    onClick={() => setShowPassword((visible) => !visible)}
                  />
                }
              />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block loading={loading} icon={<LoginOutlined />}>
              Đăng nhập
            </Button>
          </Form>
        </div>
      </section>
    </main>
  );
}

function OverviewPage() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ student_count: 0, class_count: 0, classes: [], source: 'odoo' });

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      setSummary(await api.dashboardSummary());
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const maxStudents = Math.max(...summary.classes.map((item) => item.student_count), 1);

  return (
    <Space direction="vertical" size={16} className="full-width">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic title="Tổng sinh viên" value={summary.student_count} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic title="Tổng lớp" value={summary.class_count} prefix={<BookOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic
              title="Sinh viên trung bình / lớp"
              value={summary.class_count ? summary.student_count / summary.class_count : 0}
              precision={1}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Phân bổ sinh viên theo lớp"
        extra={
          <Button icon={<ReloadOutlined />} onClick={loadSummary}>
            Tải lại
          </Button>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          dataSource={summary.classes}
          pagination={false}
          columns={[
            { title: 'Mã lớp', dataIndex: 'code', width: 140 },
            { title: 'Tên lớp', dataIndex: 'name' },
            {
              title: 'Số sinh viên',
              dataIndex: 'student_count',
              width: 180,
              sorter: (a, b) => a.student_count - b.student_count,
            },
            {
              title: 'Tỷ lệ',
              dataIndex: 'student_count',
              render: (value) => <Progress percent={Math.round((value / maxStudents) * 100)} />,
            },
          ]}
        />
      </Card>
    </Space>
  );
}

function ClassForm({ form, onFinish }) {
  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Mã lớp"
        name="code"
        rules={[
          { required: true, message: 'Vui lòng nhập mã lớp' },
          { max: 50, message: 'Mã lớp tối đa 50 ký tự' },
        ]}
      >
        <Input placeholder="VD: REACT01" />
      </Form.Item>
      <Form.Item
        label="Tên lớp"
        name="name"
        rules={[
          { required: true, message: 'Vui lòng nhập tên lớp' },
          { max: 100, message: 'Tên lớp tối đa 100 ký tự' },
        ]}
      >
        <Input placeholder="VD: React cơ bản" />
      </Form.Item>
      <Form.Item label="Mô tả" name="description" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
        <TextArea rows={4} placeholder="Mô tả nội dung lớp học" />
      </Form.Item>
    </Form>
  );
}

function ClassesPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [rows, setRows] = useState([]);

  const loadRows = useCallback(
    async (page = 1, size = 10, search = keyword) => {
      setLoading(true);
      try {
        const data = await api.list('class', { page, size, keyword: search });
        setRows(data.items || []);
        setPagination({ current: data.current_page, pageSize: data.page_size, total: data.total_record });
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    },
    [keyword],
  );

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const openCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editingRecord) {
        await api.update('class', editingRecord.id, values);
      } else {
        await api.create('class', values);
      }
      message.success('Đã lưu lớp');
      setModalOpen(false);
      loadRows();
    } catch (error) {
      message.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.remove('class', id);
      message.success('Đã xoá lớp');
      loadRows();
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <Space direction="vertical" size={16} className="full-width">
      <Card>
        <Flex justify="space-between" gap={12} wrap="wrap">
          <Input.Search
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo mọi trường của lớp"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onSearch={(value) => loadRows(1, pagination.pageSize, value)}
            className="table-search"
          />
          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={() => loadRows(pagination.current, pagination.pageSize)}>
              Tải lại
            </Button>
            <Button icon={<DownloadOutlined />} href={api.exportUrl('class')}>
              Excel
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Thêm lớp
            </Button>
          </Space>
        </Flex>
      </Card>

      <Card title="Danh sách lớp">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={rows}
          scroll={{ x: 900 }}
          pagination={pagination}
          onChange={(nextPagination) => loadRows(nextPagination.current, nextPagination.pageSize)}
          columns={[
            { title: 'ID', dataIndex: 'id', width: 80, sorter: (a, b) => a.id - b.id },
            { title: 'Mã lớp', dataIndex: 'code', width: 160 },
            { title: 'Tên lớp', dataIndex: 'name', width: 240 },
            { title: 'Mô tả', dataIndex: 'description' },
            {
              title: 'Thao tác',
              fixed: 'right',
              width: 150,
              render: (_, record) => (
                <Space>
                  <Button icon={<EditOutlined />} onClick={() => openEdit(record)} />
                  <Popconfirm title="Xoá lớp này?" okText="Xoá" cancelText="Huỷ" onConfirm={() => handleDelete(record.id)}>
                    <Button danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editingRecord ? 'Sửa lớp' : 'Thêm lớp'}
        open={modalOpen}
        okText="Lưu"
        cancelText="Huỷ"
        confirmLoading={saving}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <ClassForm form={form} onFinish={handleSave} />
      </Modal>
    </Space>
  );
}

function StudentForm({ form, onFinish, classes }) {
  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Mã sinh viên"
            name="code"
            rules={[
              { required: true, message: 'Vui lòng nhập mã sinh viên' },
              { max: 50, message: 'Mã sinh viên tối đa 50 ký tự' },
            ]}
          >
            <Input placeholder="VD: SV001" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Họ và tên"
            name="fullname"
            rules={[
              { required: true, message: 'Vui lòng nhập họ tên' },
              { max: 30, message: 'Họ tên tối đa 30 ký tự theo backend' },
            ]}
          >
            <Input placeholder="Nguyễn Minh Anh" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Ngày sinh" name="dob" rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}>
            <DatePicker className="full-width" format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Giới tính" name="sex" rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}>
            <Select
              options={[
                { value: true, label: 'Nam' },
                { value: false, label: 'Nữ' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Quê quán" name="homecity">
            <Input placeholder="Hà Nội" maxLength={100} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Địa chỉ" name="address">
            <Input placeholder="Cầu Giấy" maxLength={100} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Sở thích" name="hobbies">
            <InputNumber min={0} className="full-width" placeholder="Nhập số" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Màu tóc" name="hair_color" rules={[{ pattern: /^#[0-9a-fA-F]{6}$/, message: 'Màu tóc dạng #000000' }]}>
            <Input placeholder="#000000" maxLength={7} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email chưa đúng định dạng' },
            ]}
          >
            <Input placeholder="student@example.com" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Facebook"
            name="facebook"
            rules={[{ pattern: /^https?:\/\/[0-9a-zA-Z._/-]+$/, message: 'Facebook phải bắt đầu bằng http:// hoặc https://' }]}
          >
            <Input placeholder="https://facebook.com/student" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Lớp" name="class_id" rules={[{ required: true, message: 'Vui lòng chọn lớp' }]}>
            <Select
              placeholder="Chọn lớp"
              options={classes.map((item) => ({
                value: item.id,
                label: `${item.code} - ${item.name}`,
              }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Tài khoản"
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập tài khoản' },
              { max: 50, message: 'Tài khoản tối đa 50 ký tự' },
            ]}
          >
            <Input placeholder="student001" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              {
                pattern: /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9\s]).{8,}$/,
                message: 'Tối thiểu 8 ký tự, có hoa, thường, số và ký tự đặc biệt',
              },
            ]}
          >
            <Input.Password placeholder="Password@123" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Tên file ảnh" name="attachment_filename">
            <Input placeholder="avatar.png" />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item label="Mô tả" name="description">
            <TextArea rows={3} placeholder="Ghi chú về sinh viên" />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

function StudentsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [rows, setRows] = useState([]);

  const loadClasses = useCallback(async () => {
    try {
      setClasses(await api.getAll('class'));
    } catch (error) {
      message.error(error.message);
    }
  }, []);

  const loadRows = useCallback(
    async (page = 1, size = 10, search = keyword) => {
      setLoading(true);
      try {
        const data = await api.list('student', { page, size, keyword: search });
        setRows(data.items || []);
        setPagination({ current: data.current_page, pageSize: data.page_size, total: data.total_record });
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    },
    [keyword],
  );

  useEffect(() => {
    loadClasses();
    loadRows();
  }, [loadClasses, loadRows]);

  const openCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ sex: true, hair_color: '#000000', password: 'Password@123' });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      dob: record.dob ? dayjs(record.dob) : undefined,
      class_id: record.class_id?.id,
    });
    setModalOpen(true);
  };

  const normalizeValues = (values) => ({
    ...values,
    dob: values.dob ? values.dob.format('YYYY-MM-DD') : values.dob,
  });

  const handleSave = async () => {
    const values = normalizeValues(await form.validateFields());
    setSaving(true);
    try {
      if (editingRecord) {
        await api.update('student', editingRecord.id, values);
      } else {
        await api.create('student', values);
      }
      message.success('Đã lưu sinh viên');
      setModalOpen(false);
      loadRows();
    } catch (error) {
      message.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.remove('student', id);
      message.success('Đã xoá sinh viên');
      loadRows();
    } catch (error) {
      message.error(error.message);
    }
  };

  const columns = [
      { title: 'ID', dataIndex: 'id', width: 80, sorter: (a, b) => a.id - b.id },
      { title: 'Mã SV', dataIndex: 'code', width: 120 },
      { title: 'Họ tên', dataIndex: 'fullname', width: 180 },
      { title: 'Ngày sinh', dataIndex: 'dob', width: 130 },
      {
        title: 'Giới tính',
        dataIndex: 'sex',
        width: 110,
        render: (value) => <Tag color={value ? 'blue' : 'magenta'}>{value ? 'Nam' : 'Nữ'}</Tag>,
      },
      { title: 'Quê quán', dataIndex: 'homecity', width: 160 },
      { title: 'Địa chỉ', dataIndex: 'address', width: 180 },
      { title: 'Sở thích', dataIndex: 'hobbies', width: 110 },
      {
        title: 'Màu tóc',
        dataIndex: 'hair_color',
        width: 120,
        render: (value) => (
          <Space>
            <span className="color-swatch" style={{ backgroundColor: value || '#ffffff' }} />
            {value}
          </Space>
        ),
      },
      { title: 'Email', dataIndex: 'email', width: 220 },
      {
        title: 'Facebook',
        dataIndex: 'facebook',
        width: 220,
        render: (value) => (value ? <a href={value}>{value}</a> : ''),
      },
      {
        title: 'Lớp',
        dataIndex: 'class_id',
        width: 190,
        render: (value) => value?.display_name || '',
      },
      { title: 'Tài khoản', dataIndex: 'username', width: 140 },
      {
        title: 'Mật khẩu',
        dataIndex: 'password',
        width: 120,
        render: () => <Tag>ẩn</Tag>,
      },
      { title: 'Mô tả', dataIndex: 'description', width: 220 },
      { title: 'Tên file ảnh', dataIndex: 'attachment_filename', width: 160 },
      {
        title: 'Thao tác',
        fixed: 'right',
        width: 150,
        render: (_, record) => (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => openEdit(record)} />
            <Popconfirm title="Xoá sinh viên này?" okText="Xoá" cancelText="Huỷ" onConfirm={() => handleDelete(record.id)}>
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
  ];

  return (
    <Space direction="vertical" size={16} className="full-width">
      <Card>
        <Flex justify="space-between" gap={12} wrap="wrap">
          <Input.Search
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo mọi trường sinh viên"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onSearch={(value) => loadRows(1, pagination.pageSize, value)}
            className="table-search"
          />
          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={() => loadRows(pagination.current, pagination.pageSize)}>
              Tải lại
            </Button>
            <Button icon={<DownloadOutlined />} href={api.exportUrl('student')}>
              Excel
            </Button>
            <Button icon={<DownloadOutlined />} href={api.exportUrl('student', 'pdf')}>
              PDF
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Thêm sinh viên
            </Button>
          </Space>
        </Flex>
      </Card>

      <Card title="Danh sách sinh viên">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={rows}
          scroll={{ x: 2500 }}
          pagination={pagination}
          onChange={(nextPagination) => loadRows(nextPagination.current, nextPagination.pageSize)}
          columns={columns}
        />
      </Card>

      <Modal
        width={900}
        title={editingRecord ? 'Sửa sinh viên' : 'Thêm sinh viên'}
        open={modalOpen}
        okText="Lưu"
        cancelText="Huỷ"
        confirmLoading={saving}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <StudentForm form={form} onFinish={handleSave} classes={classes} />
      </Modal>
    </Space>
  );
}

function AdminLayout({ admin, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('overview');

  const menuItems = [
    { key: 'overview', icon: <HomeOutlined />, label: 'Tổng quan' },
    { key: 'classes', icon: <BookOutlined />, label: 'Quản lý lớp' },
    { key: 'students', icon: <TeamOutlined />, label: 'Quản lý sinh viên' },
  ];

  return (
    <Layout className="admin-shell">
      <Sider collapsible collapsed={collapsed} trigger={null} breakpoint="lg" collapsedWidth={72}>
        <div className="brand">
          <div className="brand-mark">SC</div>
          {!collapsed && <span>Student Admin</span>}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[activeMenu]} items={menuItems} onClick={({ key }) => setActiveMenu(key)} />
      </Sider>

      <Layout>
        <Header className="admin-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div className="header-title">
            <Title level={4}>{pageTitles[activeMenu]}</Title>
            <Text type="secondary">Dữ liệu lấy trực tiếp từ backend Odoo</Text>
          </div>
          <Space size={16}>
            <Badge dot>
              <BellOutlined className="header-icon" />
            </Badge>
            <Avatar icon={<UserOutlined />} />
            <Text className="admin-name">{admin?.name}</Text>
            <Button icon={<LogoutOutlined />} onClick={onLogout}>
              Đăng xuất
            </Button>
          </Space>
        </Header>

        <Content className="admin-content">
          {activeMenu === 'overview' && <OverviewPage />}
          {activeMenu === 'classes' && <ClassesPage />}
          {activeMenu === 'students' && <StudentsPage />}
        </Content>

        <Footer className="admin-footer">Student Class Management Admin</Footer>
      </Layout>
    </Layout>
  );
}

export default function App() {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    window.localStorage.removeItem('student_admin');
  }, []);

  const handleLogin = (nextAdmin) => {
    setAdmin(nextAdmin);
  };

  const handleLogout = () => {
    setAdmin(null);
  };

  if (!admin) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <AdminLayout admin={admin} onLogout={handleLogout} />;
}
