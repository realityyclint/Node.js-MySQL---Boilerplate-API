const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');

// POST /departments – Admin only
router.post('/', authorize(Role.Admin), async (req, res, next) => {
    try {
        const department = await db.Department.create(req.body);
        res.status(201).json(department);
    } catch (err) {
        next(err);
    }
});

// GET /departments – Authenticated
router.get('/', authorize(), async (req, res, next) => {
    try {
        const departments = await db.Department.findAll({
            include: [{ model: db.Employee, as: 'Employees', attributes: ['id'] }]
        });

        const result = departments.map(dept => ({
            ...dept.toJSON(),
            employeeCount: dept.Employees?.length || 0
        }));

        res.json(result);
    } catch (err) {
        next(err);
    }
});

// GET /departments/:id – Authenticated
router.get('/:id', authorize(), async (req, res, next) => {
    try {
        const department = await db.Department.findByPk(req.params.id, {
            include: [{ model: db.Employee, as: 'Employees', attributes: ['id'] }]
        });

        if (!department) return res.status(404).json({ message: 'Department not found' });

        res.json({
            ...department.toJSON(),
            employeeCount: department.Employees?.length || 0
        });
    } catch (err) {
        next(err);
    }
});

// PUT /departments/:id – Admin only
router.put('/:id', authorize(Role.Admin), async (req, res, next) => {
    try {
        const department = await db.Department.findByPk(req.params.id);
        if (!department) return res.status(404).json({ message: 'Department not found' });

        await department.update(req.body);
        res.json(department);
    } catch (err) {
        next(err);
    }
});

// DELETE /departments/:id – Admin only
router.delete('/:id', authorize(Role.Admin), async (req, res, next) => {
    try {
        const department = await db.Department.findByPk(req.params.id);
        if (!department) return res.status(404).json({ message: 'Department not found' });

        await department.destroy();
        res.json({ message: 'Department deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
