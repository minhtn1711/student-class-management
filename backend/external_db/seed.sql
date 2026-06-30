INSERT INTO external_classes (id, code, name, description)
VALUES
    (1, 'CLS001', 'Odoo Development', 'Lop hoc phat trien module Odoo'),
    (2, 'CLS002', 'Python Basic', 'Lop hoc Python can ban'),
    (3, 'CLS003', 'Backend API', 'Lop hoc thiet ke va test REST API')
ON DUPLICATE KEY UPDATE
    code = VALUES(code),
    name = VALUES(name),
    description = VALUES(description);

INSERT INTO external_students (
    id,
    code,
    fullname,
    dob,
    sex,
    homecity,
    address,
    hobbies,
    hair_color,
    email,
    facebook,
    class_id,
    username,
    password,
    description,
    attachment_filename
)
VALUES
    (
        1,
        'STU001',
        'Nguyen Van A',
        '2001-02-14',
        TRUE,
        'Ha Noi',
        'Cau Giay, Ha Noi',
        1,
        '#000000',
        'nguyenvana@example.com',
        'https://facebook.com/nguyenvana',
        1,
        'nguyenvana',
        'Password@123',
        'Hoc sinh demo tu MySQL external DB',
        'nguyenvana.png'
    ),
    (
        2,
        'STU002',
        'Tran Thi B',
        '2002-05-20',
        FALSE,
        'Da Nang',
        'Hai Chau, Da Nang',
        2,
        '#663300',
        'tranthib@example.com',
        'https://facebook.com/tranthib',
        2,
        'tranthib',
        'Password@123',
        'Hoc sinh lop Python Basic',
        'tranthib.jpg'
    ),
    (
        3,
        'STU003',
        'Le Van C',
        '2000-11-09',
        TRUE,
        'Ho Chi Minh',
        'Quan 1, Ho Chi Minh',
        3,
        '#111111',
        'levanc@example.com',
        'https://facebook.com/levanc',
        3,
        'levanc',
        'Password@123',
        'Hoc sinh lop Backend API',
        'levanc.jpeg'
    )
ON DUPLICATE KEY UPDATE
    code = VALUES(code),
    fullname = VALUES(fullname),
    dob = VALUES(dob),
    sex = VALUES(sex),
    homecity = VALUES(homecity),
    address = VALUES(address),
    hobbies = VALUES(hobbies),
    hair_color = VALUES(hair_color),
    email = VALUES(email),
    facebook = VALUES(facebook),
    class_id = VALUES(class_id),
    username = VALUES(username),
    password = VALUES(password),
    description = VALUES(description),
    attachment_filename = VALUES(attachment_filename);
