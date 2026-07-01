import { useCallback, useEffect, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  AutoComplete,
  Checkbox,
  Col,
  DatePicker,
  Descriptions,
  Dropdown,
  Flex,
  Form,
  Input,
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
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  BarChartOutlined,
  BellOutlined,
  BookOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownOutlined,
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
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { api } from './services/api';

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const classExportFields = [
  { value: 'id', label: 'ID' },
  { value: 'code', label: 'Mã lớp' },
  { value: 'name', label: 'Tên lớp' },
  { value: 'description', label: 'Mô tả' },
];
const classFilterFields = classExportFields.filter((field) => field.value !== 'id');

const studentExportFields = [
  { value: 'id', label: 'ID' },
  { value: 'code', label: 'Mã SV' },
  { value: 'fullname', label: 'Họ tên' },
  { value: 'dob', label: 'Ngày sinh' },
  { value: 'sex', label: 'Giới tính' },
  { value: 'homecity', label: 'Quê quán' },
  { value: 'address', label: 'Địa chỉ' },
  { value: 'hobbies', label: 'Sở thích' },
  { value: 'hair_color', label: 'Màu tóc' },
  { value: 'email', label: 'Email' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'class_id', label: 'Lớp' },
  { value: 'username', label: 'Tài khoản' },
  { value: 'password', label: 'Mật khẩu' },
  { value: 'description', label: 'Mô tả' },
  { value: 'attachment_filename', label: 'Tên file ảnh' },
];
const studentFilterFields = studentExportFields.filter((field) => field.value !== 'id');

function displayValue(value, field) {
  if (field === 'sex') {
    return value ? 'Nam' : 'Nữ';
  }
  if (field === 'password') {
    return 'ẩn';
  }
  if (value && typeof value === 'object' && 'display_name' in value) {
    return value.display_name;
  }
  if (value === false || value === null || value === undefined || value === '') {
    return '-';
  }
  return String(value);
}

function DetailModal({ title, fields, record, onClose }) {
  return (
    <Modal title={title} open={Boolean(record)} footer={null} onCancel={onClose} width={760} destroyOnClose>
      {record && (
        <Descriptions bordered column={1} size="middle">
          {fields.map((field) => (
            <Descriptions.Item key={field.value} label={field.label}>
              {field.value === 'hair_color' && record[field.value] ? (
                <Space>
                  <span className="color-swatch" style={{ backgroundColor: record[field.value] }} />
                  {record[field.value]}
                </Space>
              ) : (
                displayValue(record[field.value], field.value)
              )}
            </Descriptions.Item>
          ))}
        </Descriptions>
      )}
    </Modal>
  );
}

function ExportFieldSelect({ fields, value, onChange }) {
  return (
    <Dropdown
      trigger={['click']}
      placement="bottomLeft"
      dropdownRender={() => (
        <div className="filter-dropdown-panel">
          <Checkbox.Group value={value} onChange={onChange}>
            <Space direction="vertical" size={10}>
              {fields.map((field) => (
                <Checkbox key={field.value} value={field.value}>
                  {field.label}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </div>
      )}
    >
      <Button className="filter-dropdown-button">
        Lọc thông tin
        <DownOutlined />
      </Button>
    </Dropdown>
  );
}

function ImportButton({ resource, onImported }) {
  const [importing, setImporting] = useState(false);

  const handleImport = async (file) => {
    setImporting(true);
    try {
      const result = await api.importFile(resource, file);
      message.success(`Đã import ${result?.created || 0} bản ghi`);
      onImported();
    } catch (error) {
      message.error(error.message);
    } finally {
      setImporting(false);
    }
    return Upload.LIST_IGNORE;
  };

  return (
    <Upload accept=".xlsx,.xls" showUploadList={false} beforeUpload={handleImport}>
      <Button icon={<UploadOutlined />} loading={importing}>
        Import
      </Button>
    </Upload>
  );
}

const pageTitles = {
  overview: 'Tổng quan',
  classes: 'Quản lý lớp',
  students: 'Quản lý sinh viên',
};

const adminStorageKey = 'student_admin';
const activeMenuStorageKey = 'student_admin_active_menu';
const classPageStateStorageKey = 'student_admin_classes_state';
const studentPageStateStorageKey = 'student_admin_students_state';
const defaultMenuKey = 'overview';
const menuKeys = ['overview', 'classes', 'students'];

function readStoredAdmin() {
  try {
    const rawAdmin = window.localStorage.getItem(adminStorageKey);
    return rawAdmin ? JSON.parse(rawAdmin) : null;
  } catch {
    window.localStorage.removeItem(adminStorageKey);
    return null;
  }
}

function readStoredActiveMenu() {
  const storedMenu = window.localStorage.getItem(activeMenuStorageKey);
  return menuKeys.includes(storedMenu) ? storedMenu : defaultMenuKey;
}

function readStoredJson(key, fallback = {}) {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

function normalizeStoredFields(storedFields, fields) {
  const allowedFields = fields.map((field) => field.value);
  const normalizedFields = Array.isArray(storedFields)
    ? storedFields.filter((field) => allowedFields.includes(field))
    : [];
  return normalizedFields.length ? normalizedFields : allowedFields;
}

function normalizeStoredPagination(storedPagination) {
  return {
    current: storedPagination?.current || 1,
    pageSize: storedPagination?.pageSize || 10,
    total: storedPagination?.total || 0,
  };
}

function clearStoredSelectedRows(key) {
  const pageState = readStoredJson(key);
  window.localStorage.setItem(
    key,
    JSON.stringify({
      ...pageState,
      selectedRowKeys: [],
    }),
  );
}

function clearSelectedRowsOnLeave(menuKey) {
  if (menuKey === 'classes') {
    clearStoredSelectedRows(classPageStateStorageKey);
  }
  if (menuKey === 'students') {
    clearStoredSelectedRows(studentPageStateStorageKey);
  }
}

function restoreStudentFormValues(values) {
  if (!values) {
    return {};
  }
  return {
    ...values,
    dob: values.dob ? dayjs(values.dob) : undefined,
    class_id: values.class_id?.id || values.class_id,
  };
}

function persistStudentFormValues(values) {
  if (!values) {
    return null;
  }
  return {
    ...values,
    dob: values.dob?.format ? values.dob.format('YYYY-MM-DD') : values.dob,
    class_id: values.class_id?.id || values.class_id,
  };
}

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
          <Title level={1}>Quản lý học viên và lớp học</Title>
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

function ClassForm({ form, onFinish, onValuesChange }) {
  return (
    <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={onValuesChange}>
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
  const [initialPageState] = useState(() => readStoredJson(classPageStateStorageKey));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(Boolean(initialPageState.modalOpen));
  const [editingRecord, setEditingRecord] = useState(initialPageState.editingRecord || null);
  const [formDraft, setFormDraft] = useState(initialPageState.formDraft || null);
  const [detailRecord, setDetailRecord] = useState(null);
  const [keyword, setKeyword] = useState(initialPageState.keyword || '');
  const [pagination, setPagination] = useState(() => normalizeStoredPagination(initialPageState.pagination));
  const [rows, setRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState(initialPageState.selectedRowKeys || []);
  const [exportFields, setExportFields] = useState(() => normalizeStoredFields(initialPageState.exportFields, classFilterFields));
  const classCurrentPage = pagination.current;
  const classPageSize = pagination.pageSize;

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
    loadRows(classCurrentPage, classPageSize, keyword);
  }, [classCurrentPage, classPageSize, keyword, loadRows]);

  useEffect(() => {
    if (modalOpen) {
      form.setFieldsValue(formDraft || editingRecord || {});
    }
  }, [editingRecord, form, formDraft, modalOpen]);

  useEffect(() => {
    window.localStorage.setItem(
      classPageStateStorageKey,
      JSON.stringify({
        keyword,
        pagination,
        selectedRowKeys,
        exportFields,
        modalOpen,
        editingRecord,
        formDraft,
      }),
    );
  }, [editingRecord, exportFields, formDraft, keyword, modalOpen, pagination, selectedRowKeys]);

  const openCreate = () => {
    setEditingRecord(null);
    setFormDraft(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    setFormDraft(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRecord(null);
    setFormDraft(null);
    form.resetFields();
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
      closeModal();
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

  const handleCopy = async (id) => {
    try {
      await api.copy('class', id);
      message.success('Đã sao chép lớp');
      loadRows();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleBulkCopy = async () => {
    try {
      const copied = await api.copyMany('class', selectedRowKeys);
      message.success(`Đã sao chép ${copied?.length || selectedRowKeys.length} lớp`);
      setSelectedRowKeys([]);
      loadRows();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await api.removeMany('class', selectedRowKeys);
      message.success(`Đã xoá ${selectedRowKeys.length} lớp`);
      setSelectedRowKeys([]);
      loadRows();
    } catch (error) {
      message.error(error.message);
    }
  };

  const exportParams = {
    columnlist: ['id', ...exportFields],
    idlist: selectedRowKeys,
  };
  const classIdColumn = { title: 'ID', dataIndex: 'id', width: 80, sorter: (a, b) => a.id - b.id };
  const visibleClassColumns = [
    { title: 'Mã lớp', dataIndex: 'code', width: 160 },
    { title: 'Tên lớp', dataIndex: 'name', width: 240 },
    { title: 'Mô tả', dataIndex: 'description' },
  ].filter((column) => exportFields.includes(column.dataIndex));

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
            <ExportFieldSelect fields={classFilterFields} value={exportFields} onChange={setExportFields} />
            <ImportButton resource="class" onImported={() => loadRows(1, pagination.pageSize, keyword)} />
            <Button icon={<DownloadOutlined />} href={api.exportUrl('class', 'xlsx', exportParams)} disabled={!exportFields.length}>
              Excel
            </Button>
            <Button icon={<DownloadOutlined />} href={api.exportUrl('class', 'pdf', exportParams)} disabled={!exportFields.length}>
              PDF
            </Button>
            <Popconfirm
              title={`Sao chép ${selectedRowKeys.length} lớp đã chọn?`}
              okText="Sao chép"
              cancelText="Huỷ"
              disabled={!selectedRowKeys.length}
              onConfirm={handleBulkCopy}
            >
              <Button icon={<CopyOutlined />} disabled={!selectedRowKeys.length}>
                Sao chép chọn
              </Button>
            </Popconfirm>
            <Popconfirm
              title={`Xoá ${selectedRowKeys.length} lớp đã chọn?`}
              okText="Xoá"
              cancelText="Huỷ"
              disabled={!selectedRowKeys.length}
              onConfirm={handleBulkDelete}
            >
              <Button danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length}>
                Xoá chọn
              </Button>
            </Popconfirm>
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
          rowSelection={{
            selectedRowKeys,
            preserveSelectedRowKeys: true,
            onChange: setSelectedRowKeys,
          }}
          onChange={(nextPagination) => loadRows(nextPagination.current, nextPagination.pageSize)}
          columns={[
            classIdColumn,
            ...visibleClassColumns,
            {
              title: 'Thao tác',
              fixed: 'right',
              width: 240,
              render: (_, record) => (
                <Space>
                  <Tooltip title="Xem chi tiết">
                    <Button icon={<EyeOutlined />} onClick={() => setDetailRecord(record)} />
                  </Tooltip>
                  <Popconfirm title="Sao chép lớp này?" okText="Sao chép" cancelText="Huỷ" onConfirm={() => handleCopy(record.id)}>
                    <Tooltip title="Sao chép">
                      <Button icon={<CopyOutlined />} />
                    </Tooltip>
                  </Popconfirm>
                  <Tooltip title="Sửa">
                    <Button icon={<EditOutlined />} onClick={() => openEdit(record)} />
                  </Tooltip>
                  <Popconfirm title="Xoá lớp này?" okText="Xoá" cancelText="Huỷ" onConfirm={() => handleDelete(record.id)}>
                    <Tooltip title="Xoá">
                      <Button danger icon={<DeleteOutlined />} />
                    </Tooltip>
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
        onCancel={closeModal}
        destroyOnClose
      >
        <ClassForm form={form} onFinish={handleSave} onValuesChange={(_, values) => setFormDraft(values)} />
      </Modal>

      <DetailModal
        title="Chi tiết lớp"
        fields={classExportFields}
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
      />
    </Space>
  );
}

function StudentForm({ form, onFinish, classes, onValuesChange }) {
  return (
    <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={onValuesChange}>
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
          <Form.Item label="Sở thích" name="hobbies" rules={[{ max: 255, message: 'Sở thích tối đa 255 ký tự' }]}>
            <Input placeholder="Đọc sách, bóng đá, âm nhạc" maxLength={255} />
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
  const [initialPageState] = useState(() => readStoredJson(studentPageStateStorageKey));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(Boolean(initialPageState.modalOpen));
  const [editingRecord, setEditingRecord] = useState(initialPageState.editingRecord || null);
  const [formDraft, setFormDraft] = useState(initialPageState.formDraft || null);
  const [detailRecord, setDetailRecord] = useState(null);
  const [keyword, setKeyword] = useState(initialPageState.keyword || '');
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState(() => normalizeStoredPagination(initialPageState.pagination));
  const [rows, setRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState(initialPageState.selectedRowKeys || []);
  const [exportFields, setExportFields] = useState(() => normalizeStoredFields(initialPageState.exportFields, studentFilterFields));
  const studentCurrentPage = pagination.current;
  const studentPageSize = pagination.pageSize;

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
    loadRows(studentCurrentPage, studentPageSize, keyword);
  }, [keyword, loadClasses, loadRows, studentCurrentPage, studentPageSize]);

  useEffect(() => {
    if (modalOpen) {
      form.setFieldsValue(restoreStudentFormValues(formDraft || editingRecord));
    }
  }, [editingRecord, form, formDraft, modalOpen]);

  useEffect(() => {
    window.localStorage.setItem(
      studentPageStateStorageKey,
      JSON.stringify({
        keyword,
        pagination,
        selectedRowKeys,
        exportFields,
        modalOpen,
        editingRecord,
        formDraft,
      }),
    );
  }, [editingRecord, exportFields, formDraft, keyword, modalOpen, pagination, selectedRowKeys]);

  const openCreate = () => {
    const defaults = { sex: true, hair_color: '#000000', password: 'Password@123' };
    setEditingRecord(null);
    setFormDraft(defaults);
    form.resetFields();
    form.setFieldsValue(defaults);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    const values = {
      ...record,
      dob: record.dob ? dayjs(record.dob) : undefined,
      class_id: record.class_id?.id,
    };
    setEditingRecord(record);
    setFormDraft(persistStudentFormValues(values));
    form.setFieldsValue(values);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRecord(null);
    setFormDraft(null);
    form.resetFields();
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
      closeModal();
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

  const handleCopy = async (id) => {
    try {
      await api.copy('student', id);
      message.success('Đã sao chép sinh viên');
      loadRows();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleBulkCopy = async () => {
    try {
      const copied = await api.copyMany('student', selectedRowKeys);
      message.success(`Đã sao chép ${copied?.length || selectedRowKeys.length} sinh viên`);
      setSelectedRowKeys([]);
      loadRows();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await api.removeMany('student', selectedRowKeys);
      message.success(`Đã xoá ${selectedRowKeys.length} sinh viên`);
      setSelectedRowKeys([]);
      loadRows();
    } catch (error) {
      message.error(error.message);
    }
  };

  const exportParams = {
    columnlist: ['id', ...exportFields],
    idlist: selectedRowKeys,
  };

  const studentIdColumn = { title: 'ID', dataIndex: 'id', width: 80, sorter: (a, b) => a.id - b.id };
  const visibleStudentColumns = [
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
    { title: 'Sở thích', dataIndex: 'hobbies', width: 220 },
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
  ].filter((column) => exportFields.includes(column.dataIndex));

  const columns = [
      studentIdColumn,
      ...visibleStudentColumns,
      {
        title: 'Thao tác',
        fixed: 'right',
        width: 240,
        render: (_, record) => (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button icon={<EyeOutlined />} onClick={() => setDetailRecord(record)} />
            </Tooltip>
            <Popconfirm title="Sao chép sinh viên này?" okText="Sao chép" cancelText="Huỷ" onConfirm={() => handleCopy(record.id)}>
              <Tooltip title="Sao chép">
                <Button icon={<CopyOutlined />} />
              </Tooltip>
            </Popconfirm>
            <Tooltip title="Sửa">
              <Button icon={<EditOutlined />} onClick={() => openEdit(record)} />
            </Tooltip>
            <Popconfirm title="Xoá sinh viên này?" okText="Xoá" cancelText="Huỷ" onConfirm={() => handleDelete(record.id)}>
              <Tooltip title="Xoá">
                <Button danger icon={<DeleteOutlined />} />
              </Tooltip>
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
            <ExportFieldSelect fields={studentFilterFields} value={exportFields} onChange={setExportFields} />
            <ImportButton resource="student" onImported={() => loadRows(1, pagination.pageSize, keyword)} />
            <Button icon={<DownloadOutlined />} href={api.exportUrl('student', 'xlsx', exportParams)} disabled={!exportFields.length}>
              Excel
            </Button>
            <Button icon={<DownloadOutlined />} href={api.exportUrl('student', 'pdf', exportParams)} disabled={!exportFields.length}>
              PDF
            </Button>
            <Popconfirm
              title={`Sao chép ${selectedRowKeys.length} sinh viên đã chọn?`}
              okText="Sao chép"
              cancelText="Huỷ"
              disabled={!selectedRowKeys.length}
              onConfirm={handleBulkCopy}
            >
              <Button icon={<CopyOutlined />} disabled={!selectedRowKeys.length}>
                Sao chép chọn
              </Button>
            </Popconfirm>
            <Popconfirm
              title={`Xoá ${selectedRowKeys.length} sinh viên đã chọn?`}
              okText="Xoá"
              cancelText="Huỷ"
              disabled={!selectedRowKeys.length}
              onConfirm={handleBulkDelete}
            >
              <Button danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length}>
                Xoá chọn
              </Button>
            </Popconfirm>
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
          rowSelection={{
            selectedRowKeys,
            preserveSelectedRowKeys: true,
            onChange: setSelectedRowKeys,
          }}
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
        onCancel={closeModal}
        destroyOnClose
      >
        <StudentForm
          form={form}
          onFinish={handleSave}
          classes={classes}
          onValuesChange={(_, values) => setFormDraft(persistStudentFormValues(values))}
        />
      </Modal>

      <DetailModal
        title="Chi tiết sinh viên"
        fields={studentExportFields}
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
      />
    </Space>
  );
}

function AdminLayout({ admin, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState(readStoredActiveMenu);

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
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeMenu]}
          items={menuItems}
          onClick={({ key }) => {
            if (key !== activeMenu) {
              clearSelectedRowsOnLeave(activeMenu);
            }
            setActiveMenu(key);
            window.localStorage.setItem(activeMenuStorageKey, key);
          }}
        />
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
  const [admin, setAdmin] = useState(readStoredAdmin);

  const handleLogin = (nextAdmin) => {
    window.localStorage.setItem(adminStorageKey, JSON.stringify(nextAdmin));
    setAdmin(nextAdmin);
  };

  const handleLogout = () => {
    window.localStorage.removeItem(adminStorageKey);
    window.localStorage.removeItem(activeMenuStorageKey);
    window.localStorage.removeItem(classPageStateStorageKey);
    window.localStorage.removeItem(studentPageStateStorageKey);
    setAdmin(null);
  };

  if (!admin) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <AdminLayout admin={admin} onLogout={handleLogout} />;
}
