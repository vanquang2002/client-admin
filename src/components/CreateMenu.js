import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Alert, Table, Col, Row } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";

const CreateMenu = () => {
    const [foodName, setFoodName] = useState('');
    const [drinkName, setDrinkName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [latestMenu, setLatestMenu] = useState(null);
    const [editFoodIndex, setEditFoodIndex] = useState(-1);
    const [newFoodName, setNewFoodName] = useState('');
    const [editDescriptionIndex, setEditDescriptionIndex] = useState(-1);
    const [newDescription, setNewDescription] = useState('');
    const [editDrinkIndex, setEditDrinkIndex] = useState(-1);
    const [newDrinkName, setNewDrinkName] = useState('');
    const [editPriceIndex, setEditPriceIndex] = useState(-1);
    const [newPrice, setNewPrice] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Gán giá trị 'none' cho drinkName và description nếu không có giá trị nhập
        const updatedDrinkName = drinkName.trim() === '' ? 'none' : drinkName;
        const updatedDescription = description.trim() === '' ? 'none' : description;

        const newMenu = {
            foodName: foodName.split(',').map((item) => item.trim()),
            drinkName: updatedDrinkName,
            price,
            description: updatedDescription,
        };

        try {
            const res = await axios.post('https://server-j956.onrender.com/menus', newMenu);
            setMessage('Menu created successfully!');
            const menuId = res.data._id;
            fetchMenuById(menuId);
            setFoodName('');
            setDrinkName('');
            setPrice('');
            setDescription('');
        } catch (error) {
            setMessage('Failed to create menu. Please try again.');
        }
    };


    const fetchMenuById = async (menuId) => {
        try {
            const res = await axios.get(`https://server-j956.onrender.com/menus/${menuId}`);
            setLatestMenu(res.data);
        } catch (error) {
            console.error('Failed to fetch menu by ID:', error);
        }
    };

    const handleDeleteFood = async (foodIndex) => {
        try {
            const updatedMenu = { ...latestMenu };
            updatedMenu.foodName.splice(foodIndex, 1);
            await axios.put(`https://server-j956.onrender.com/menus/${latestMenu._id}`, updatedMenu);
            setLatestMenu(updatedMenu);
        } catch (error) {
            console.error('Failed to delete food item:', error);
        }
    };

    const handleEditFood = (foodIndex) => {
        setEditFoodIndex(foodIndex);
        setNewFoodName(latestMenu.foodName[foodIndex]);
    };

    const handleSaveFoodEdit = async () => {
        if (editFoodIndex === -1 || newFoodName.trim() === '') return;

        try {
            const updatedMenu = { ...latestMenu };
            updatedMenu.foodName[editFoodIndex] = newFoodName;
            await axios.put(`https://server-j956.onrender.com/menus/${latestMenu._id}`, updatedMenu);
            setLatestMenu(updatedMenu);
            setEditFoodIndex(-1);
            setNewFoodName('');
        } catch (error) {
            console.error('Failed to update food item:', error);
        }
    };

    const handleAddFood = async () => {
        if (newFoodName.trim() === '') return;

        try {
            const updatedMenu = { ...latestMenu };
            updatedMenu.foodName.push(newFoodName);
            await axios.put(`https://server-j956.onrender.com/menus/${latestMenu._id}`, updatedMenu);
            setLatestMenu(updatedMenu);
            setNewFoodName('');
        } catch (error) {
            console.error('Failed to add food item:', error);
        }
    };

    const handleEditDrink = (index) => {
        setEditDrinkIndex(index);
        setNewDrinkName(latestMenu.drinkName);
    };

    const handleSaveDrinkEdit = async () => {
        if (editDrinkIndex === -1 || newDrinkName.trim() === '') return;

        try {
            const updatedMenu = { ...latestMenu, drinkName: newDrinkName };
            await axios.put(`https://server-j956.onrender.com/menus/${latestMenu._id}`, updatedMenu);
            setLatestMenu(updatedMenu);
            setEditDrinkIndex(-1);
            setNewDrinkName('');
        } catch (error) {
            console.error('Failed to update drink:', error);
        }
    };

    const handleEditPrice = (index) => {
        setEditPriceIndex(index);
        setNewPrice(latestMenu.price);
    };

    const handleSavePriceEdit = async () => {
        if (editPriceIndex === -1 || newPrice.trim() === '') return;

        try {
            const updatedMenu = { ...latestMenu, price: newPrice };
            await axios.put(`https://server-j956.onrender.com/menus/${latestMenu._id}`, updatedMenu);
            setLatestMenu(updatedMenu);
            setEditPriceIndex(-1);
            setNewPrice('');
        } catch (error) {
            console.error('Failed to update price:', error);
        }
    };

    const handleEditDescription = () => {
        setEditDescriptionIndex(0);
        setNewDescription(latestMenu.description);
    };

    const handleSaveDescriptionEdit = async () => {
        if (editDescriptionIndex === -1 || newDescription.trim() === '') return;

        try {
            const updatedMenu = { ...latestMenu, description: newDescription };
            await axios.put(`https://server-j956.onrender.com/menus/${latestMenu._id}`, updatedMenu);
            setLatestMenu(updatedMenu);
            setEditDescriptionIndex(-1);
            setNewDescription('');
        } catch (error) {
            console.error('Failed to update description:', error);
        }
    };

    const handleCleanAll = async () => {
        if (window.confirm('Are you sure you want to delete all menu items?')) {
            try {
                await axios.delete(`https://server-j956.onrender.com/menus/${latestMenu._id}`);
                setLatestMenu(null);
                setMessage('All menu items have been deleted successfully.');
            } catch (error) {
                console.error('Failed to delete all menu items:', error);
            }
        }
    };

    return (
        <Container className="mt-5">
            <Row>
                <Col lg={6}>
                    <h2>Create New Menu</h2>
                    {message && <Alert variant={message.includes('successfully') ? 'success' : 'danger'}>{message}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formFoodName">
                            <Form.Label className='text-right'>Food Name (separate by commas for multiple):</Form.Label>
                            <Form.Control
                                as="textarea"
                                value={foodName}
                                onChange={(e) => setFoodName(e.target.value)}
                                rows={3}
                                placeholder="Enter food names"
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formDrinkName">
                            <Form.Label>Drink Name:</Form.Label>
                            <Form.Control
                                type="text"
                                value={drinkName}
                                onChange={(e) => setDrinkName(e.target.value)}
                                placeholder="Enter drink name"

                            />
                        </Form.Group>

                        <Form.Group controlId="formPrice">
                            <Form.Label>Price:</Form.Label>
                            <Form.Control
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="Enter price"
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formDescription">
                            <Form.Label>Description:</Form.Label>
                            <Form.Control
                                as="textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Enter description"

                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="mt-3">
                            Create Menu
                        </Button>
                    </Form>
                </Col>

                <Col lg={6} className='bg-secondary rounded-5'>
                    <h4 className='text-white'>New Menu</h4>
                    {latestMenu && (
                        <div>
                            <Table bordered>
                                <thead>
                                    <tr>
                                        <th>Food</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestMenu.foodName.map((foodItem, foodIndex) => (
                                        <tr key={foodIndex}>
                                            <td>
                                                {editFoodIndex === foodIndex ? (
                                                    <Form.Control
                                                        type="text"
                                                        value={newFoodName}
                                                        onChange={(e) => setNewFoodName(e.target.value)}
                                                    />
                                                ) : (
                                                    foodItem
                                                )}
                                            </td>
                                            <td>
                                                {editFoodIndex === foodIndex ? (
                                                    <Button variant="success" size="sm" onClick={handleSaveFoodEdit}>
                                                        Save
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="warning"
                                                            size="sm"
                                                            onClick={() => handleEditFood(foodIndex)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteFood(foodIndex)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            <Form inline className='mb-3'>
                                <Form.Control
                                    type="text"
                                    value={newFoodName}
                                    onChange={(e) => setNewFoodName(e.target.value)}
                                    placeholder="Add new food"
                                    style={{ flex: '1' }}
                                />
                                <Button variant="success" onClick={handleAddFood}>
                                    Add Food
                                </Button>
                            </Form>

                            <Table bordered>
                                <thead>
                                    <tr>
                                        <th>Drink Name</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            {editDrinkIndex === -1 ? (
                                                latestMenu.drinkName
                                            ) : (
                                                <Form.Control
                                                    type="text"
                                                    value={newDrinkName}
                                                    onChange={(e) => setNewDrinkName(e.target.value)}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            {editDrinkIndex === -1 ? (
                                                <Button variant="info" onClick={() => handleEditDrink(0)} size="sm">
                                                    Edit
                                                </Button>
                                            ) : (
                                                <Button variant="success" onClick={handleSaveDrinkEdit} size="sm">
                                                    Save
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>

                            <Table bordered>
                                <thead>
                                    <tr>
                                        <th>Price</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            {editPriceIndex === -1 ? (
                                                latestMenu.price
                                            ) : (
                                                <Form.Control
                                                    type="number"
                                                    value={newPrice}
                                                    onChange={(e) => setNewPrice(e.target.value)}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            {editPriceIndex === -1 ? (
                                                <Button variant="info" onClick={() => handleEditPrice(0)} size="sm">
                                                    Edit
                                                </Button>
                                            ) : (
                                                <Button variant="success" onClick={handleSavePriceEdit} size="sm">
                                                    Save
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>

                            <Table bordered>
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            {editDescriptionIndex === -1 ? (
                                                latestMenu.description
                                            ) : (
                                                <Form.Control
                                                    as="textarea"
                                                    value={newDescription}
                                                    onChange={(e) => setNewDescription(e.target.value)}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            {editDescriptionIndex === -1 ? (
                                                <Button variant="info" onClick={handleEditDescription} size="sm">
                                                    Edit
                                                </Button>
                                            ) : (
                                                <Button variant="success" onClick={handleSaveDescriptionEdit} size="sm">
                                                    Save
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>

                            <Button variant="danger" onClick={handleCleanAll} className='rounded mt-3'>
                                Delete All Menu Items
                            </Button>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default CreateMenu;
