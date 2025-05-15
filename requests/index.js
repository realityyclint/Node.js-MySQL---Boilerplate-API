const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');

router.post('/', authorize(), create);
router.get('/', authorize(Role.Admin), getAll);
router.get('/:id', authorize(), getById);
router.get('/employee/:employeeId', authorize(), getByEmployeeId);
router.put('/:id', authorize(Role.Admin), update);
router.delete('/:id', authorize(Role.Admin), _delete);

async function create(req, res, next) {
    try {
        if (![Role.Admin, Role.Staff].includes(req.user.role)) {
            return res.status(403).json({ message: 'Only Admin or Staff can create requests' });
        }

        let employee;

        // Admin can specify employeeId directly
        if (req.user.role === Role.Admin && req.body.employeeId) {
            employee = await db.Employee.findByPk(req.body.employeeId);
            if (!employee) {
                return res.status(404).json({ message: 'Employee not found with provided ID' });
            }
        } else {
            // Staff gets linked to their own account
            employee = await db.Employee.findOne({ where: { accountId: req.user.id } });
            if (!employee) {
                return res.status(404).json({ message: 'Employee not found for this account' });
            }
        }

        const { items, employeeId, ...requestData } = req.body;

        const request = await db.Request.create({
            ...requestData,
            employeeId: employee.id
        });

        if (items && items.length > 0) {
            const itemsWithRequestId = items.map(item => ({
                ...item,
                requestId: request.id
            }));
            await db.RequestItem.bulkCreate(itemsWithRequestId);
        }

        res.status(201).json(request);
    } catch (err) {
        next(err);
    }
}


async function getAll(req, res, next) {
    try {
        const requests = await db.Request.findAll({
            include: [{ model: db.RequestItem }, { model: db.Employee }]
        });
        res.json(requests);
    } catch (err) { next(err); }
}

async function getById(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id, {
            include: [{ model: db.RequestItem }, { model: db.Employee }]
        });
        if (!request) throw new Error('Request not found');
        if (req.user.role !== Role.Admin && request.employeeId !== req.user.employeeId) {
            throw new Error('Unauthorized');
        }
        res.json(request);
    } catch (err) { next(err); }
}

async function getByEmployeeId(req, res, next) {
    try {
        const requests = await db.Request.findAll({
            where: { employeeId: req.params.employeeId },
            include: [{ model: db.RequestItem }]
        });
        res.json(requests);
    } catch (err) { next(err); }
}

async function update(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id);
        if (!request) throw new Error('Request not found');
        await request.update(req.body);
        if (req.body.items) {
            await db.RequestItem.destroy({ where: { requestId: request.id } });
            await db.RequestItem.bulkCreate(req.body.items.map(item => ({
                ...item,
                requestId: request.id
            })));
        }
        res.json(request);
    } catch (err) { next(err); }
}

async function _delete(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id);
        if (!request) throw new Error('Request not found');
        await request.destroy();
        res.json({ message: 'Request deleted' });
    } catch (err) { next(err); }
}

module.exports = router;
