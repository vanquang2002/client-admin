import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Table } from 'react-bootstrap';
import axios from 'axios';

// Component Menu để hiển thị thông tin mỗi thực đơn
const Menu = ({ menu, onDelete, onEdit }) => {
  const menuString = menu.foodName.toString();
  const menuList = menuString.split(',').map(item => item.trim());

  return (
    <Col xs={12} md={6} lg={3} className="menu-col mb-4" style={{ height: '360px' }}>
      <Card className="menu-card h-100" style={{ border: '3px solid #000', borderRadius: '10px' }}>
        <Table className="mb-0">
          <thead>
            <th className="bg-success rounded-top-2 text-center text-white">Món ăn </th>
          </thead>
          <tbody style={{ height: '200px', overflowY: 'auto', display: 'block' }}>
            {menuList.map((menuItem, index) => (
              <tr key={index} style={{ display: 'block' }}>
                <td style={{ display: 'block' }}>{menuItem}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="text-bg-info"><strong>Đồ uống: </strong> {menu.drinkName}</td></tr>
            <tr>
              <td className="text-bg-warning"><strong>Price: </strong>{menu.price} VND</td>
            </tr>
          </tfoot>
        </Table>
        <div className="d-flex justify-content-around p-2 mt-auto">
          <Button variant="primary" onClick={() => onEdit(menu)} className="col-5">Cập nhật</Button>
          <Button variant="danger" onClick={() => onDelete(menu._id)} className="col-6">Xóa</Button>
        </div>
      </Card>
    </Col>
  );
};



// Component ListMenu với phân trang và lọc giá
const ListMenu = () => {
  const [menuData, setMenuData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const itemsPerPage = 12; // Số thực đơn trên mỗi trang
  const [maxPrice, setMaxPrice] = useState(''); // Giá tối đa để lọc
  const [selectedMenu, setSelectedMenu] = useState(null); // Thực đơn được chọn để xem chi tiết
  const [showModal, setShowModal] = useState(false); // Trạng thái hiển thị Modal
  const [editedMenu, setEditedMenu] = useState(null); // Thực đơn đã chỉnh sửa

  useEffect(() => {
    fetchMenuData();
  }, []);

  // Hàm lấy dữ liệu thực đơn từ API
  const fetchMenuData = () => {
    axios
      .get("http://localhost:9999/menus")
      .then((response) => setMenuData(response.data))
      .catch((error) => console.error("Error fetching data:", error));
  };

  // Lọc menuData theo mức giá
  const filteredMenuData = menuData.filter((menu) => {
    if (maxPrice === '' || maxPrice === 0) {
      return true; // Nếu không có giá trị lọc thì trả về tất cả
    }
    return menu.price <= parseFloat(maxPrice); // Lọc theo giá
  });

  // Tính toán lại số trang sau khi lọc giá
  const totalPages = Math.ceil(filteredMenuData.length / itemsPerPage);

  // Lấy dữ liệu cho trang hiện tại sau khi đã lọc theo giá
  const currentMenuData = filteredMenuData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Hàm để chuyển sang trang tiếp theo
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Hàm để quay về trang trước
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Hàm xóa thực đơn
  const handleDelete = (id) => {
    // Gửi yêu cầu xóa đến API
    axios
      .delete(`http://localhost:9999/menus/${id}`)
      .then(() => {
        // Cập nhật lại danh sách sau khi xóa
        fetchMenuData();
        // Reset về trang 1
        setCurrentPage(1);
      })
      .catch((error) => console.error("Error deleting menu:", error));
  };

  // Hàm để hiển thị popup chi tiết thực đơn
  const handleDetail = (menu) => {
    setSelectedMenu(menu);
    setEditedMenu(menu); // Sao chép dữ liệu thực đơn để chỉnh sửa
    setShowModal(true);
  };

  // Hàm để xử lý chỉnh sửa thực đơn
  const handleEdit = () => {
    axios
      .put(`http://localhost:9999/menus/${editedMenu._id}`, editedMenu)
      .then(() => {
        fetchMenuData(); // Lấy lại danh sách sau khi chỉnh sửa
        setShowModal(false);
      })
      .catch((error) => console.error("Error updating menu:", error));
  };

  return (
    <Container>
      <h2 className="text-center my-4">Danh sách thực đơn tại nhà khách Hương Sen</h2>

      {/* Ô lọc giá */}
      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={2}>Lọc theo giá (VND):</Form.Label>
        <Col sm={4}>
          <Form.Control
            type="number"
            value={maxPrice}
            placeholder="Nhập giá tối đa"
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setCurrentPage(1); // Reset về trang 1 sau khi lọc
            }}
          />
        </Col>
      </Form.Group>

      <Row className="menu-layout">
        {currentMenuData.map((menu) => (
          <Menu key={menu._id} menu={menu} onDelete={handleDelete} onEdit={handleDetail} />
        ))}
      </Row>

      {/* Nút phân trang */}
      <div className="pagination-controls text-center mt-4">
        <Button onClick={prevPage} disabled={currentPage === 1}>
          Trang trước
        </Button>
        <span className="mx-3">
          Trang {currentPage} / {totalPages}
        </span>
        <Button onClick={nextPage} disabled={currentPage === totalPages}>
          Trang tiếp theo
        </Button>
      </div>

      {/* Modal chi tiết và chỉnh sửa */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết thực đơn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editedMenu && (
            <Form>
              <Form.Group>
                <Form.Label>Tên món ăn</Form.Label>
                <Form.Control
                  as="textarea"
                  value={editedMenu.foodName}
                  onChange={(e) => setEditedMenu({ ...editedMenu, foodName: e.target.value })}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Giá (VND)</Form.Label>
                <Form.Control
                  type="number"
                  value={editedMenu.price}
                  onChange={(e) => setEditedMenu({ ...editedMenu, price: e.target.value })}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Đồ uống</Form.Label>
                <Form.Control
                  type='text'
                  value={editedMenu.drinkName}
                  onChange={(e) => setEditedMenu({ ...editedMenu, drinkName: e.target.value })}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Miêu tả</Form.Label>
                <Form.Control
                  as="textarea"
                  value={editedMenu.description}
                  onChange={(e) => setEditedMenu({ ...editedMenu, description: e.target.value })}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
          <Button variant="primary" onClick={handleEdit}>Lưu</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ListMenu;
