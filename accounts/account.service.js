const config = require('../config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const sendEmail = require('_helpers/send-email');
const db = require('_helpers/db');
const Role = require('_helpers/role');
const { Department } = db;  // Import the Department model

module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    getDepartments,        // Added to handle department-related actions
    createDepartment,      // Added to handle creating a new department
    updateDepartment,      // Added to handle updating a department
    deleteDepartment,      // Added to handle deleting a department
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    transferEmployee,
    getRequests,
    getRequestById,
    createRequest,
    updateRequest,
    deleteRequest
};

// Get all requests
async function getRequests(req, res, next) {
    try {
        const requests = await db.Request.findAll({
            include: [
                { model: db.Employee, as: 'Employee' },
                { model: db.RequestItem } // Include associated items
            ]
        });
        res.json(requests);
    } catch (err) {
        next(err);
    }
}

// Get request by ID
async function getRequestById(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id, {
            include: [
                { model: db.Employee, as: 'Employee' },
                { model: db.RequestItem }
            ]
        });

        if (!request) return res.status(404).json({ message: 'Request not found' });

        res.json(request);
    } catch (err) {
        next(err);
    }
}

// Create new request
async function createRequest(req, res, next) {
    try {
        if (![Role.Admin, Role.Staff].includes(req.user.role)) {
            return res.status(403).json({ message: 'Only Admin or Staff can create requests' });
        }

        const employee = await db.Employee.findOne({ where: { accountId: req.user.id } });

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found for this account' });
        }

        const { items, ...requestData } = req.body;

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


// Update request
async function updateRequest(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        await request.update(req.body);

        if (req.body.items) {
            await db.RequestItem.destroy({ where: { requestId: request.id } });

            const updatedItems = req.body.items.map(item => ({
                ...item,
                requestId: request.id
            }));

            await db.RequestItem.bulkCreate(updatedItems);
        }

        res.json(request);
    } catch (err) {
        next(err);
    }
}

// Delete request
async function deleteRequest(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        await request.destroy();
        res.json({ message: 'Request deleted' });
    } catch (err) {
        next(err);
    }
}


// Get all employees
async function getEmployees(req, res, next) {
    try {
        const employees = await db.Employee.findAll({
            include: [{ model: db.Department }]
        });

        res.json(employees);
    } catch (err) {
        next(err);
    }
}

// Get single employee by ID
async function getEmployeeById(req, res, next) {
    try {
        const employee = await db.Employee.findByPk(req.params.id, {
            include: [{ model: db.Department }]
        });

        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        res.json(employee);
    } catch (err) {
        next(err);
    }
}

// Create a new employee
async function createEmployee(req, res, next) {
    try {
        const employee = await db.Employee.create(req.body);
        res.status(201).json(employee);
    } catch (err) {
        next(err);
    }
}

// Update employee
async function updateEmployee(req, res, next) {
    try {
        const employee = await db.Employee.findByPk(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        await employee.update(req.body);
        res.json(employee);
    } catch (err) {
        next(err);
    }
}

// Delete employee
async function deleteEmployee(req, res, next) {
    try {
        const employee = await db.Employee.findByPk(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        await employee.destroy();
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        next(err);
    }
}

// Transfer employee to another department
async function transferEmployee(req, res, next) {
    try {
        const employee = await db.Employee.findByPk(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        await employee.update({ departmentId: req.body.departmentId });
        await db.Workflow.create({
            employeeId: employee.id,
            type: 'Transfer',
            details: { newDepartmentId: req.body.departmentId }
        });

        res.json({ message: 'Employee transferred' });
    } catch (err) {
        next(err);
    }
}


// Added: Get all departments
async function getDepartments(req, res, next) {
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
}

// Added: Create a new department
async function createDepartment(req, res, next) {
    try {
        const department = await db.Department.create(req.body);
        res.status(201).json(department);
    } catch (err) {
        next(err);
    }
}

// Added: Update an existing department
async function updateDepartment(req, res, next) {
    try {
        const department = await db.Department.findByPk(req.params.id);
        if (!department) return res.status(404).json({ message: 'Department not found' });

        await department.update(req.body);
        res.json(department);
    } catch (err) {
        next(err);
    }
}

// Added: Delete a department
async function deleteDepartment(req, res, next) {
    try {
        const department = await db.Department.findByPk(req.params.id);
        if (!department) return res.status(404).json({ message: 'Department not found' });

        await department.destroy();
        res.json({ message: 'Department deleted' });
    } catch (err) {
        next(err);
    }
}

async function authenticate({ email, password, ipAddress }) {
    const account = await db.Account.scope('withHash').findOne({ where: { email } });

    if (!account || !account.isVerified || !(await bcrypt.compare(password, account.passwordHash))) {
        throw 'Email or password is incorrect';
    }

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const account = await refreshToken.getAccount();

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(account);

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function register(params, origin) {
    // validate
    if (await db.Account.findOne({ where: { email: params.email } })) {
        // send already registered error in email to prevent account enumeration
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }

    // create account object
    const account = new db.Account(params);

    // first registered account is an admin
    const isFirstAccount = (await db.Account.count()) === 0;
    account.role = isFirstAccount ? Role.Admin : Role.User;
    account.verificationToken = randomTokenString();

    // hash password
    account.passwordHash = await hash(params.password);

    // save account
    await account.save();

    // send email
    await sendVerificationEmail(account, origin);
}

async function verifyEmail({ token }) {
    const account = await db.Account.findOne({ where: { verificationToken: token } });

    if (!account) throw 'Verification failed';

    account.verified = Date.now();
    account.verificationToken = null;
    await account.save();
}

async function forgotPassword({ email }, origin) {
    const account = await db.Account.findOne({ where: { email } });

    // always return ok response to prevent email enumeration
    if (!account) return;

    // create reset token that expires after 24 hours
    account.resetToken = randomTokenString();
    account.resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await account.save();

    // send email
    await sendPasswordResetEmail(account, origin);
}

async function validateResetToken({ token }) {
    const account = await db.Account.findOne({
        where: {
            resetToken: token,
            resetTokenExpires: { [Op.gt]: Date.now() }
        }
    });

    if (!account) throw 'Invalid token';

    return account;
}

async function resetPassword({ token, password }) {
    const account = await validateResetToken({ token });

    // update password and remove reset token
    account.passwordHash = await hash(password);
    account.passwordReset = Date.now();
    account.resetToken = null;
    await account.save();
}

async function getAll() {
    const accounts = await db.Account.findAll();
    return accounts.map(x => basicDetails(x));
}

async function getById(id) {
    const account = await getAccount(id);
    return basicDetails(account);
}

async function create(params) {
    // validate
    if (await db.Account.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const account = new db.Account(params);
    account.verified = Date.now();

    // hash password
    account.passwordHash = await hash(params.password);

    // save account
    await account.save();

    return basicDetails(account);
}

async function update(id, params) {
    const account = await getAccount(id);

    // validate (if email was changed)
    if (params.email && account.email !== params.email && await db.Account.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    // copy params to account and save
    Object.assign(account, params);
    account.updated = Date.now();
    await account.save();

    return basicDetails(account);
}

async function _delete(id) {
    const account = await getAccount(id);
    await account.destroy();
}

// helper functions
async function getAccount(id) {
    const account = await db.Account.findByPk(id);
    console.log(account);
    if (!account) throw 'Account not found';
    return account;
}

async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({ where: { token } });
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

async function hash(password) {
    return await bcrypt.hash(password, 10);
}

function generateJwtToken(account) {
    // create a jwt token containing the account id that expires in 15 minutes
    return jwt.sign({ sub: account.id, id: account.id }, config.secret, { expiresIn: '15m' });
}

function generateRefreshToken(account, ipAddress) {
    // create a refresh token that expires in 7 days
    return new db.RefreshToken({
        accountId: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account) {
    const { id, title, firstName, lastName, email, role, created, updated, isVerified } = account;
    return { id, title, firstName, lastName, email, role, created, updated, isVerified };
}

async function sendVerificationEmail(account, origin) {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;
        message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to verify your email address with the api route:</p>
                   <p><code>${account.verificationToken}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification API - Verify Email',
        html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`
    });
}

async function sendPasswordResetEmail(account, origin) {
    let message;
    if (origin) {
        const resetUrl = `${origin}/account/reset-password?token=${account.resetToken}`;
        message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                   <p><code>${account.resetToken}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification API - Reset Password',
        html: `<h4>Reset Password Email</h4>
               ${message}`
    });
}
