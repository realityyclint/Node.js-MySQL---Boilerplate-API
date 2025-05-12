const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');

router.post('/', authorize(Role.Admin), create);
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(Role.Admin), update);
router.delete('/:id', authorize(Role.Admin), _delete);
router.post('/:id/transfer', authorize(Role.Admin), transfer);

async function create(req, res, next) {
    try {
        const employee = await db.Employee.create(req.body);
        res.status(201).json(employee);
    } catch (err) { next(err); }
}

async function getAll(req, res, next) {
    try {
        const employees = await db.Employee.findAll({
            attributes: ['id', 'position', 'accountId', 'departmentId', 'status', 'createdAt', 'updatedAt'],
            include: [
                { model: db.Department, as: 'Department', attributes: ['name'] },
                { model: db.Account, as: 'Account', attributes: ['email'] }
            ]
        });

        const modifiedEmployees = employees.map(emp => {
            const data = emp.toJSON();
            data.hireDate = data.createdAt?.toISOString().split('T')[0];
            return data;
        });

        res.json(modifiedEmployees);
    } catch (err) { next(err); }
}

async function getById(req, res, next) {
    try {
        const employee = await db.Employee.findByPk(req.params.id, {
            attributes: ['id', 'position', 'accountId', 'departmentId', 'status', 'createdAt', 'updatedAt'],
            include: [
                { model: db.Department, as: 'Department', attributes: ['name'] },
                { model: db.Account, as: 'Account', attributes: ['email'] }
            ]
        });

        if (!employee) throw new Error('Employee not found');

        const data = employee.toJSON();
        data.hireDate = data.createdAt?.toISOString().split('T')[0];

        res.json(data);
    } catch (err) { next(err); }
}

async function update(req, res, next) {
    try {
        const employee = await db.Employee.findByPk(req.params.id);
        if (!employee) throw new Error('Employee not found');
        await employee.update(req.body);
        res.json(employee);
    } catch (err) { next(err); }
}

async function _delete(req, res, next) {
    try {
        const employee = await db.Employee.findByPk(req.params.id);
        if (!employee) throw new Error('Employee not found');
        await employee.destroy();
        res.json({ message: 'Employee deleted' });
    } catch (err) { next(err); }
}

async function transfer(req, res, next) {
    try {
        const employee = await db.Employee.findByPk(req.params.id);
        if (!employee) throw new Error('Employee not found');
        await employee.update({ departmentId: req.body.departmentId });
        await db.Workflow.create({
            employeeId: employee.id,
            type: 'Transfer',
            details: { newDepartmentId: req.body.departmentId }
        });
        res.json({ message: 'Employee transferred' });
    } catch (err) { next(err); }
}

module.exports = router;
